import { useState, useCallback, useEffect, useRef } from 'react'
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
  const slashPosRef = useRef<{ from: number; to: number } | null>(null)
  const handleCloseRef = useRef<() => void>(() => {})
  const skipNextSlashCheck = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isSlashOpenRef = useRef(false)

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
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown())

      if (!skipNextSlashCheck.current) {
        const { from } = editor.state.selection
        if (from > 0) {
          const char = editor.state.doc.textBetween(from - 1, from)
          if (char === '/' && !isSlashOpenRef.current) {
            openSlashMenu(editor)
          }
        }
      }
      skipNextSlashCheck.current = false

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

  const handleClose = useCallback(() => {
    isSlashOpenRef.current = false
    setSlashMenu(null)
    editor?.chain().focus().run()
  }, [editor])

  handleCloseRef.current = handleClose

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      if (isSlashOpenRef.current) handleCloseRef.current()
    }
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

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
        const pos = slashPosRef.current
        if (!pos) return
        skipNextSlashCheck.current = true
        isSlashOpenRef.current = false
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos.from, to: pos.to })
          .insertContent(`<${comp.label}>...</${comp.label}>`)
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
