import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Pencil, Play } from 'lucide-react'
import { Modal, Button, Input } from '@heroui/react'

interface PropsEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  id: string
  start: string | number | undefined
  onSave: (id: string, start: string | number | undefined) => void
  savedScrollTop: number
}

function PropsEditDialog({ isOpen, onOpenChange, id, start, onSave, savedScrollTop }: PropsEditDialogProps) {
  const [editId, setEditId] = useState(id)
  const [editStart, setEditStart] = useState(start?.toString() ?? '')

  useEffect(() => {
    if (isOpen) {
      setEditId(id)
      setEditStart(start?.toString() ?? '')
    }
  }, [isOpen, id, start])

  const restoreScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const container = document.querySelector('.overflow-y-auto')
      container?.scrollTo(0, savedScrollTop)
    })
  }, [savedScrollTop])

  useEffect(() => {
    if (isOpen) restoreScroll()
  }, [isOpen, restoreScroll])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) restoreScroll()
      onOpenChange(open)
    },
    [onOpenChange, restoreScroll],
  )

  const handleSave = () => {
    const trimmedId = editId.trim()
    const trimmedStart = editStart.trim()
    onSave(trimmedId, trimmedStart || undefined)
    onOpenChange(false)
    restoreScroll()
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-sm">
          <Modal.Header>
            <Modal.Heading>Edit YouTube Video</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Input
              value={editId}
              onChange={(e) => setEditId(e.target.value)}
              placeholder="e.g. dQw4w9WgXcQ"
            />
            <Input
              value={editStart}
              onChange={(e) => setEditStart(e.target.value)}
              placeholder="Start (seconds, optional)"
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

export function YouTubeView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savedScrollTop, setSavedScrollTop] = useState(0)

  const propsParsed = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {}
    }
  })()

  const id = (propsParsed.id as string) || ''
  const start = propsParsed.start as string | number | undefined

  const handleSave = useCallback(
    (newId: string, newStart: string | number | undefined) => {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, id: newId, start: newStart }),
      })
    },
    [propsParsed, updateAttributes],
  )

  const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
  const videoUrl = id ? `https://www.youtube.com/watch?v=${id}` : ''

  return (
    <NodeViewWrapper className="my-3">
      <div
        className="group/yt relative my-8 w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          {id ? (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
            >
              <img
                src={thumbnailUrl}
                alt="YouTube video thumbnail"
                className="absolute top-0 left-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600/90 shadow-lg transition-transform group-hover/yt:scale-110">
                  <Play size={28} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </a>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
              <span className="text-sm text-neutral-400 dark:text-neutral-500">
                No video ID set
              </span>
            </div>
          )}
        </div>
        {id && (
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate block">
              {id}
              {start != null && ` (start: ${start}s)`}
            </span>
          </div>
        )}
        {isHovered && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => {
                const container = document.querySelector('.overflow-y-auto')
                setSavedScrollTop(container?.scrollTop ?? 0)
                setIsDialogOpen(true)
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit YouTube video"
            >
              <Pencil size={14} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        )}
      </div>

      <PropsEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        id={id}
        start={start}
        onSave={handleSave}
        savedScrollTop={savedScrollTop}
      />
    </NodeViewWrapper>
  )
}
