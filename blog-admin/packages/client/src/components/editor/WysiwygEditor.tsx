import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './EditorToolbar'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function WysiwygEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '开始写作...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Convert editor content to markdown-like text
      // TipTap's getText() gives plain text; for basic MDX compatibility we use it here
      onChange(editor.getText())
    },
  })

  return (
    <div className="border rounded-lg overflow-hidden">
      <EditorToolbar />
      <EditorContent editor={editor} className="p-4 min-h-[400px] prose dark:prose-invert max-w-none" />
    </div>
  )
}
