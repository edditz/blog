import type { PostFrontmatter } from '@blog-admin/shared'

interface Props {
  data: PostFrontmatter
  onChange: (data: PostFrontmatter) => void
}

export default function FrontmatterForm({ data, onChange }: Props) {
  const update = (partial: Partial<PostFrontmatter>) => {
    onChange({ ...data, ...partial })
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">日期</label>
        <input
          type="text"
          value={data.date}
          onChange={(e) => update({ date: e.target.value })}
          placeholder="MM/DD/YYYY"
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">摘要</label>
        <input
          type="text"
          value={data.frontmatter}
          onChange={(e) => update({ frontmatter: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">标签（逗号分隔）</label>
        <input
          type="text"
          value={data.tags.join(', ')}
          onChange={(e) =>
            update({
              tags: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">分类</label>
        <input
          type="text"
          value={data.category || ''}
          onChange={(e) => update({ category: e.target.value || undefined })}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div className="col-span-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.draft ?? false}
            onChange={(e) => update({ draft: e.target.checked })}
          />
          <span className="text-sm">草稿</span>
        </label>
      </div>
    </div>
  )
}
