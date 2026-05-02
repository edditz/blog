import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import EditorToolbar from './EditorToolbar'
import SlashCommand from './SlashCommand'

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
