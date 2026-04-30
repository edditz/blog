import { useEffect, useState } from 'react'
import { listCategories, renameCategory, deleteCategory } from '@/api/client'
import type { Category } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const fetchCategories = async () => {
    setCategories(await listCategories())
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditing(null)
      return
    }
    await renameCategory(oldName, newName.trim())
    setEditing(null)
    fetchCategories()
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除分类 "${name}"？这会从所有文章中移除该分类。`)) return
    await deleteCategory(name)
    fetchCategories()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">分类管理</h2>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            {editing === cat.name ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(cat.name)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.name)}
                className="px-2 py-1 border rounded bg-white dark:bg-gray-800"
              />
            ) : (
              <span className="font-medium">{cat.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{cat.count} 篇文章</span>
              <button
                onClick={() => {
                  setEditing(cat.name)
                  setNewName(cat.name)
                }}
                className="text-gray-400 hover:text-blue-600"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(cat.name)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500">暂无分类</p>}
      </div>
    </div>
  )
}
