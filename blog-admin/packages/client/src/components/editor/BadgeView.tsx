import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Pencil } from 'lucide-react'
import { Modal, Button, Input } from '@heroui/react'

interface BadgeProps {
  content: string
  href?: string
}

interface PropsEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  href: string
  onSave: (href: string) => void
  savedScrollTop: number
}

function PropsEditDialog({ isOpen, onOpenChange, href, onSave, savedScrollTop }: PropsEditDialogProps) {
  const [editHref, setEditHref] = useState(href)

  const restoreScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const container = document.querySelector('.overflow-y-auto')
      container?.scrollTo(0, savedScrollTop)
    })
  }, [savedScrollTop])

  useEffect(() => {
    if (isOpen) {
      setEditHref(href)
      restoreScroll()
    }
  }, [isOpen, href, restoreScroll])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) restoreScroll()
      onOpenChange(open)
    },
    [onOpenChange, restoreScroll],
  )

  const handleSave = () => {
    onSave(editHref)
    onOpenChange(false)
    restoreScroll()
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-xs">
          <Modal.Header>
            <Modal.Heading>Edit Badge Link</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Input
              placeholder="https://example.com"
              value={editHref}
              onChange={(e) => setEditHref(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" slot="close">
              Cancel
            </Button>
            <Button onPress={handleSave} slot="close">
              Save
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export function BadgeView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savedScrollTop, setSavedScrollTop] = useState(0)
  const contentRef = useRef<HTMLSpanElement>(null)

  const propsParsed: BadgeProps = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {}
    }
  })()

  const content = (propsParsed.content as string) || ''
  const href = (propsParsed.href as string) || undefined

  const handleContentBlur = useCallback(() => {
    const newContent = contentRef.current?.textContent?.trim() ?? ''
    if (newContent !== content) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, content: newContent }),
      })
    }
  }, [propsParsed, content, updateAttributes])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      return
    }
    e.stopPropagation()
  }, [])

  const handleHrefSave = useCallback(
    (newHref: string) => {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, href: newHref || undefined }),
      })
    },
    [propsParsed, updateAttributes],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        e.stopImmediatePropagation()
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 's',
            code: 'KeyS',
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            bubbles: true,
            cancelable: true,
          }),
        )
      }
    }
    const opts: AddEventListenerOptions = { capture: true }
    contentRef.current?.addEventListener('keydown', handler, opts)
    return () => {
      contentRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper className="inline">
      <span
        className="group/badge relative inline-flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span
          className={`inline-flex items-center text-sm rounded-full px-3 py-1 transition-colors ${
            href
              ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer'
              : 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800'
          }`}
        >
          <span
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleContentBlur}
            onKeyDown={handleKeyDown}
            className="outline-none empty:before:content-['Badge'] empty:before:opacity-40"
          >
            {content}
          </span>
        </span>
        {isHovered && (
          <button
            onClick={() => {
              const container = document.querySelector('.overflow-y-auto')
              setSavedScrollTop(container?.scrollTop ?? 0)
              setIsDialogOpen(true)
            }}
            className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors z-10"
            aria-label="Edit badge link"
          >
            <Pencil size={12} className="text-neutral-600 dark:text-neutral-400" />
          </button>
        )}
      </span>

      <PropsEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        href={href || ''}
        onSave={handleHrefSave}
        savedScrollTop={savedScrollTop}
      />
    </NodeViewWrapper>
  )
}
