import { useEffect, useState } from 'react'
import { listCategories, renameCategory, deleteCategory } from '@/api/client'
import type { Category } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, Input, Modal, Spinner, Table } from '@heroui/react'
import EmptyState from '@/components/EmptyState'
import TablePagination from '@/components/TablePagination'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  if (categories.length === 0) {
    return <EmptyState message="暂无分类" />
  }

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize))
  const pagedCategories = categories.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <Table aria-label="分类管理">
        <Table.ScrollContainer>
          <Table.Content className="table-fixed">
            <Table.Header>
              <Table.Column isRowHeader className="w-[60%]">分类名</Table.Column>
              <Table.Column className="w-[100px]">文章数</Table.Column>
              <Table.Column className="w-[100px]">操作</Table.Column>
            </Table.Header>
            <Table.Body>
              {pagedCategories.map((cat) => (
                <Table.Row key={cat.name}>
                  <Table.Cell>
                    {editing === cat.name ? (
                      <Input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRename(cat.name)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.name)}
                        className="w-full max-w-full"
                      />
                    ) : (
                      <span className="font-medium text-foreground">{cat.name}</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>{cat.count} 篇文章</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
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
        total={categories.length}
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
