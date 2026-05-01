import { useEffect, useState } from 'react'
import { listTags, renameTag, deleteTag } from '@/api/client'
import type { Tag } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, Input, Modal, Spinner, Table } from '@heroui/react'
import EmptyState from '@/components/EmptyState'
import TablePagination from '@/components/TablePagination'

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  if (tags.length === 0) {
    return <EmptyState message="暂无标签" />
  }

  const totalPages = Math.max(1, Math.ceil(tags.length / pageSize))
  const pagedTags = tags.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <Table aria-label="标签管理">
        <Table.ScrollContainer>
          <Table.Content className="table-fixed">
            <Table.Header>
              <Table.Column isRowHeader className="w-[60%]">标签名</Table.Column>
              <Table.Column className="w-[100px]">文章数</Table.Column>
              <Table.Column className="w-[100px]">操作</Table.Column>
            </Table.Header>
            <Table.Body>
              {pagedTags.map((tag) => (
                <Table.Row key={tag.name}>
                  <Table.Cell>
                    {editing === tag.name ? (
                      <Input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRename(tag.name)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.name)}
                        className="w-full max-w-full"
                      />
                    ) : (
                      <span className="font-medium text-foreground">{tag.name}</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>{tag.count} 篇文章</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
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
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <TablePagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        total={tags.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
      />

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
