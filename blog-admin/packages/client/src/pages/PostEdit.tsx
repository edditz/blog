import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Image } from 'lucide-react'
import { Button, Spinner, Drawer } from '@heroui/react'
import { getPost, createPost, updatePost } from '@/api/client'
import FrontmatterForm from '@/components/editor/FrontmatterForm'
import WysiwygEditor from '@/components/editor/WysiwygEditor'
import ImageManager from '@/components/editor/ImageManager'
import { useAutoSave } from '@/hooks/useAutoSave'
import type { PostFrontmatter } from '@blog-admin/shared'

const emptyFrontmatter: PostFrontmatter = {
  title: '无标题',
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

  const [title, setTitle] = useState(isEdit ? '' : '无标题')
  const [frontmatter, setFrontmatter] =
    useState<PostFrontmatter>(emptyFrontmatter)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showImages, setShowImages] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleAutoSaveSuccess = useCallback(
    (newSlug: string) => {
      navigate(`/posts/${newSlug}/edit`, { replace: true })
    },
    [navigate],
  )

  const { status: autoSaveStatus, error: autoSaveError, triggerSave } = useAutoSave({
    isNew: !isEdit,
    slug,
    title,
    content,
    frontmatter,
    onSuccess: handleAutoSaveSuccess,
  })

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
    <div className="h-screen bg-background text-foreground px-6 pt-6 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Button variant="ghost" onPress={() => navigate('/posts')}>
          <ArrowLeft size={18} />
          返回
        </Button>
        <div className="flex items-center gap-2">
          {autoSaveStatus === 'pending' && (
            <span className="text-sm text-muted-foreground">未保存</span>
          )}
          {autoSaveStatus === 'saving' && (
            <span className="text-sm text-blue-500 flex items-center gap-1">
              <Spinner size="sm" color="current" />
              保存中...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-sm text-green-500">已保存</span>
          )}
          {autoSaveStatus === 'error' && (
            <span className="text-sm text-red-500">{autoSaveError || '保存失败'}</span>
          )}
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

      <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full">
        <WysiwygEditor value={content} onChange={setContent} title={title} onTitleChange={setTitle} />
      </div>

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
