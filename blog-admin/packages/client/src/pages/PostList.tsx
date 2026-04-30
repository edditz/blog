import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button, Input, Select, Label, ListBox, Spinner } from '@heroui/react'
import type { Selection } from '@heroui/react'
import { listPosts, batchAction } from '@/api/client'
import PostTable from '@/components/posts/PostTable'
import type { PostMeta } from '@blog-admin/shared'

export default function PostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set())
  const [loading, setLoading] = useState(true)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">文章</h2>
        <Button onPress={() => navigate('/posts/new')}>
          <Plus size={16} />
          新建文章
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" />
          <Input
            fullWidth
            placeholder="搜索标题、摘要、标签..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="w-40"
          selectedKey={status}
          onSelectionChange={(key) => {
            if (key) setStatus(key as typeof status)
          }}
        >
          <Label>状态</Label>
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
        <PostTable posts={posts} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} />
      )}
    </div>
  )
}
