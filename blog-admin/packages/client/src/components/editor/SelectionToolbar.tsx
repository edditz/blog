import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Button, Input, Tooltip, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
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
  Heading,
  Pilcrow,
  List,
  ListOrdered,
} from 'lucide-react'

const headingLevels = [1, 2, 3, 4, 5] as const

interface Props {
  editor: Editor
}

export default function SelectionToolbar({ editor }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isHeadingOpen, setIsHeadingOpen] = useState(false)

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
    } else if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      return
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
      icon: List,
      label: '无序列表',
      isActive: () => editor.isActive('bulletList'),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      isActive: () => editor.isActive('orderedList'),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
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
        style={{ minWidth: 32, height: 32 }}
      >
        <Icon size={16} />
      </Button>
      <Tooltip.Content showArrow placement="bottom">
        {label}
      </Tooltip.Content>
    </Tooltip>
  )

  const currentHeading = headingLevels.find((l) =>
    editor.isActive('heading', { level: l }),
  )
  const isParagraph = editor.isActive('paragraph') && !currentHeading

  return (
    <div className="bg-surface border border-default rounded-lg shadow-lg">
      <div className="flex items-center gap-0.5 p-1">
        <Popover
          placement="bottom"
          isOpen={isHeadingOpen}
          onOpenChange={setIsHeadingOpen}
        >
          <Tooltip delay={300}>
            <PopoverTrigger>
              <Button
                isIconOnly
                size="sm"
                variant={currentHeading ? 'secondary' : 'ghost'}
                style={{ minWidth: 32, height: 32 }}
              >
                <Heading size={16} />
              </Button>
            </PopoverTrigger>
            <Tooltip.Content showArrow placement="bottom">
              标题
            </Tooltip.Content>
          </Tooltip>
          <PopoverContent>
            <div className="flex flex-col gap-0.5 p-1">
              {headingLevels.map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={
                    editor.isActive('heading', { level })
                      ? 'secondary'
                      : 'ghost'
                  }
                  className="justify-start"
                  onPress={() => {
                    editor.chain().focus().toggleHeading({ level }).run()
                    setIsHeadingOpen(false)
                  }}
                >
                  H{level}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Tooltip delay={300}>
          <Button
            isIconOnly
            size="sm"
            variant={isParagraph ? 'secondary' : 'ghost'}
            onPress={() =>
              editor.chain().focus().setParagraph().run()
            }
            style={{ minWidth: 32, height: 32 }}
          >
            <Pilcrow size={16} />
          </Button>
          <Tooltip.Content showArrow placement="bottom">
            段落
          </Tooltip.Content>
        </Tooltip>
        <div className="w-px h-5 bg-default mx-1" />
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
