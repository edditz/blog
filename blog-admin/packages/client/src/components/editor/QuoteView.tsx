import { useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Quote as QuoteIcon } from 'lucide-react'

export function QuoteView({ node, updateAttributes }: NodeViewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const authorRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)

  const propsParsed = (() => {
    try {
      return JSON.parse(node.attrs.props || '{}')
    } catch {
      return {}
    }
  })()

  const author = (propsParsed.author as string) || ''
  const title = (propsParsed.title as string) || ''
  const slot = (node.attrs.slot as string) || ''

  const handleContentBlur = useCallback(() => {
    const newSlot = contentRef.current?.textContent?.trim() ?? ''
    if (newSlot !== slot) {
      updateAttributes({ slot: newSlot })
    }
  }, [slot, updateAttributes])

  const handleAuthorBlur = useCallback(() => {
    const newAuthor = authorRef.current?.textContent?.trim() ?? ''
    if (newAuthor !== author) {
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, author: newAuthor }),
      })
    }
  }, [propsParsed, author, updateAttributes])

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
    contentRef.current?.addEventListener('keydown', handler, opts)
    authorRef.current?.addEventListener('keydown', handler, opts)
    titleRef.current?.addEventListener('keydown', handler, opts)
    return () => {
      contentRef.current?.removeEventListener('keydown', handler, opts)
      authorRef.current?.removeEventListener('keydown', handler, opts)
      titleRef.current?.removeEventListener('keydown', handler, opts)
    }
  }, [])

  return (
    <NodeViewWrapper className="my-3">
      <figure className="rounded-xl bg-neutral-50 dark:bg-neutral-900/50 p-6 sm:p-8 flex items-start gap-4 border border-neutral-100 dark:border-neutral-800 shadow-sm">
        <div className="text-indigo-500/30 shrink-0 pt-1">
          <QuoteIcon size={32} />
        </div>
        <div className="flex-1 w-0">
          <div className="text-lg/relaxed font-medium italic text-neutral-800 dark:text-neutral-200 m-0 p-0">
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleContentBlur}
              onKeyDown={handleKeyDown}
              className="outline-none empty:before:content-['在此输入引用内容...'] empty:before:opacity-40 rounded px-1 -mx-1"
            >
              {slot}
            </div>
          </div>
          <figcaption className="mt-4 flex items-center gap-2">
            <span
              ref={authorRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleAuthorBlur}
              onKeyDown={handleKeyDown}
              className="font-semibold text-neutral-900 dark:text-white outline-none empty:before:content-['Author'] empty:before:opacity-40 rounded px-1 -mx-1"
            >
              {author}
            </span>
            {author && title && (
              <span className="text-neutral-400 dark:text-neutral-500">—</span>
            )}
            <span
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className="text-sm text-neutral-500 dark:text-neutral-400 outline-none empty:before:content-['Title'] empty:before:opacity-40 rounded px-1 -mx-1"
            >
              {title}
            </span>
          </figcaption>
        </div>
      </figure>
    </NodeViewWrapper>
  )
}
