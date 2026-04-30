import { useEffect, useState } from 'react'
import { listCategories, renameCategory, deleteCategory } from '@/api/client'
import type { Category } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, Input, Modal, Spinner } from '@heroui/react'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      setCategories(await listCategories())
    } finally {
      setLoading(false)
    }
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteCategory(deleteTarget)
    setDeleteTarget(null)
    fetchCategories()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">分类管理</h2>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between p-3 bg-surface rounded-lg"
          >
            {editing === cat.name ? (
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(cat.name)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.name)}
                className="w-48"
              />
            ) : (
              <span className="font-medium text-foreground">{cat.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{cat.count} 篇文章</span>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => {
                  setEditing(cat.name)
                  setNewName(cat.name)
                }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => setDeleteTarget(cat.name)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-muted">暂无分类</p>}
      </div>

      {deleteTarget && (
        <Modal.Backdrop isOpen onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>确认删除</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>确定删除分类 &ldquo;{deleteTarget}&rdquo;？这会从所有文章中移除该分类。</p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => setDeleteTarget(null)}>
                  取消
                </Button>
                <Button variant="danger" onPress={handleDelete}>
                  删除
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </div>
  )
}
