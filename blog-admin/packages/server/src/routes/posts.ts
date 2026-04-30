import { Router } from 'express'
import * as postService from '../services/post.js'
import type { PostListQuery, BatchAction } from '@blog-admin/shared'

const router = Router()

router.get('/', (req, res) => {
  try {
    const query: PostListQuery = req.query as PostListQuery
    let posts = postService.listPosts()

    if (query.tag) {
      posts = posts.filter((p) => p.tags.includes(query.tag!))
    }
    if (query.category) {
      posts = posts.filter((p) => p.category === query.category)
    }
    if (query.status === 'draft') {
      posts = posts.filter((p) => p.draft)
    } else if (query.status === 'published') {
      posts = posts.filter((p) => !p.draft)
    }
    if (query.search) {
      const q = query.search.toLowerCase()
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.frontmatter.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    const page = query.page || 1
    const limit = query.limit || 20
    const start = (page - 1) * limit

    res.json({
      posts: posts.slice(start, start + limit),
      total: posts.length,
      page,
      limit,
    })
  } catch (err) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: String(err) })
  }
})

router.get('/:slug', (req, res) => {
  const post = postService.getPost(req.params.slug)
  if (!post) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Post not found' })
  }
  res.json(post)
})

router.post('/', (req, res) => {
  try {
    const { slug, ...data } = req.body
    const post = postService.createPost(slug, data, req.body.content || '')
    res.status(201).json(post)
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.put('/:slug', (req, res) => {
  try {
    const post = postService.updatePost(req.params.slug, req.body, req.body.content)
    res.json(post)
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.delete('/:slug', (req, res) => {
  try {
    postService.deletePost(req.params.slug)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.post('/batch', (req, res) => {
  try {
    const { action, slugs, tags }: BatchAction = req.body
    const results: string[] = []

    for (const slug of slugs) {
      switch (action) {
        case 'delete':
          postService.deletePost(slug)
          break
        case 'publish':
          postService.publishPost(slug)
          break
        case 'unpublish':
          postService.unpublishPost(slug)
          break
        case 'tag':
          if (tags) {
            const post = postService.getPost(slug)
            if (post) {
              const newTags = [...new Set([...post.tags, ...tags])]
              postService.updatePost(slug, { ...post, tags: newTags }, post.content)
            }
          }
          break
      }
      results.push(slug)
    }

    res.json({ processed: results })
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

export default router
