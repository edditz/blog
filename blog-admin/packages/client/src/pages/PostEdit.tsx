import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Image } from 'lucide-react'
import { Button, Input, Spinner, Drawer } from '@heroui/react'
import { getPost, createPost, updatePost } from '@/api/client'
import FrontmatterForm from '@/components/editor/FrontmatterForm'
import WysiwygEditor from '@/components/editor/WysiwygEditor'
import ImageManager from '@/components/editor/ImageManager'
import type { PostFrontmatter } from '@blog-admin/shared'

const emptyFrontmatter: PostFrontmatter = {
  title: '',
  date: new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }),
  frontmatter: '',
  tags: [],
  draft: true,
}

export default function PostEdit() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = !!slug

  const [title, setTitle] = useState('')
  const [frontmatter, setFrontmatter] =
    useState<PostFrontmatter>(emptyFrontmatter)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showImages, setShowImages] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (isEdit && slug) {
      getPost(slug).then((post) => {
        setTitle(post.title)
        setFrontmatter({
          title: post.title,
          date: post.date,
          frontmatter: post.frontmatter,
          tags: post.tags,
          category: post.category,
          draft: post.draft,
        })
        setContent(post.content)
      })
    }
  }, [isEdit, slug])

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { ...frontmatter, title }
      if (isEdit && slug) {
        await updatePost(slug, data, content)
      } else {
        const newSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        await createPost(newSlug, data, content)
        navigate(`/posts/${newSlug}/edit`)
      }
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onPress={() => navigate('/posts')}>
          <ArrowLeft size={18} />
          返回
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            isDisabled={!slug}
            onPress={() => setShowImages(true)}
          >
            <Image size={16} />
            图片
          </Button>
          <Button onPress={() => setDrawerOpen(true)}>
            <Save size={16} />
            保存
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="text-3xl font-bold"
          variant="secondary"
        />
      </div>

      <WysiwygEditor value={content} onChange={setContent} />

      <Drawer>
        <Drawer.Backdrop isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>文章设置</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <FrontmatterForm data={frontmatter} onChange={setFrontmatter} />
              </Drawer.Body>
              <Drawer.Footer>
                <Button slot="close" variant="secondary">
                  取消
                </Button>
                <Button
                  isPending={saving}
                  onPress={handleSave}
                >
                  {({ isPending }) => (
                    <>
                      {isPending ? <Spinner color="current" size="sm" /> : <Save size={16} />}
                      {isPending ? '保存中...' : '确认保存'}
                    </>
                  )}
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {showImages && slug && (
        <ImageManager
          slug={slug}
          onInsert={(url, alt) => {
            setContent((prev) => prev + `\n![${alt}](${url})\n`)
            setShowImages(false)
          }}
          onClose={() => setShowImages(false)}
        />
      )}
    </div>
  )
}
