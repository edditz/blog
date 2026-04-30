import type { PostFrontmatter } from '@blog-admin/shared'
import { Input, TextField, Checkbox, Label } from '@heroui/react'

interface Props {
  data: PostFrontmatter
  onChange: (data: PostFrontmatter) => void
}

export default function FrontmatterForm({ data, onChange }: Props) {
  const update = (partial: Partial<PostFrontmatter>) => {
    onChange({ ...data, ...partial })
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-surface rounded-lg">
      <TextField className="w-full">
        <Label>日期</Label>
        <Input
          placeholder="MM/DD/YYYY"
          value={data.date}
          onChange={(e) => update({ date: e.target.value })}
        />
      </TextField>

      <TextField className="w-full">
        <Label>摘要</Label>
        <Input
          value={data.frontmatter}
          onChange={(e) => update({ frontmatter: e.target.value })}
        />
      </TextField>

      <TextField className="w-full">
        <Label>标签（逗号分隔）</Label>
        <Input
          value={data.tags.join(', ')}
          onChange={(e) =>
            update({
              tags: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
        />
      </TextField>

      <TextField className="w-full">
        <Label>分类</Label>
        <Input
          value={data.category || ''}
          onChange={(e) => update({ category: e.target.value || undefined })}
        />
      </TextField>

      <div className="col-span-2">
        <Checkbox
          isSelected={data.draft ?? false}
          onChange={(checked) => update({ draft: checked })}
          id="draft-toggle"
        >
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="draft-toggle">草稿</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
    </div>
  )
}
