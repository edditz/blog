import { useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export function DividerView({ node, updateAttributes }: NodeViewProps) {
  const titleRef = useRef<HTMLSpanElement>(null)

  const propsParsed = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {}
    }
  })()

  const title = (propsParsed.title as string) || ''

  const handleTitleBlur = useCallback(() => {
    const newTitle = titleRef.current?.textContent?.trim() ?? ''
    if (newTitle !== title) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, title: newTitle }),
      })
    }
  }, [propsParsed, title, updateAttributes])

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
    return () => {
      titleRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper className="my-3">
      <div className="flex items-center gap-6">
        <span
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
          onKeyDown={handleKeyDown}
          className="text-accent text-sm uppercase outline-none empty:before:content-['Title'] empty:before:opacity-40 rounded px-1 -mx-1"
        >
          {title}
        </span>
        <div className="h-px flex-1 bg-accent" />
      </div>
    </NodeViewWrapper>
  )
}
