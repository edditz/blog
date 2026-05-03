import { useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export function TabItemView({ node, updateAttributes }: NodeViewProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const slot = (node.attrs.slot as string) || ''

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
    contentRef.current?.addEventListener('keydown', handler, opts)
    return () => {
      contentRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper>
      <div className="tab-panel w-full">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentBlur}
          onKeyDown={handleKeyDown}
          className="p-4 prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 outline-none empty:before:content-['Type_tab_item_content...'] empty:before:opacity-40 min-h-[2rem] rounded"
        >
          {slot}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
