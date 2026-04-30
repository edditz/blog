import { useCurrentEditor } from '@tiptap/react'
import { Bold, Italic, Heading1, Heading2, Code, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from '@heroui/react'

export default function EditorToolbar() {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const toolbarItems = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
  ]

  return (
    <div className="flex gap-1 p-2 border-b border-default flex-wrap">
      {toolbarItems.map(({ icon: Icon, action, active }, i) => (
        <Button
          key={i}
          size="sm"
          isIconOnly
          variant={active ? 'secondary' : 'ghost'}
          onPress={action}
        >
          <Icon size={16} />
        </Button>
      ))}
    </div>
  )
}
