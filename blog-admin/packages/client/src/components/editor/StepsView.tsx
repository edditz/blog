import { useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export function StepsView({ node, updateAttributes }: NodeViewProps) {
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
    <NodeViewWrapper className="my-3">
      <div className="my-8 ml-4 border-l-2 border-neutral-200 dark:border-neutral-800 pl-6 space-y-8 relative">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentBlur}
          onKeyDown={handleKeyDown}
          className="text-sm prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 outline-none empty:before:content-['###_Step_1\\A在此输入步骤内容...'] empty:before:whitespace-pre-wrap empty:before:opacity-40 rounded px-1 -mx-1 min-h-[2rem]"
        >
          {slot}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
