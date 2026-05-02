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
  tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'tag-api-test-'))
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
  await createFixturePost('post-a', `title: "Post A"\ndate: "01/15/2024"\ntags: ["react", "javascript"]`)
  await createFixturePost('post-b', `title: "Post B"\ndate: "02/20/2024"\ntags: ["react", "vue"]`)
  await createFixturePost('post-c', `title: "Post C"\ndate: "03/10/2024"\ntags: ["golang"]`)
})

afterEach(async () => {
  await fs.promises.rm(postsDir, { recursive: true, force: true })
})

describe('GET /api/tags', () => {
  it('should return all tags with correct counts', async () => {
    const res = await request(app).get('/api/tags')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        { name: 'react', count: 2 },
        { name: 'javascript', count: 1 },
        { name: 'vue', count: 1 },
        { name: 'golang', count: 1 },
      ])
    )
    expect(res.body).toHaveLength(4)
  })

  it('should sort tags by count descending', async () => {
    const res = await request(app).get('/api/tags')

    expect(res.body[0].name).toBe('react')
    expect(res.body[0].count).toBe(2)
  })
})

describe('PUT /api/tags/:name', () => {
  it('should rename a tag across all posts', async () => {
    const res = await request(app)
      .put('/api/tags/react')
      .send({ name: 'reactjs' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })

    // Verify API no longer returns old tag
    const tags = await request(app).get('/api/tags')
    const names = tags.body.map((t: { name: string }) => t.name)
    expect(names).toContain('reactjs')
    expect(names).not.toContain('react')

    // Verify file content
    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    const postB = await fs.promises.readFile(path.join(postsDir, 'post-b', 'index.mdx'), 'utf-8')
    expect(postA).toContain('reactjs')
    expect(postA).not.toContain('"react"')
    expect(postB).toContain('reactjs')
    expect(postB).not.toContain('"react"')
  })

  it('should not affect posts without the old tag', async () => {
    await request(app)
      .put('/api/tags/vue')
      .send({ name: 'vuejs' })

    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    expect(postA).toContain('"react"')
    expect(postA).toContain('"javascript"')
  })

  it('should not affect posts when renaming a non-existent tag', async () => {
    const res = await request(app)
      .put('/api/tags/nonexistent')
      .send({ name: 'whatever' })

    expect(res.status).toBe(200)

    // All original tags should remain unchanged
    const tags = await request(app).get('/api/tags')
    const names = tags.body.map((t: { name: string }) => t.name)
    expect(names).toContain('react')
    expect(names).toContain('javascript')
    expect(names).toContain('vue')
    expect(names).toContain('golang')
  })
})

describe('DELETE /api/tags/:name', () => {
  it('should remove tag from all posts', async () => {
    const res = await request(app).delete('/api/tags/react')

    expect(res.status).toBe(204)

    // Verify API no longer returns the deleted tag
    const tags = await request(app).get('/api/tags')
    const names = tags.body.map((t: { name: string }) => t.name)
    expect(names).not.toContain('react')

    // Verify file content - tag removed, other tags preserved
    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    const postB = await fs.promises.readFile(path.join(postsDir, 'post-b', 'index.mdx'), 'utf-8')
    expect(postA).not.toContain('"react"')
    expect(postA).toContain('"javascript"')
    expect(postB).not.toContain('"react"')
    expect(postB).toContain('"vue"')
  })

  it('should not affect posts without the deleted tag', async () => {
    await request(app).delete('/api/tags/vue')

    const postA = await fs.promises.readFile(path.join(postsDir, 'post-a', 'index.mdx'), 'utf-8')
    expect(postA).toContain('"react"')
    expect(postA).toContain('"javascript"')
  })

  it('should handle deleting a non-existent tag gracefully', async () => {
    const res = await request(app).delete('/api/tags/nonexistent')

    expect(res.status).toBe(204)

    // All tags should remain
    const tags = await request(app).get('/api/tags')
    expect(tags.body).toHaveLength(4)
  })
})
