import { useState, useEffect, useRef } from 'react'

interface SlashItem {
  label: string
  description: string
  action: () => void
}

interface Props {
  items: SlashItem[]
  position: { top: number; left: number }
  onClose: () => void
}

export default function SlashCommand({ items, position, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filtered, selectedIndex, onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-surface border border-default rounded-lg shadow-lg w-64 max-h-48 overflow-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="border-b border-default">
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索组件..."
          value={query}
          onChange={(e) => setQuery(e.target.value.replace(/^\//, ''))}
          className="w-full px-3 py-2 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="px-3 py-4 text-sm text-muted text-center">无匹配组件</div>
      ) : (
      filtered.map((item, i) => (
        <button
          key={item.label}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-secondary ${
            i === selectedIndex ? 'bg-primary/10' : ''
          }`}
          onClick={() => {
            item.action()
            onClose()
          }}
        >
          <div className="font-medium text-foreground">{item.label}</div>
          <div className="text-xs text-muted">{item.description}</div>
        </button>
      )))}
    </div>
  )
}
