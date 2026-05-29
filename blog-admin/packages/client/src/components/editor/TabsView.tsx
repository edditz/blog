import { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Plus, X, Pencil } from 'lucide-react'
import { Modal, Button } from '@heroui/react'

interface PropsEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tabs: string[]
  onSave: (tabs: string[]) => void
  savedScrollTop: number
}

function PropsEditDialog({
  isOpen,
  onOpenChange,
  tabs,
  onSave,
  savedScrollTop,
}: PropsEditDialogProps) {
  const [editTabs, setEditTabs] = useState(tabs)

  const restoreScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const container = document.querySelector('.overflow-y-auto')
      container?.scrollTo(0, savedScrollTop)
    })
  }, [savedScrollTop])

  useEffect(() => {
    if (isOpen) {
      setEditTabs(tabs)
      restoreScroll()
    }
  }, [isOpen, tabs, restoreScroll])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) restoreScroll()
      onOpenChange(open)
    },
    [onOpenChange, restoreScroll],
  )

  const handleSave = () => {
    onSave(editTabs)
    onOpenChange(false)
    restoreScroll()
  }

  const handleAddTab = () => {
    setEditTabs((prev) => [...prev, `Tab ${prev.length + 1}`])
  }

  const handleRemoveTab = (index: number) => {
    setEditTabs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTabChange = (index: number, value: string) => {
    setEditTabs((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.Header>
            <Modal.Heading>Edit Tabs</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              {editTabs.map((tab, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tab}
                    onChange={(e) => handleTabChange(i, e.target.value)}
                    className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder={`Tab ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTab(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    aria-label={`Remove tab ${i + 1}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddTab}
                className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus size={14} />
                Add Tab
              </button>
            </div>
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

export function TabsView({ node, updateAttributes }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savedScrollTop, setSavedScrollTop] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])

  const propsParsed = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {}
    }
  })()

  const tabs: string[] = Array.isArray(propsParsed.tabs) ? propsParsed.tabs : ['Tab 1']
  const slot = (node.attrs.slot as string) || ''

  const handleTabLabelBlur = useCallback(
    (index: number) => {
      const el = labelRefs.current[index]
      const newLabel = el?.textContent?.trim() ?? ''
      if (newLabel !== tabs[index]) {
        const newTabs = tabs.map((t, i) => (i === index ? newLabel : t))
        updateAttributes({
          props: JSON.stringify({ ...propsParsed, tabs: newTabs }),
        })
      }
    },
    [propsParsed, tabs, updateAttributes],
  )

  const handleContentBlur = useCallback(() => {
    const newSlot = contentRef.current?.textContent?.trim() ?? ''
    if (newSlot !== slot) {
      updateAttributes({ slot: newSlot })
    }
  }, [slot, updateAttributes])

  const handleTabsSave = useCallback(
    (newTabs: string[]) => {
      const clampedActive = activeTab >= newTabs.length ? Math.max(0, newTabs.length - 1) : activeTab
      setActiveTab(clampedActive)
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, tabs: newTabs }),
      })
    },
    [propsParsed, activeTab, updateAttributes],
  )

  const handleAddTab = useCallback(() => {
    const newTabs = [...tabs, `Tab ${tabs.length + 1}`]
    updateAttributes({
      props: JSON.stringify({ ...propsParsed, tabs: newTabs }),
    })
  }, [propsParsed, tabs, updateAttributes])

  const handleRemoveTab = useCallback(
    (index: number) => {
      if (tabs.length <= 1) return
      const newTabs = tabs.filter((_, i) => i !== index)
      const clampedActive = activeTab >= newTabs.length ? newTabs.length - 1 : activeTab
      setActiveTab(clampedActive)
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, tabs: newTabs }),
      })
    },
    [propsParsed, tabs, activeTab, updateAttributes],
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

    contentRef.current?.addEventListener('keydown', handler, opts)
    labelRefs.current.forEach((ref) => {
      ref?.addEventListener('keydown', handler, opts)
    })

    return () => {
      contentRef.current?.removeEventListener('keydown', handler, opts)
      labelRefs.current.forEach((ref) => {
        ref?.removeEventListener('keydown', handler, opts)
      })
    }
  }, [tabs.length])

  return (
    <NodeViewWrapper className="my-3">
      <div
        className="group/edit relative rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 px-4 py-2.5 text-sm transition-colors shrink-0 ${
                i === activeTab
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium relative after:content-[\'\'] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-600 dark:after:bg-indigo-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab(i)}
                className="sr-only"
                aria-label={`Switch to ${tab}`}
              >
                {tab}
              </button>
              <span
                ref={(el) => {
                  labelRefs.current[i] = el
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={() => handleTabLabelBlur(i)}
                onKeyDown={handleKeyDown}
                onClick={() => setActiveTab(i)}
                className="outline-none empty:before:content-['Tab'] empty:before:opacity-40 rounded px-0.5 -mx-0.5 cursor-text min-w-[1ch]"
              >
                {tab}
              </span>
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTab(i)}
                  className="flex items-center justify-center w-5 h-5 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ml-1 -mr-1"
                  aria-label={`Remove tab ${tab}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTab}
            className="flex items-center justify-center px-3 py-2.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
            aria-label="Add tab"
          >
            <Plus size={16} />
          </button>
        </div>
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentBlur}
          onKeyDown={handleKeyDown}
          className="bg-white dark:bg-neutral-950 p-4 prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 outline-none empty:before:content-['Type_tab_content...'] empty:before:opacity-40 min-h-[3rem]"
        >
          {slot}
        </div>

        {isHovered && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => {
                const container = document.querySelector('.overflow-y-auto')
                setSavedScrollTop(container?.scrollTop ?? 0)
                setIsDialogOpen(true)
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit tabs"
            >
              <Pencil size={14} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        )}
      </div>

      <PropsEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tabs={tabs}
        onSave={handleTabsSave}
        savedScrollTop={savedScrollTop}
      />
    </NodeViewWrapper>
  )
}
