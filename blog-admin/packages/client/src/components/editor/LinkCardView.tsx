import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Pencil, Link } from 'lucide-react'
import { Modal, Button, Input } from '@heroui/react'

interface LinkCardProps {
  href: string
  title: string
  description?: string
  domain?: string
}

interface PropsEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  href: string
  domain: string
  onSave: (href: string, domain: string) => void
  savedScrollTop: number
}

function PropsEditDialog({
  isOpen,
  onOpenChange,
  href,
  domain,
  onSave,
  savedScrollTop,
}: PropsEditDialogProps) {
  const [editHref, setEditHref] = useState(href)
  const [editDomain, setEditDomain] = useState(domain)

  const restoreScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const container = document.querySelector('.overflow-y-auto')
      container?.scrollTo(0, savedScrollTop)
    })
  }, [savedScrollTop])

  useEffect(() => {
    if (isOpen) {
      setEditHref(href)
      setEditDomain(domain)
      restoreScroll()
    }
  }, [isOpen, href, domain, restoreScroll])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) restoreScroll()
      onOpenChange(open)
    },
    [onOpenChange, restoreScroll],
  )

  const handleSave = () => {
    onSave(editHref, editDomain)
    onOpenChange(false)
    restoreScroll()
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.Header>
            <Modal.Heading>Edit Link Card</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Input
              value={editHref}
              onChange={(e) => setEditHref(e.target.value)}
              placeholder="https://example.com"
            />
            <Input
              value={editDomain}
              onChange={(e) => setEditDomain(e.target.value)}
              placeholder="example.com (optional override)"
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

function deriveDomain(href: string): string {
  try {
    return new URL(href).hostname
  } catch {
    return href
  }
}

export function LinkCardView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savedScrollTop, setSavedScrollTop] = useState(0)
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

  const propsParsed: LinkCardProps = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {} as LinkCardProps
    }
  })()

  const href = (propsParsed.href as string) || ''
  const title = (propsParsed.title as string) || ''
  const description = (propsParsed.description as string) || ''
  const domain = (propsParsed.domain as string) || deriveDomain(href)

  const handleTitleBlur = useCallback(() => {
    const newTitle = titleRef.current?.textContent?.trim() ?? ''
    if (newTitle !== title) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, title: newTitle }),
      })
    }
  }, [propsParsed, title, updateAttributes])

  const handleDescriptionBlur = useCallback(() => {
    const newDescription = descriptionRef.current?.textContent?.trim() ?? ''
    if (newDescription !== description) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, description: newDescription }),
      })
    }
  }, [propsParsed, description, updateAttributes])

  const handlePropsSave = useCallback(
    (newHref: string, newDomain: string) => {
      const derived = deriveDomain(newHref)
      updateAttributes({
        props: JSON.stringify({
          ...propsParsed,
          href: newHref,
          domain: newDomain || derived,
        }),
      })
    },
    [propsParsed, updateAttributes],
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      return
    }
    e.stopPropagation()
  }, [])

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
    titleRef.current?.addEventListener('keydown', handler, opts)
    descriptionRef.current?.addEventListener('keydown', handler, opts)
    return () => {
      titleRef.current?.removeEventListener('keydown', handler, opts)
      descriptionRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper className="my-3">
      <div
        className="group/card relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="my-8 block no-underline group shadow-sm rounded-xl"
        >
          <div className="flex items-center overflow-hidden rounded-xl border bg-white dark:bg-neutral-950 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/80">
            <div className="flex-1 p-4 sm:p-5">
              <div
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleTitleBlur}
                onKeyDown={handleKeyDown}
                className="font-semibold text-neutral-900 dark:text-white mb-1 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors line-clamp-1 outline-none empty:before:content-['Title'] empty:before:opacity-40 rounded px-1 -mx-1"
              >
                {title}
              </div>
              <div
                ref={descriptionRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleDescriptionBlur}
                onKeyDown={handleKeyDown}
                className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2 outline-none empty:before:content-['Description_(optional)'] empty:before:opacity-40 rounded px-1 -mx-1"
              >
                {description}
              </div>
              <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                <Link size={12} />
                {domain}
              </div>
            </div>
          </div>
        </a>

        {isHovered && (
          <div className="absolute bottom-10 right-2">
            <button
              onClick={() => {
                const container = document.querySelector('.overflow-y-auto')
                setSavedScrollTop(container?.scrollTop ?? 0)
                setIsDialogOpen(true)
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit link URL"
            >
              <Pencil size={14} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        )}
      </div>

      <PropsEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        href={href}
        domain={domain}
        onSave={handlePropsSave}
        savedScrollTop={savedScrollTop}
      />
    </NodeViewWrapper>
  )
}
