import { useState, useEffect } from 'react'
import { Input } from '@heroui/react'

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
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filtered[selectedIndex]?.action()
        onClose()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filtered, selectedIndex, onClose])

  if (filtered.length === 0) return null

  return (
    <div
      className="absolute z-50 bg-surface border border-default rounded-lg shadow-lg w-64 max-h-48 overflow-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="border-b border-default">
        <Input
          autoFocus
          placeholder="搜索组件..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="secondary"
          className="border-0"
        />
      </div>
      {filtered.map((item, i) => (
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
      ))}
    </div>
  )
}
