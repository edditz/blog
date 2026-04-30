import type { PostMeta } from '@blog-admin/shared'
import { useNavigate } from 'react-router-dom'

interface Props {
  posts: PostMeta[]
  selected: Set<string>
  onSelect: (slug: string) => void
  onSelectAll: () => void
}

export default function PostTable({ posts, selected, onSelect, onSelectAll }: Props) {
  const navigate = useNavigate()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-800">
          <th className="py-3 px-2 text-left">
            <input
              type="checkbox"
              checked={selected.size === posts.length && posts.length > 0}
              onChange={onSelectAll}
            />
          </th>
          <th className="py-3 px-2 text-left">标题</th>
          <th className="py-3 px-2 text-left">标签</th>
          <th className="py-3 px-2 text-left">日期</th>
          <th className="py-3 px-2 text-left">状态</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr
            key={post.slug}
            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
            onClick={() => navigate(`/posts/${post.slug}/edit`)}
          >
            <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(post.slug)}
                onChange={() => onSelect(post.slug)}
              />
            </td>
            <td className="py-3 px-2 font-medium">{post.title}</td>
            <td className="py-3 px-2">
              <div className="flex gap-1 flex-wrap">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td className="py-3 px-2 text-gray-500">{post.date}</td>
            <td className="py-3 px-2">
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  post.draft
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}
              >
                {post.draft ? '草稿' : '已发布'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
