import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { config } from '../config.js'
import type { Post, PostMeta, PostFrontmatter } from '@blog-admin/shared'

const postsPath = (): string => path.resolve(config.blogRoot, config.postsDir)

function getPostDir(slug: string): string {
  return path.join(postsPath(), slug)
}

function getPostFile(slug: string): string {
  return path.join(getPostDir(slug), 'index.mdx')
}

export function listPosts(): PostMeta[] {
  const dir = postsPath()
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const filePath = path.join(dir, e.name, 'index.mdx')
      if (!fs.existsSync(filePath)) return null

      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)
      return { slug: e.name, ...data } as PostMeta
    })
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => {
      const [am, ad, ay] = a.date.split('/').map(Number)
      const [bm, bd, by] = b.date.split('/').map(Number)
      return new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()
    })
}

export function getPost(slug: string): Post | null {
  const filePath = getPostFile(slug)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return { slug, ...data, content } as Post
}

export function createPost(slug: string, data: PostFrontmatter, content: string): Post {
  const dir = getPostDir(slug)
  if (fs.existsSync(dir)) {
    throw new Error(`Post already exists: ${slug}`)
  }

  fs.mkdirSync(path.join(dir, 'images'), { recursive: true })

  const frontmatter = [
    '---',
    `title: "${data.title}"`,
    `date: "${data.date}"`,
    `updatedDate: ""`,
    `frontmatter: "${data.frontmatter}"`,
    `tags: [${data.tags.map((t) => `"${t}"`).join(', ')}]`,
    data.category ? `category: "${data.category}"` : '',
    `draft: ${data.draft ?? false}`,
    '---',
    '',
    content,
  ]
    .filter(Boolean)
    .join('\n')

  fs.writeFileSync(getPostFile(slug), frontmatter, 'utf-8')

  return getPost(slug)!
}

export function updatePost(slug: string, data: PostFrontmatter, content: string): Post {
  const filePath = getPostFile(slug)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post not found: ${slug}`)
  }

  const frontmatter = [
    '---',
    `title: "${data.title}"`,
    `date: "${data.date}"`,
    `updatedDate: "${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}"`,
    `frontmatter: "${data.frontmatter}"`,
    `tags: [${data.tags.map((t) => `"${t}"`).join(', ')}]`,
    data.category ? `category: "${data.category}"` : '',
    `draft: ${data.draft ?? false}`,
    '---',
    '',
    content,
  ]
    .filter(Boolean)
    .join('\n')

  fs.writeFileSync(filePath, frontmatter, 'utf-8')

  return getPost(slug)!
}

export function deletePost(slug: string): void {
  const dir = getPostDir(slug)
  if (!fs.existsSync(dir)) {
    throw new Error(`Post not found: ${slug}`)
  }

  fs.rmSync(dir, { recursive: true, force: true })
}

export function publishPost(slug: string): Post {
  const post = getPost(slug)
  if (!post) throw new Error(`Post not found: ${slug}`)

  return updatePost(slug, { ...post, draft: false }, post.content)
}

export function unpublishPost(slug: string): Post {
  const post = getPost(slug)
  if (!post) throw new Error(`Post not found: ${slug}`)

  return updatePost(slug, { ...post, draft: true }, post.content)
}
