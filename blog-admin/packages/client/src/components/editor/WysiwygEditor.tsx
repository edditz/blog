import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import { MdxComponent } from '@/extensions/MdxComponent'
import {
  extractImports,
  mdxToTipTap,
  tipTapToMdx,
  generateImports,
  collectComponents,
} from '@/utils/mdxParser'
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
    description: '提示框（note/warning/tip/danger）',
    defaultProps: { type: 'note' },
    defaultSlot: '在此输入提示内容...',
  },
  {
    label: 'Tabs',
    description: '标签页组件',
    defaultProps: { tabs: ['Tab 1', 'Tab 2'] },
    defaultSlot: '',
  },
  {
    label: 'TabItem',
    description: '标签页面板',
    defaultProps: {},
    defaultSlot: '在此输入标签内容...',
  },
  {
    label: 'Quote',
    description: '引用块',
    defaultProps: { author: 'Author' },
    defaultSlot: '在此输入引用内容...',
  },
  {
    label: 'ProsCons',
    description: '优缺点对比',
    defaultProps: { pros: ['Pro 1'], cons: ['Con 1'] },
    defaultSlot: '',
  },
  {
    label: 'LinkCard',
    description: '链接卡片',
    defaultProps: { href: 'https://example.com', title: 'Link Title' },
    defaultSlot: '',
  },
  {
    label: 'YouTube',
    description: 'YouTube 视频嵌入',
    defaultProps: { id: 'dQw4w9WgXcQ' },
    defaultSlot: '',
  },
  {
    label: 'Steps',
    description: '步骤/顺序容器',
    defaultProps: {},
    defaultSlot: '### Step 1\n描述...',
  },
  {
    label: 'Figure',
    description: '带说明的图片',
    defaultProps: { src: '/images/placeholder.png', alt: '描述' },
    defaultSlot: '',
  },
  {
    label: 'Divider',
    description: '带标题的分隔线',
    defaultProps: { title: 'Section Title' },
    defaultSlot: '',
  },
  {
    label: 'Separator',
    description: '装饰性分隔线',
    defaultProps: {},
    defaultSlot: '',
    selfClosing: true,
  },
  {
    label: 'Badge',
    description: '小标签/徽章',
    defaultProps: { content: 'Label' },
    defaultSlot: '',
    selfClosing: true,
  },
]

export default function WysiwygEditor({ value, onChange, title, onTitleChange }: Props) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number } | null>(null)
  const slashPosRef = useRef<{ from: number; to: number } | null>(null)
  const handleCloseRef = useRef<() => void>(() => {})
  const handleOpenRef = useRef<(editor: ReturnType<typeof useEditor>) => void>(() => {})
  const scrollRef = useRef<HTMLDivElement>(null)

  const isSlashOpenRef = useRef(false)
  const internalChangeRef = useRef(false)
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)
  const importsRef = useRef<string[]>([])

  const openSlashMenu = useCallback((editor: ReturnType<typeof useEditor>) => {
    if (!editor) return
    const { view } = editor
    const { from } = view.state.selection
    const coords = view.coordsAtPos(from)
    const menuWidth = 256
    const menuMaxHeight = 192
    const margin = 12

    let top = coords.bottom + 4
    let left = coords.left

    if (top + menuMaxHeight > window.innerHeight - margin) {
      top = coords.top - menuMaxHeight - 4
    }
    if (top < margin) {
      top = margin
    }
    if (left + menuWidth > window.innerWidth - margin) {
      left = window.innerWidth - menuWidth - margin
    }
    if (left < margin) {
      left = margin
    }

    slashPosRef.current = { from: from - 1, to: from }
    isSlashOpenRef.current = true
    setSlashMenu({ top, left })
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '输入 / 插入组件...' }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      MdxComponent,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
          const ed = editorRef.current
          if (!ed) return false
          const { from } = ed.state.selection
          const $pos = ed.state.doc.resolve(from)
          const textBefore = $pos.parent.textContent.slice(0, $pos.parentOffset)
          if (textBefore === '' || /\s$/.test(textBefore)) {
            requestAnimationFrame(() => handleOpenRef.current(ed))
          }
        }
        return false
      },
    },
    content: (() => {
      const { imports, body } = extractImports(value)
      importsRef.current = imports
      return mdxToTipTap(body)
    })(),
    onUpdate: ({ editor }) => {
      const raw = editor.storage.markdown.getMarkdown()
      const mdx = tipTapToMdx(raw)
      const componentNames = collectComponents(raw)
      const imports = generateImports(componentNames)
      importsRef.current = imports
      const fullContent = imports.length > 0 ? imports.join('\n') + '\n\n' + mdx : mdx
      internalChangeRef.current = true
      onChange(fullContent)

      const pos = slashPosRef.current
      if (pos) {
        const doc = editor.state.doc
        const end = Math.min(pos.to, doc.content.size)
        const char = doc.textBetween(pos.from, end)
        if (char !== '/') {
          handleCloseRef.current()
        }
      }
    },
  })

  editorRef.current = editor

  const handleClose = useCallback(() => {
    isSlashOpenRef.current = false
    setSlashMenu(null)
    editor?.chain().focus().run()
  }, [editor])

  handleCloseRef.current = handleClose
  handleOpenRef.current = openSlashMenu

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let scrollTimeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        if (isSlashOpenRef.current) handleCloseRef.current()
      }, 150)
    }
    el.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(scrollTimeout)
      el.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    if (internalChangeRef.current) {
      internalChangeRef.current = false
      return
    }
    const currentMarkdown = editor.storage.markdown.getMarkdown()
    const currentMdx = tipTapToMdx(currentMarkdown)
    const { imports, body } = extractImports(value)
    const targetMdx = mdxToTipTap(body)
    if (currentMdx !== tipTapToMdx(targetMdx)) {
      importsRef.current = imports
      editor.commands.setContent(targetMdx, false)
    }
  }, [editor, value])

  const getComponentActions = useCallback(() => {
    if (!editor) return []
    return mdxComponents.map((comp) => ({
      ...comp,
      action: () => {
        const pos = slashPosRef.current
        if (!pos) return
        isSlashOpenRef.current = false

        const selfClosing = (comp as { selfClosing?: boolean }).selfClosing ?? false
        const propsEntries = Object.entries(comp.defaultProps || {})
        const propsStr = propsEntries
          .map(([key, v]) => {
            if (v === true) return key
            if (typeof v === 'string') return `${key}="${v}"`
            return `${key}={${JSON.stringify(v)}}`
          })
          .join(' ')

        const attrs = [
          `data-component="${comp.label}"`,
          `data-props='${JSON.stringify(comp.defaultProps || {}).replace(/'/g, '&#39;')}'`,
          `data-slot="${(comp.defaultSlot || '').replace(/"/g, '&quot;').replace(/\n/g, '&#10;')}"`,
          `data-self-closing="${selfClosing}"`,
        ].join(' ')

        editor
          .chain()
          .focus()
          .deleteRange({ from: pos.from, to: pos.to })
          .insertContent(`<mdx-component ${attrs}></mdx-component>\n\n`)
          .run()
        setSlashMenu(null)
      },
    }))
  }, [editor])

  return (
    <div className="relative h-full flex flex-col">
      <EditorToolbar />
      <div ref={scrollRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0">
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
          tippyOptions={{ duration: 150, placement: 'top', maxWidth: 9999 }}
          shouldShow={({ state }) => !state.selection.empty}
        >
          <SelectionToolbar editor={editor} />
        </BubbleMenu>
      )}
      {slashMenu && (
        <SlashCommand
          items={getComponentActions()}
          position={slashMenu}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
