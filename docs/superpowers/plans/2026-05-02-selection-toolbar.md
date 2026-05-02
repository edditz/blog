# Selection Floating Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating toolbar that appears near selected text in the TipTap editor, providing contextual formatting actions (bold, italic, strikethrough, code, link, blockquote, code block) using HeroUI v3 components.

**Architecture:** Use TipTap's built-in `BubbleMenu` from `@tiptap/react` for selection-aware positioning. A new `SelectionToolbar.tsx` component renders HeroUI Buttons with Tooltips inside the BubbleMenu. Link input is handled inline within the toolbar (toggle to URL input mode). The existing top `EditorToolbar` stays unchanged.

**Tech Stack:** TipTap v2.6 (`BubbleMenu`, `@tiptap/extension-link`), HeroUI v3 (`Button`, `Tooltip`, `Input`), lucide-react icons, React 19

---

### Task 1: Install @tiptap/extension-link

**Files:**
- Modify: `blog-admin/packages/client/package.json`

- [ ] **Step 1: Install the dependency**

```bash
cd /Users/eddie/projects/myblog/blog-admin && pnpm add @tiptap/extension-link -F @blog-admin/client
```

- [ ] **Step 2: Verify installation**

```bash
grep "@tiptap/extension-link" blog-admin/packages/client/package.json
```

Expected: `"@tiptap/extension-link": "^2.x.x"` appears in dependencies.

- [ ] **Step 3: Commit**

```bash
git add blog-admin/packages/client/package.json blog-admin/pnpm-lock.yaml
git commit -m "deps: add @tiptap/extension-link for selection toolbar"
```

---

### Task 2: Create SelectionToolbar component

**Files:**
- Create: `blog-admin/packages/client/src/components/editor/SelectionToolbar.tsx`

This component renders 7 formatting action buttons arranged in two groups (inline marks + block actions) separated by a divider. Each button has a Tooltip. The link button toggles an inline URL input row below the buttons.

- [ ] **Step 1: Create the file with the complete component**

```tsx
import { useState } from 'react'
import { useCurrentEditor } from '@tiptap/react'
import { Button, Input, Tooltip } from '@heroui/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Link2Off,
  Quote,
  CodeXml,
  Check,
} from 'lucide-react'

export default function SelectionToolbar() {
  const { editor } = useCurrentEditor()
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  if (!editor) return null

  const handleLinkClick = () => {
    if (showLinkInput) {
      setShowLinkInput(false)
      return
    }
    const attrs = editor.getAttributes('link')
    setLinkUrl(attrs.href || '')
    setShowLinkInput(true)
  }

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = linkUrl.trim()
    if (!trimmed) {
      editor.chain().focus().unsetLink().run()
    } else {
      const href = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
      editor.chain().focus().setLink({ href }).run()
    }
    setShowLinkInput(false)
  }

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run()
    setShowLinkInput(false)
  }

  const inlineItems = [
    {
      icon: Bold,
      label: '加粗',
      isActive: () => editor.isActive('bold'),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: '斜体',
      isActive: () => editor.isActive('italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Strikethrough,
      label: '删除线',
      isActive: () => editor.isActive('strike'),
      action: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: Code,
      label: '行内代码',
      isActive: () => editor.isActive('code'),
      action: () => editor.chain().focus().toggleCode().run(),
    },
  ]

  const blockItems = [
    {
      icon: Link,
      label: '链接',
      isActive: () => editor.isActive('link'),
      action: handleLinkClick,
    },
    {
      icon: Quote,
      label: '引用',
      isActive: () => editor.isActive('blockquote'),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: CodeXml,
      label: '代码块',
      isActive: () => editor.isActive('codeBlock'),
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ]

  const renderButton = ({
    icon: Icon,
    label,
    isActive,
    action,
  }: {
    icon: typeof Bold
    label: string
    isActive: () => boolean
    action: () => void
  }) => (
    <Tooltip key={label} delay={300}>
      <Button
        isIconOnly
        size="sm"
        variant={isActive() ? 'secondary' : 'ghost'}
        onPress={action}
      >
        <Icon size={15} />
      </Button>
      <Tooltip.Content showArrow placement="bottom">
        {label}
      </Tooltip.Content>
    </Tooltip>
  )

  return (
    <div className="bg-surface border border-default rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center gap-0.5 p-1">
        {inlineItems.map(renderButton)}
        <div className="w-px h-5 bg-default mx-1" />
        {blockItems.map(renderButton)}
      </div>
      {showLinkInput && (
        <form
          onSubmit={handleLinkSubmit}
          className="flex items-center gap-1 px-1 pb-1 pt-0"
        >
          <Input
            autoFocus
            placeholder="输入链接地址..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            size="sm"
            className="flex-1"
          />
          {editor.isActive('link') && (
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={handleUnlink}
            >
              <Link2Off size={14} />
            </Button>
          )}
          <Button isIconOnly size="sm" variant="secondary" type="submit">
            <Check size={14} />
          </Button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/eddie/projects/myblog/blog-admin/packages/client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add blog-admin/packages/client/src/components/editor/SelectionToolbar.tsx
git commit -m "feat: add SelectionToolbar with inline link input"
```

---

### Task 3: Integrate BubbleMenu into WysiwygEditor

**Files:**
- Modify: `blog-admin/packages/client/src/components/editor/WysiwygEditor.tsx`

Add Link extension and BubbleMenu with SelectionToolbar to the editor.

- [ ] **Step 1: Update WysiwygEditor.tsx**

The full updated file:

```tsx
import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import EditorToolbar from './EditorToolbar'
import SlashCommand from './SlashCommand'
import SelectionToolbar from './SelectionToolbar'

interface Props {
  value: string
  onChange: (value: string) => void
  title: string
  onTitleChange: (title: string) => void
}

const mdxComponents = [
  {
    label: 'Callout',
    description: '提示框（info/warning/error）',
  },
  {
    label: 'Tabs',
    description: '标签页组件',
  },
  {
    label: 'Quote',
    description: '引用块',
  },
  {
    label: 'Code Block',
    description: '代码块',
  },
  {
    label: 'Image',
    description: '插入图片',
  },
]

export default function WysiwygEditor({ value, onChange, title, onTitleChange }: Props) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '输入 / 插入组件...' }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown())
    },
  })

  useEffect(() => {
    if (!editor) return
    const currentMarkdown = editor.storage.markdown.getMarkdown()
    if (currentMarkdown !== value) {
      editor.commands.setContent(value, false)
    }
  }, [editor, value])

  const getComponentActions = useCallback(() => {
    if (!editor) return []
    return mdxComponents.map((comp) => ({
      ...comp,
      action: () => {
        const text = `<${comp.label}>...</${comp.label}>`
        editor.chain().focus().insertContent(text).run()
      },
    }))
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && editor.isFocused) {
        const { view } = editor
        const { from } = view.state.selection
        const coords = view.coordsAtPos(from)
        setSlashMenu({ top: coords.bottom + 4, left: coords.left })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor])

  return (
    <div className="relative h-full flex flex-col">
      <EditorToolbar />
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="文章标题"
          className="w-full px-4 pt-4 pb-2 text-[2em] font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
        />
        <EditorContent editor={editor} className="px-4" />
      </div>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150, placement: 'top' }}
          shouldShow={({ state }) => {
            const { empty } = state.selection
            return !empty
          }}
        >
          <SelectionToolbar />
        </BubbleMenu>
      )}
      {slashMenu && (
        <SlashCommand
          items={getComponentActions()}
          position={slashMenu}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/eddie/projects/myblog/blog-admin/packages/client && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Verify the dev server starts**

```bash
cd /Users/eddie/projects/myblog/blog-admin && pnpm --filter @blog-admin/client dev
```

Expected: Vite dev server starts without errors. Open the editor page, select text, verify the floating toolbar appears.

- [ ] **Step 4: Commit**

```bash
git add blog-admin/packages/client/src/components/editor/WysiwygEditor.tsx
git commit -m "feat: integrate BubbleMenu with selection toolbar into editor"
```

---

### Task 4: Manual verification

- [ ] **Step 1: Test all toolbar actions**

Open the editor at `http://localhost:5173/posts/new`:

1. Type some text, select it → floating toolbar appears above selection
2. Click **Bold** → text becomes `**bold**` in markdown
3. Click **Italic** → text becomes `*italic*`
4. Click **Strikethrough** → text becomes `~~strike~~`
5. Click **Inline Code** → text becomes `` `code` ``
6. Click **Link** → inline URL input appears below buttons, enter URL, click confirm → text becomes `[text](url)`
7. Click **Quote** → text becomes `> quote`
8. Click **Code Block** → text becomes code block
9. Hover each button → Tooltip shows label
10. Click away (deselect) → toolbar disappears

- [ ] **Step 2: Test link editing**

1. Select text that already has a link → toolbar shows link button as active
2. Click link button → inline input shows current URL
3. Change URL → click confirm → link updates
4. Click unlink icon (Link2Off) → link removed

- [ ] **Step 3: Verify existing toolbar still works**

The top `EditorToolbar` should continue working independently of the floating toolbar.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: address selection toolbar issues from manual testing"
```
