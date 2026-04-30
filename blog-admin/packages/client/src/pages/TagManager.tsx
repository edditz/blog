import { useEffect, useState } from 'react'
import { listTags, renameTag, deleteTag } from '@/api/client'
import type { Tag } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, Input, Modal, Spinner } from '@heroui/react'

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTags = async () => {
    setLoading(true)
    try {
      setTags(await listTags())
    } finally {
      setLoading(false)
    }
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteTag(deleteTarget)
    setDeleteTarget(null)
    fetchTags()
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
      <h2 className="text-2xl font-bold mb-6">标签管理</h2>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.name}
            className="flex items-center justify-between p-3 bg-surface rounded-lg"
          >
            {editing === tag.name ? (
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(tag.name)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.name)}
                className="w-48"
              />
            ) : (
              <span className="font-medium text-foreground">{tag.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{tag.count} 篇文章</span>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => {
                  setEditing(tag.name)
                  setNewName(tag.name)
                }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => setDeleteTarget(tag.name)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {tags.length === 0 && <p className="text-muted">暂无标签</p>}
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
                <p>确定删除标签 &ldquo;{deleteTarget}&rdquo;？这会从所有文章中移除该标签。</p>
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
