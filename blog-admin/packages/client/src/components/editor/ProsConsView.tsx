import { useRef, useCallback, useEffect, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { CircleCheck, CircleX, Plus, X } from 'lucide-react'

interface ProsConsProps {
  pros?: string[]
  cons?: string[]
}

function parseProsCons(nodeProps: string): ProsConsProps {
  try {
    return JSON.parse(nodeProps || '{}')
  } catch {
    return {}
  }
}

export function ProsConsView({ node, updateAttributes }: NodeViewProps) {
  const [hoveredSection, setHoveredSection] = useState<'pros' | 'cons' | null>(null)
  const itemRefs = useRef<Map<string, HTMLSpanElement>>(new Map())

  const propsParsed = parseProsCons(node.attrs.props)
  const pros = propsParsed.pros ?? []
  const cons = propsParsed.cons ?? []

  const setItemRef = useCallback(
    (key: string) => (el: HTMLSpanElement | null) => {
      if (el) {
        itemRefs.current.set(key, el)
      } else {
        itemRefs.current.delete(key)
      }
    },
    [],
  )

  const handleItemBlur = useCallback(
    (section: 'pros' | 'cons', index: number, key: string) => {
      const el = itemRefs.current.get(key)
      const newText = el?.textContent?.trim() ?? ''
      const currentList = section === 'pros' ? pros : cons
      const oldText = currentList[index] ?? ''

      if (newText !== oldText) {
        const newList = [...currentList]
        newList[index] = newText
        updateAttributes({
          props: JSON.stringify({ ...propsParsed, [section]: newList }),
        })
      }
    },
    [propsParsed, pros, cons, updateAttributes],
  )

  const handleAddItem = useCallback(
    (section: 'pros' | 'cons') => {
      const currentList = section === 'pros' ? pros : cons
      const newList = [...currentList, '']
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, [section]: newList }),
      })
    },
    [propsParsed, pros, cons, updateAttributes],
  )

  const handleRemoveItem = useCallback(
    (section: 'pros' | 'cons', index: number) => {
      const currentList = section === 'pros' ? pros : cons
      const newList = currentList.filter((_, i) => i !== index)
      updateAttributes({
        props: JSON.stringify({ ...propsParsed, [section]: newList }),
      })
    },
    [propsParsed, pros, cons, updateAttributes],
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
    const refs = Array.from(itemRefs.current.values())
    refs.forEach((ref) => ref.addEventListener('keydown', handler, opts))
    return () => {
      refs.forEach((ref) => ref.removeEventListener('keydown', handler, opts))
    }
  }, [pros.length, cons.length])

  const renderItem = useCallback(
    (section: 'pros' | 'cons', text: string, index: number) => {
      const key = `${section}-${index}`
      const dotColor = section === 'pros' ? 'text-emerald-500' : 'text-red-500'

      return (
        <li
          key={key}
          className="group/item flex items-start gap-2 text-neutral-700 dark:text-neutral-300"
        >
          <span className={dotColor}>&bull;</span>
          <span
            ref={setItemRef(key)}
            contentEditable
            suppressContentEditableWarning
            onBlur={() => handleItemBlur(section, index, key)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none empty:before:content-['输入内容...'] empty:before:opacity-40 rounded px-1 -mx-1"
          >
            {text}
          </span>
          <button
            onClick={() => handleRemoveItem(section, index)}
            className="shrink-0 opacity-0 group-hover/item:opacity-100 flex items-center justify-center w-5 h-5 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            aria-label={`Remove ${section === 'pros' ? 'pro' : 'con'}`}
          >
            <X size={12} />
          </button>
        </li>
      )
    },
    [setItemRef, handleItemBlur, handleKeyDown, handleRemoveItem],
  )

  const renderSection = (section: 'pros' | 'cons') => {
    const items = section === 'pros' ? pros : cons
    const isPros = section === 'pros'
    const Icon = isPros ? CircleCheck : CircleX
    const borderColor = isPros
      ? 'border-emerald-100 dark:border-emerald-900/50'
      : 'border-red-100 dark:border-red-900/50'
    const bgColor = isPros
      ? 'bg-emerald-50/50 dark:bg-emerald-900/10'
      : 'bg-red-50/50 dark:bg-red-900/10'
    const headerColor = isPros
      ? 'text-emerald-800 dark:text-emerald-400'
      : 'text-red-800 dark:text-red-400'
    const label = isPros ? 'Pros' : 'Cons'

    return (
      <div
        className={`group/section rounded-xl border ${borderColor} ${bgColor} p-5 relative`}
        onMouseEnter={() => setHoveredSection(section)}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <div
          className={`font-semibold flex items-center gap-2 ${headerColor} mb-4`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </div>
        <ul className="space-y-2 list-none">
          {items.map((item, index) => renderItem(section, item, index))}
        </ul>
        {hoveredSection === section && (
          <button
            onClick={() => handleAddItem(section)}
            className="mt-3 flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            aria-label={`Add ${isPros ? 'pro' : 'con'}`}
          >
            <Plus size={14} />
            <span>添加{isPros ? '优点' : '缺点'}</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <NodeViewWrapper className="my-3">
      <div className="my-8 grid gap-4 grid-cols-1 md:grid-cols-2 text-sm w-full">
        {renderSection('pros')}
        {renderSection('cons')}
      </div>
    </NodeViewWrapper>
  )
}
