# MDX 组件接入编辑器方法论

## 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    博客前台渲染层                          │
│  [...slug].astro  →  <Content components={{ Xxx }} />   │
└───────────────────────────┬─────────────────────────────┘
                            │ .mdx 文件
┌───────────────────────────┴─────────────────────────────┐
│                    MDX 解析层                             │
│  mdxParser.ts                                           │
│  ├─ mdxToTipTap()    →  <Xxx prop="v"> → <mdx-component│
│  └─ tipTapToMdx()    →  <mdx-component> → <Xxx prop="v"│
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    TipTap 扩展层                          │
│  MdxComponent.ts  (通用节点，处理所有 MDX 组件)            │
│  ├─ viewMap 路由: 12 个专用 XxxView → WYSIWYG 渲染       │
│  └─ 降级渲染: MdxComponentView → 卡片式预览               │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    编辑器 UI 层                           │
│  WysiwygEditor.tsx                                      │
│  ├─ mdxComponents[]  →  斜杠菜单注册                     │
│  └─ getComponentActions()  →  插入 <mdx-component>      │
└─────────────────────────────────────────────────────────┘
```

## 组件渲染方式

所有 12 个 MDX 组件均有专用 `XxxView`，在编辑器中以 WYSIWYG 方式渲染。未知组件降级到 `MdxComponentView` 卡片预览。

| 组件 | View 文件 | 编辑方式 | 说明 |
|------|----------|---------|------|
| Callout | `CalloutView.tsx` | 内联编辑 title/slot，Modal 编辑 type | 4 种类型 (note/warning/tip/danger) |
| Quote | `QuoteView.tsx` | 内联编辑 content/author/title | 无 Modal，全部内联 |
| Tabs | `TabsView.tsx` | 内联编辑 tab labels，Modal 批量编辑 | 支持增删 tab |
| TabItem | `TabItemView.tsx` | 内联编辑 slot 内容 | 简单内容区域 |
| Steps | `StepsView.tsx` | 内联编辑 slot 内容 | 左边框步骤容器 |
| ProsCons | `ProsConsView.tsx` | 内联编辑每条 pros/cons | 支持增删条目 |
| LinkCard | `LinkCardView.tsx` | 内联编辑 title/description，Modal 编辑 href | 自动派生 domain |
| Figure | `FigureView.tsx` | 内联编辑 caption，Modal 编辑 src/alt | 图片预览 |
| YouTube | `YouTubeView.tsx` | Modal 编辑 id/start | 缩略图预览 |
| Divider | `DividerView.tsx` | 内联编辑 title | 水平分割线 |
| Badge | `BadgeView.tsx` | 内联编辑 content，Modal 编辑 href | self-closing |
| Separator | `SeparatorView.tsx` | 纯视觉展示 | 无 props，self-closing |

**降级规则：** 如果 `viewMap` 中找不到对应组件，`MdxComponent.ts` 会降级到通用 `MdxComponentView`（卡片预览），确保未知组件不会崩溃。

## 接入一个新组件的完整步骤

以接入一个假设的 `Card` 组件为例：

### Step 1: 创建 Astro 组件

`src/components/ui/Card.astro`

```astro
---
interface Props {
  title: string;
  variant?: 'default' | 'highlighted';
}
const { title, variant = 'default' } = Astro.props;
---
<div class:list={["rounded-lg border p-4", variant === 'highlighted' && 'border-primary']}>
  <h3>{title}</h3>
  <slot />
</div>
```

**关键：组件的 props 接口就是编辑器需要配置的 `defaultProps`。**

### Step 2: 注册到 mdxParser.ts

在 `COMPONENT_IMPORT_MAP` 中添加映射：

```ts
const COMPONENT_IMPORT_MAP: Record<string, string> = {
  // ...existing
  Card: 'Card.astro',
}
```

这一步让 `generateImports()` 能自动为使用了 Card 的文章生成 import 语句。

### Step 3: 注册到 WysiwygEditor 的斜杠菜单

在 `mdxComponents[]` 中添加：

```ts
{
  label: 'Card',
  description: '卡片容器',
  defaultProps: { title: 'Card Title', variant: 'default' },
  defaultSlot: '卡片内容...',
}
```

字段说明：
- `label` — 组件名，必须与 Astro 组件名一致
- `description` — 斜杠菜单中显示的描述
- `defaultProps` — 插入时的默认属性值
- `defaultSlot` — 插入时的默认 slot 内容（self-closing 组件留空）
- `selfClosing` — 可选，设为 `true` 表示无 slot 的自闭合组件

### Step 4: 注册到前台渲染页

`src/pages/posts/[...slug].astro`：

```astro
---
import Card from "@/components/ui/Card.astro";
// ...
---
<Content components={{ ..., Card }} />
```

**至此，组件已经可以在编辑器中插入并在前台正确渲染。** 但编辑器中只显示通用卡片预览。

### Step 5（可选）: 创建专用 NodeView

如果组件有可见的 slot 文本需要内联编辑，创建专用 View。

## 专用 NodeView 的实现模式（以 CalloutView 为参考）

### 核心设计原则

```
直接展示的内容 → contentEditable 内联编辑，保存在 onBlur
非展示的配置项 → hover 出 Pencil 按钮 → Modal 编辑
视觉保持干净   → 编辑区域无 focus 背景色变化
```

### 文件结构

```
blog-admin/packages/client/src/components/editor/
├── CalloutView.tsx      # Callout 专用 NodeView
├── QuoteView.tsx        # Quote 专用 NodeView
├── TabsView.tsx         # Tabs 专用 NodeView
├── TabItemView.tsx      # TabItem 专用 NodeView
├── StepsView.tsx        # Steps 专用 NodeView
├── ProsConsView.tsx     # ProsCons 专用 NodeView
├── LinkCardView.tsx     # LinkCard 专用 NodeView
├── FigureView.tsx       # Figure 专用 NodeView
├── YouTubeView.tsx      # YouTube 专用 NodeView
├── DividerView.tsx      # Divider 专用 NodeView
├── BadgeView.tsx        # Badge 专用 NodeView
├── SeparatorView.tsx    # Separator 专用 NodeView
├── MdxComponentView.tsx # 通用卡片预览（降级用）
├── WysiwygEditor.tsx    # 主编辑器
├── EditorToolbar.tsx    # 工具栏
├── SlashCommand.tsx     # 斜杠菜单
└── SelectionToolbar.tsx # 选中工具栏
```

### CalloutView 的关键实现拆解

**1) Props 解析**

```tsx
const propsParsed = (() => {
  try { return JSON.parse(node.attrs.props || '{}') }
  catch { return {} }
})()
const type = getCalloutType(propsParsed.type)   // 从 props 取配置
const title = propsParsed.title as string | undefined  // 从 props 取标题
const slot = (node.attrs.slot as string) || ''  // 从 slot 取正文
```

MdxComponent 节点统一存储为 `{ component, props, slot, selfClosing }` 四个属性。
- `props` 是 JSON 字符串，存放组件的 props
- `slot` 是纯文本，存放 `<slot />` 的内容

**2) 内联编辑 — contentEditable + onBlur**

```tsx
<div
  ref={titleRef}
  contentEditable
  suppressContentEditableWarning
  onBlur={handleTitleBlur}
  onKeyDown={handleKeyDown}
>
  {title || current.defaultTitle}
</div>
```

```tsx
const handleTitleBlur = useCallback(() => {
  const newTitle = titleRef.current?.textContent?.trim() ?? ''
  if (newTitle !== (title || '')) {
    updateAttributes({
      props: JSON.stringify({ ...propsParsed, title: newTitle }),
    })
  }
}, [propsParsed, title, updateAttributes])
```

**关键点：**
- 用 `useRef` 持有 DOM 引用
- `onBlur` 时读取 `textContent`，与旧值比较后调用 `updateAttributes`
- `updateAttributes` 是 TipTap NodeViewProps 提供的，直接更新节点属性
- `onKeyDown` 中 `e.stopPropagation()` 防止按键冒泡到编辑器

**3) 非展示配置 — Pencil 按钮 + Modal**

```tsx
{isHovered && (
  <button onClick={() => setIsDialogOpen(true)}>
    <Pencil size={14} />
  </button>
)}

<PropsEditDialog
  isOpen={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  type={type}
  onSave={handleTypeSave}
  savedScrollTop={savedScrollTop}
/>
```

Modal 中保存时：

```tsx
const handleTypeSave = useCallback((newType: CalloutType) => {
  updateAttributes({
    props: JSON.stringify({ ...propsParsed, type: newType }),
  })
}, [propsParsed, updateAttributes])
```

**4) Cmd+S 转发（关键细节）**

contentEditable 会拦截 Cmd+S，需要手动转发：

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      e.stopImmediatePropagation()
      // 重新 dispatch 一个不被拦截的事件
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's', code: 'KeyS',
        metaKey: e.metaKey, ctrlKey: e.ctrlKey,
        bubbles: true, cancelable: true,
      }))
    }
  }
  const opts: AddEventListenerOptions = { capture: true }
  titleRef.current?.addEventListener('keydown', handler, opts)
  contentRef.current?.addEventListener('keydown', handler, opts)
  return () => { /* cleanup */ }
}, [])
```

**5) 注册到 MdxComponent.ts**

在文件顶部 import 新 View，然后在 `viewMap` 中添加路由：

```tsx
import { CalloutView } from '@/components/editor/CalloutView'
import { QuoteView } from '@/components/editor/QuoteView'
// ...import 新 View

addNodeView() {
  const viewMap: Record<string, React.ComponentType<NodeViewProps>> = {
    Callout: CalloutView,
    Quote: QuoteView,
    // ...添加新组件
  }
  return ReactNodeViewRenderer((props: NodeViewProps) => {
    const component = props.node.attrs.component as string
    const View = viewMap[component]
    if (View) return React.createElement(View, props)
    return React.createElement(MdxComponentView, props) // 降级
  })
}
```

### 滚动位置恢复

Modal 打开时会触发编辑器滚动。CalloutView 的处理方式：

```tsx
// 打开前保存滚动位置
const container = document.querySelector('.overflow-y-auto')
setSavedScrollTop(container?.scrollTop ?? 0)
setIsDialogOpen(true)

// Modal 打开后恢复
useEffect(() => {
  if (isOpen) restoreScroll()
}, [isOpen, restoreScroll])

// 关闭时也恢复
const handleOpenChange = useCallback((open: boolean) => {
  if (!open) restoreScroll()
  onOpenChange(open)
}, [onOpenChange, restoreScroll])
```

## 通用 MdxComponentView（卡片预览）的渲染逻辑

对于不需要专用 View 的组件，`MdxComponentView` 提供统一的卡片式预览：

```
┌─────────────────────────────────┐
│ [Badge]  self-closing  content= │  ← 组件名标签 + 属性
│ "WCAG 2.2"                      │  ← slot 内容（截断到 120 字符）
└─────────────────────────────────┘
```

每种组件有独立的颜色方案（`COMPONENT_COLORS`），通过组件名映射。

## 数据流总结

```
用户输入 / 插入组件
       │
       ▼
SlashCommand.action()
       │
       ▼
editor.chain().insertContent('<mdx-component data-component="Xxx" data-props="..." data-slot="..." />')
       │
       ▼
TipTap 解析 → MdxComponent 节点 (component, props, slot, selfClosing)
       │
       ├─ viewMap[component] 存在 → 对应的 XxxView (WYSIWYG)
       └─ viewMap[component] 不存在 → MdxComponentView (卡片预览降级)
       │
       ▼
用户编辑 → updateAttributes({ props/slot })
       │
       ▼
onUpdate → editor.storage.markdown.getMarkdown()
       │
       ▼
tipTapToMdx() → <Xxx prop="value">slot</Xxx>
       │
       ▼
generateImports() → import Xxx from '@/components/ui/Xxx.astro';
       │
       ▼
onChange(fullContent) → 保存到后端
```

## Checklist

新增一个 MDX 组件的完整清单：

- [ ] 创建 `src/components/ui/Xxx.astro`，定义 props 和 slot
- [ ] 在 `mdxParser.ts` 的 `COMPONENT_IMPORT_MAP` 中添加映射
- [ ] 在 `WysiwygEditor.tsx` 的 `mdxComponents[]` 中添加菜单项
- [ ] 在 `[...slug].astro` 中 import 并注册到 `components={{}}`
- [ ] 创建 `XxxView.tsx` 专用 NodeView，支持内联编辑
- [ ] 在 `MdxComponent.ts` 中 import 并添加到 `viewMap`
- [ ] 测试：斜杠插入 → 编辑 → 保存 → 前台渲染

## 已实现的专用 View 列表

截至 2026-05-03，所有 12 个 MDX 组件均已接入专用 View：

| # | 组件 | View 文件 | 注册位置 |
|---|------|----------|---------|
| 1 | Callout | `CalloutView.tsx` | `MdxComponent.ts` viewMap |
| 2 | Quote | `QuoteView.tsx` | `MdxComponent.ts` viewMap |
| 3 | Tabs | `TabsView.tsx` | `MdxComponent.ts` viewMap |
| 4 | TabItem | `TabItemView.tsx` | `MdxComponent.ts` viewMap |
| 5 | Steps | `StepsView.tsx` | `MdxComponent.ts` viewMap |
| 6 | ProsCons | `ProsConsView.tsx` | `MdxComponent.ts` viewMap |
| 7 | LinkCard | `LinkCardView.tsx` | `MdxComponent.ts` viewMap |
| 8 | Figure | `FigureView.tsx` | `MdxComponent.ts` viewMap |
| 9 | YouTube | `YouTubeView.tsx` | `MdxComponent.ts` viewMap |
| 10 | Divider | `DividerView.tsx` | `MdxComponent.ts` viewMap |
| 11 | Badge | `BadgeView.tsx` | `MdxComponent.ts` viewMap |
| 12 | Separator | `SeparatorView.tsx` | `MdxComponent.ts` viewMap |
