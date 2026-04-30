import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Image } from 'lucide-react'
import { getPost, createPost, updatePost } from '@/api/client'
import FrontmatterForm from '@/components/editor/FrontmatterForm'
import SourceEditor from '@/components/editor/SourceEditor'
import WysiwygEditor from '@/components/editor/WysiwygEditor'
import ModeSwitch from '@/components/editor/ModeSwitch'
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
  const [mode, setMode] = useState<'source' | 'wysiwyg'>('source')
  const [saving, setSaving] = useState(false)
  const [showImages, setShowImages] = useState(false)

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
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/posts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          返回
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImages(true)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
            disabled={!slug}
          >
            <Image size={16} />
            图片
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="text-3xl font-bold w-full bg-transparent border-none outline-none"
        />
      </div>

      <div className="mb-4">
        <FrontmatterForm data={frontmatter} onChange={setFrontmatter} />
      </div>

      <div className="mb-4">
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>

      {mode === 'source' ? (
        <SourceEditor value={content} onChange={setContent} />
      ) : (
        <WysiwygEditor value={content} onChange={setContent} />
      )}

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
