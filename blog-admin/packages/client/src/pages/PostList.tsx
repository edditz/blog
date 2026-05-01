import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button, InputGroup, TextField, Select, Label, ListBox, Spinner } from '@heroui/react'
import type { Selection } from '@heroui/react'
import { listPosts, batchAction, deletePost } from '@/api/client'
import PostTable from '@/components/posts/PostTable'
import TablePagination from '@/components/TablePagination'
import type { PostMeta } from '@blog-admin/shared'

export default function PostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set())
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listPosts({ search: search || undefined, status })
      setPosts(res.posts)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const selectedCount = selectedKeys === 'all'
    ? posts.length
    : selectedKeys.size

  const selectedSlugs = selectedKeys === 'all'
    ? posts.map((p) => p.slug)
    : Array.from(selectedKeys).map(String)

  const handleBatch = async (action: 'delete' | 'publish' | 'unpublish') => {
    if (selectedCount === 0) return
    await batchAction({ action, slugs: selectedSlugs })
    setSelectedKeys(new Set())
    fetchPosts()
  }

  const handleDelete = async (slug: string) => {
    await deletePost(slug)
    fetchPosts()
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))
  const pagedPosts = posts.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, status, pageSize])

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
        <TextField className="flex-1 max-w-sm" aria-label="搜索">
          <InputGroup>
            <InputGroup.Prefix>
              <Search size={16} className="text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="搜索标题、摘要、标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </TextField>
        <div className="flex items-center gap-2">
          <Label>状态</Label>
          <Select
            className="w-36"
            selectedKey={status}
            onSelectionChange={(key) => {
              if (key) setStatus(key as typeof status)
            }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="全部">
                  全部
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="published" textValue="已发布">
                  已发布
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="draft" textValue="草稿">
                  草稿
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <Button className="ml-auto" onPress={() => navigate('/posts/new')}>
          <Plus size={16} />
          新建文章
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-surface rounded-lg items-center">
          <span className="text-sm text-muted">已选 {selectedCount} 篇</span>
          <Button size="sm" variant="ghost" onPress={() => handleBatch('publish')}>
            发布
          </Button>
          <Button size="sm" variant="ghost" onPress={() => handleBatch('unpublish')}>
            取消发布
          </Button>
          <Button size="sm" variant="ghost" onPress={() => handleBatch('delete')}>
            删除
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-muted">暂无文章</div>
      ) : (
        <>
          <PostTable posts={pagedPosts} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} onDelete={handleDelete} />
          <TablePagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={posts.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        </>
      )}
    </div>
  )
}
