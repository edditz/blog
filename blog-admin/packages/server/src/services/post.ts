import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { config } from '../config.js'
import type { Post, PostMeta } from '@blog-admin/shared'

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
