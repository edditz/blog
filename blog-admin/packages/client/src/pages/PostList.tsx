import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { listPosts, batchAction } from '@/api/client'
import PostTable from '@/components/posts/PostTable'
import type { PostMeta } from '@blog-admin/shared'

export default function PostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [selected, setSelected] = useState(new Set<string>())
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

  const toggleSelect = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.slug)),
    )
  }

  const handleBatch = async (action: 'delete' | 'publish' | 'unpublish') => {
    if (selected.size === 0) return
    await batchAction({ action, slugs: Array.from(selected) })
    setSelected(new Set())
    fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">文章</h2>
        <button
          onClick={() => navigate('/posts/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          新建文章
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索标题、摘要、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        >
          <option value="all">全部</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <span className="text-sm text-gray-500">已选 {selected.size} 篇</span>
          <button onClick={() => handleBatch('publish')} className="text-sm text-blue-600 hover:underline">
            发布
          </button>
          <button onClick={() => handleBatch('unpublish')} className="text-sm text-blue-600 hover:underline">
            取消发布
          </button>
          <button onClick={() => handleBatch('delete')} className="text-sm text-red-600 hover:underline">
            删除
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">暂无文章</div>
      ) : (
        <PostTable posts={posts} selected={selected} onSelect={toggleSelect} onSelectAll={toggleSelectAll} />
      )}
    </div>
  )
}
