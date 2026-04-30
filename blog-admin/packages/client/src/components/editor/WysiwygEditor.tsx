import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './EditorToolbar'
import SlashCommand from './SlashCommand'

interface Props {
  value: string
  onChange: (value: string) => void
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

export default function WysiwygEditor({ value, onChange }: Props) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '输入 / 插入组件...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText())
    },
  })

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
    <div className="border rounded-lg overflow-hidden relative">
      <EditorToolbar />
      <EditorContent editor={editor} className="p-4 min-h-[400px] prose dark:prose-invert max-w-none" />
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
