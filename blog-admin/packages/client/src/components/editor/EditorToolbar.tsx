import { useCurrentEditor } from '@tiptap/react'
import { Bold, Italic, Heading1, Heading2, Code, List, ListOrdered, Quote } from 'lucide-react'

export default function EditorToolbar() {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const btn = (active: boolean) =>
    `p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
      active ? 'bg-gray-200 dark:bg-gray-700' : ''
    }`

  return (
    <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-800 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btn(editor.isActive('heading', { level: 1 }))}
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btn(editor.isActive('code'))}
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive('orderedList'))}
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive('blockquote'))}
      >
        <Quote size={16} />
      </button>
    </div>
  )
}
