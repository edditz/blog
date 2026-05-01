import type { PostMeta } from '@blog-admin/shared'
import type { Selection } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { Table, Checkbox, Chip, Button, AlertDialog } from '@heroui/react'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  posts: PostMeta[]
  selectedKeys: Selection
  onSelectionChange: (keys: Selection) => void
  onDelete: (slug: string) => void
}

export default function PostTable({ posts, selectedKeys, onSelectionChange, onDelete }: Props) {
  const navigate = useNavigate()

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="文章列表"
          className="min-w-[600px]"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        >
          <Table.Header>
            <Table.Column className="pr-0">
              <Checkbox aria-label="全选" slot="selection">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            </Table.Column>
            <Table.Column isRowHeader>标题</Table.Column>
            <Table.Column>标签</Table.Column>
            <Table.Column>日期</Table.Column>
            <Table.Column>状态</Table.Column>
            <Table.Column>操作</Table.Column>
          </Table.Header>
          <Table.Body>
            {posts.map((post) => (
              <Table.Row key={post.slug} id={post.slug}>
                <Table.Cell className="pr-0">
                  <Checkbox
                    aria-label={`选择 ${post.title}`}
                    slot="selection"
                    variant="secondary"
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox>
                </Table.Cell>
                <Table.Cell
                  className="font-medium cursor-pointer"
                  onClick={() => navigate(`/posts/${post.slug}/edit`)}
                >
                  {post.title}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="soft">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </Table.Cell>
                <Table.Cell className="text-muted">{post.date}</Table.Cell>
                <Table.Cell>
                  <Chip
                    size="sm"
                    color={post.draft ? 'warning' : 'success'}
                    variant="soft"
                  >
                    {post.draft ? '草稿' : '已发布'}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button
                      isIconOnly
                      aria-label="编辑"
                      size="sm"
                      variant="ghost"
                      onPress={() => navigate(`/posts/${post.slug}/edit`)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <AlertDialog>
                      <Button
                        isIconOnly
                        aria-label="删除"
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </Button>
                      <AlertDialog.Backdrop>
                        <AlertDialog.Container>
                          <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.CloseTrigger />
                            <AlertDialog.Header>
                              <AlertDialog.Icon status="danger" />
                              <AlertDialog.Heading>确认删除？</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                              <p>
                                确定要删除文章 <strong>{post.title}</strong> 吗？此操作不可撤销。
                              </p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                              <Button slot="close" variant="tertiary">
                                取消
                              </Button>
                              <Button
                                slot="close"
                                variant="danger"
                                onPress={() => onDelete(post.slug)}
                              >
                                删除
                              </Button>
                            </AlertDialog.Footer>
                          </AlertDialog.Dialog>
                        </AlertDialog.Container>
                      </AlertDialog.Backdrop>
                    </AlertDialog>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
