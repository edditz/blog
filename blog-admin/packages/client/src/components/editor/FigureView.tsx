import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Pencil, ImageIcon } from 'lucide-react'
import { Modal, Button, Input } from '@heroui/react'

interface FigureProps {
  src: string
  alt: string
  caption?: string
}

interface PropsEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
  onSave: (src: string, alt: string) => void
  savedScrollTop: number
}

function PropsEditDialog({
  isOpen,
  onOpenChange,
  src,
  alt,
  onSave,
  savedScrollTop,
}: PropsEditDialogProps) {
  const [editSrc, setEditSrc] = useState(src)
  const [editAlt, setEditAlt] = useState(alt)

  const restoreScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const container = document.querySelector('.overflow-y-auto')
      container?.scrollTo(0, savedScrollTop)
    })
  }, [savedScrollTop])

  useEffect(() => {
    if (isOpen) {
      setEditSrc(src)
      setEditAlt(alt)
      restoreScroll()
    }
  }, [isOpen, src, alt, restoreScroll])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) restoreScroll()
      onOpenChange(open)
    },
    [onOpenChange, restoreScroll],
  )

  const handleSave = () => {
    onSave(editSrc, editAlt)
    onOpenChange(false)
    restoreScroll()
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.Header>
            <Modal.Heading>Edit Image</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Input
              value={editSrc}
              onChange={(e) => setEditSrc(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              placeholder="Describe the image"
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

function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export function FigureView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savedScrollTop, setSavedScrollTop] = useState(0)
  const captionRef = useRef<HTMLDivElement>(null)

  const propsParsed: FigureProps = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {} as FigureProps
    }
  })()

  const src = (propsParsed.src as string) || ''
  const alt = (propsParsed.alt as string) || ''
  const caption = (propsParsed.caption as string) || ''

  const handleCaptionBlur = useCallback(() => {
    const newCaption = captionRef.current?.textContent?.trim() ?? ''
    if (newCaption !== caption) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, caption: newCaption }),
      })
    }
  }, [propsParsed, caption, updateAttributes])

  const handlePropsSave = useCallback(
    (newSrc: string, newAlt: string) => {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, src: newSrc, alt: newAlt }),
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
    captionRef.current?.addEventListener('keydown', handler, opts)
    return () => {
      captionRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper className="my-3">
      <figure
        className="relative my-8 flex flex-col items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden rounded-xl border w-full shadow-sm bg-neutral-100 dark:bg-neutral-900">
          {isValidUrl(src) ? (
            <img
              src={src}
              alt={alt}
              className="m-0 h-auto w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-neutral-400 dark:text-neutral-600">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={32} />
                <span className="text-sm">
                  {src ? 'Invalid image URL' : 'No image set'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          ref={captionRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleCaptionBlur}
          onKeyDown={handleKeyDown}
          className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 text-center italic outline-none empty:before:content-['Caption_(optional)'] empty:before:opacity-40 rounded px-1 -mx-1"
        >
          {caption}
        </div>

        {isHovered && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => {
                const container = document.querySelector('.overflow-y-auto')
                setSavedScrollTop(container?.scrollTop ?? 0)
                setIsDialogOpen(true)
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit image"
            >
              <Pencil size={14} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        )}
      </figure>

      <PropsEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        src={src}
        alt={alt}
        onSave={handlePropsSave}
        savedScrollTop={savedScrollTop}
      />
    </NodeViewWrapper>
  )
}
