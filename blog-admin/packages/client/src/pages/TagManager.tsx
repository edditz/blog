import { useEffect, useState } from 'react'
import { listTags, renameTag, deleteTag } from '@/api/client'
import type { Tag } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const fetchTags = async () => {
    setTags(await listTags())
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditing(null)
      return
    }
    await renameTag(oldName, newName.trim())
    setEditing(null)
    fetchTags()
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除标签 "${name}"？这会从所有文章中移除该标签。`)) return
    await deleteTag(name)
    fetchTags()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">标签管理</h2>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.name}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            {editing === tag.name ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(tag.name)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.name)}
                className="px-2 py-1 border rounded bg-white dark:bg-gray-800"
              />
            ) : (
              <span className="font-medium">{tag.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{tag.count} 篇文章</span>
              <button
                onClick={() => {
                  setEditing(tag.name)
                  setNewName(tag.name)
                }}
                className="text-gray-400 hover:text-blue-600"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(tag.name)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {tags.length === 0 && <p className="text-gray-500">暂无标签</p>}
      </div>
    </div>
  )
}
