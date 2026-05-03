import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Info, TriangleAlert, Lightbulb, Flame, Pencil } from 'lucide-react'
import { Modal, Button, Select, Label, ListBox } from '@heroui/react'

const CALLOUT_TYPES = {
  note: {
    icon: Info,
    color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    defaultTitle: 'Note',
  },
  warning: {
    icon: TriangleAlert,
    color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    defaultTitle: 'Warning',
  },
  tip: {
    icon: Lightbulb,
    color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    defaultTitle: 'Tip',
  },
  danger: {
    icon: Flame,
    color: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    defaultTitle: 'Danger',
  },
} as const

type CalloutType = keyof typeof CALLOUT_TYPES

function isValidCalloutType(type: unknown): type is CalloutType {
  return typeof type === 'string' && type in CALLOUT_TYPES
}

function getCalloutType(type: unknown): CalloutType {
  return isValidCalloutType(type) ? type : 'note'
}

interface PropsEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  type: CalloutType
  onSave: (type: CalloutType) => void
  savedScrollTop: number
}

function PropsEditDialog({ isOpen, onOpenChange, type, onSave, savedScrollTop }: PropsEditDialogProps) {
  const [editType, setEditType] = useState(type)

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
    onSave(editType)
    onOpenChange(false)
    restoreScroll()
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-xs">
          <Modal.Header>
            <Modal.Heading>Edit Callout Type</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Select
              className="w-full"
              value={editType}
              onChange={(key) => setEditType((key ?? 'note') as CalloutType)}
            >
              <Label>Type</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="note" textValue="Note">
                    Note
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="tip" textValue="Tip">
                    Tip
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="warning" textValue="Warning">
                    Warning
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="danger" textValue="Danger">
                    Danger
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
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

export function CalloutView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savedScrollTop, setSavedScrollTop] = useState(0)
  const titleRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const propsParsed = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {}
    }
  })()

  const type = getCalloutType(propsParsed.type)
  const title = propsParsed.title as string | undefined
  const slot = (node.attrs.slot as string) || ''

  const current = CALLOUT_TYPES[type]
  const Icon = current.icon

  const handleTypeSave = useCallback(
    (newType: CalloutType) => {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, type: newType }),
      })
    },
    [propsParsed, updateAttributes],
  )

  const handleTitleBlur = useCallback(() => {
    const newTitle = titleRef.current?.textContent?.trim() ?? ''
    if (newTitle !== (title || '')) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, title: newTitle }),
      })
    }
  }, [propsParsed, title, updateAttributes])

  const handleContentBlur = useCallback(() => {
    const newSlot = contentRef.current?.textContent?.trim() ?? ''
    if (newSlot !== slot) {
      updateAttributes({ slot: newSlot })
    }
  }, [slot, updateAttributes])

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
    contentRef.current?.addEventListener('keydown', handler, opts)
    return () => {
      titleRef.current?.removeEventListener('keydown', handler, opts)
      contentRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper className="my-3">
      <div
        className={`group/edit relative rounded-r-lg border-l-4 p-5 ${current.color}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-2 mb-2 font-bold">
          <div className={`shrink-0 ${current.iconColor}`}>
            <Icon size={20} />
          </div>
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="outline-none empty:before:content-['Title'] empty:before:opacity-40 rounded px-1 -mx-1"
          >
            {title || current.defaultTitle}
          </div>
        </div>
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentBlur}
          onKeyDown={handleKeyDown}
          className="text-sm prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 sm:pl-7 outline-none empty:before:content-['Type_callout_content...'] empty:before:opacity-40 rounded px-1 -mx-1"
        >
          {slot}
        </div>
        {isHovered && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={() => {
                const container = document.querySelector('.overflow-y-auto')
                setSavedScrollTop(container?.scrollTop ?? 0)
                setIsDialogOpen(true)
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit callout type"
            >
              <Pencil size={14} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        )}
      </div>

      <PropsEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        type={type}
        onSave={handleTypeSave}
        savedScrollTop={savedScrollTop}
      />
    </NodeViewWrapper>
  )
}
