import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import request from 'supertest'
import type { Express } from 'express'

let tmpDir: string
let postsDir: string
let app: Express

beforeAll(async () => {
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'category-api-test-'))
  postsDir = path.join(tmpDir, 'src', 'posts')
  process.env.BLOG_ROOT = tmpDir

  const { createApp } = await import('../index.js')
  app = createApp()
})

afterAll(() => {
  delete process.env.BLOG_ROOT
})

async function createFixturePost(slug: string, frontmatter: string, content = 'Content') {
  const dir = path.join(postsDir, slug)
  await fs.promises.mkdir(dir, { recursive: true })
  const fileContent = `---\n${frontmatter}\n---\n\n${content}`
  await fs.promises.writeFile(path.join(dir, 'index.mdx'), fileContent, 'utf-8')
}

beforeEach(async () => {
  await createFixturePost('post-a', `title: "Post A"\ndate: "01/15/2024"\ntags: ["react"]\ncategory: "Frontend"`)
  await createFixturePost('post-b', `title: "Post B"\ndate: "02/20/2024"\ntags: ["react"]\ncategory: "Frontend"`)
  await createFixturePost('post-c', `title: "Post C"\ndate: "03/10/2024"\ntags: ["docker"]\ncategory: "DevOps"`)
  await createFixturePost('post-d', `title: "Post D"\ndate: "04/05/2024"\ntags: ["go"]`)
})

afterEach(async () => {
  await fs.promises.rm(postsDir, { recursive: true, force: true })
})

describe('GET /api/categories', () => {
  it('should return all categories with correct counts', async () => {
    const res = await request(app).get('/api/categories')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        { name: 'Frontend', count: 2 },
        { name: 'DevOps', count: 1 },
      ])
    )
    expect(res.body).toHaveLength(2)
  })

  it('should sort categories by count descending', async () => {
    const res = await request(app).get('/api/categories')

    expect(res.body[0].name).toBe('Frontend')
    expect(res.body[0].count).toBe(2)
  })

  it('should not include posts without a category', async () => {
    const res = await request(app).get('/api/categories')

    const names = res.body.map((c: { name: string }) => c.name)
    // post-d has no category, should not appear
    expect(res.body).toHaveLength(2)
  })
})

describe('PUT /api/categories/:name', () => {
  it('should rename a category across all posts', async () => {
    const res = await request(app)
      .put('/api/categories/Frontend')
      .send({ name: 'Front-end' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    // Verify API returns new name
    const cats = await request(app).get('/api/categories')
    const names = cats.body.map((c: { name: string }) => c.name)
    expect(names).toContain('Front-end')
    expect(names).not.toContain('Frontend')

    // Verify file content
    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    const postB = await fs.promises.readFile(path.join(postsDir, 'post-b', 'index.mdx'), 'utf-8')
    expect(postA).toContain('category: "Front-end"')
    expect(postA).not.toContain('category: "Frontend"')
    expect(postB).toContain('category: "Front-end"')
  })

  it('should not affect posts with a different category', async () => {
    await request(app)
      .put('/api/categories/DevOps')
      .send({ name: 'Dev-Ops' })

    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    expect(postA).toContain('category: "Frontend"')
  })

  it('should not affect posts without a category', async () => {
    await request(app)
      .put('/api/categories/Frontend')
      .send({ name: 'FE' })

    const postD = await fs.promises.readFile(path.join(postsDir, 'post-d', 'index.mdx'), 'utf-8')
    expect(postD).not.toContain('category:')
  })

  it('should handle renaming a non-existent category gracefully', async () => {
    const res = await request(app)
      .put('/api/categories/NonExistent')
      .send({ name: 'Whatever' })

    expect(res.status).toBe(200)

    const cats = await request(app).get('/api/categories')
    expect(cats.body).toHaveLength(2)
  })
})

describe('DELETE /api/categories/:name', () => {
  it('should remove category from all posts that have it', async () => {
    const res = await request(app).delete('/api/categories/Frontend')

    expect(res.status).toBe(204)

    // Verify API no longer returns the deleted category
    const cats = await request(app).get('/api/categories')
    const names = cats.body.map((c: { name: string }) => c.name)
    expect(names).not.toContain('Frontend')
    expect(names).toContain('DevOps')

    // Verify file content - category removed from posts
    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    const postB = await fs.promises.readFile(path.join(postsDir, 'post-b', 'index.mdx'), 'utf-8')
    expect(postA).not.toContain('category:')
    expect(postB).not.toContain('category:')

    // Other posts unaffected
    const postC = await fs.promises.readFile(path.join(postsDir, 'post-c', 'index.mdx'), 'utf-8')
    expect(postC).toContain('category: "DevOps"')
  })

  it('should not affect posts with a different category', async () => {
    await request(app).delete('/api/categories/DevOps')

    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    expect(postA).toContain('category: "Frontend"')
  })

  it('should not affect posts without a category', async () => {
    await request(app).delete('/api/categories/Frontend')

    const postD = await fs.promises.readFile(path.join(postsDir, 'post-d', 'index.mdx'), 'utf-8')
    expect(postD).not.toContain('category:')
    // post-d content should be intact
    expect(postD).toContain('Content')
  })

  it('should handle deleting a non-existent category gracefully', async () => {
    const res = await request(app).delete('/api/categories/NonExistent')

    expect(res.status).toBe(204)

    const cats = await request(app).get('/api/categories')
    expect(cats.body).toHaveLength(2)
  })
})
