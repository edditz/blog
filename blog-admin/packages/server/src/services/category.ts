import * as postService from './post.js'
import type { Category } from '@blog-admin/shared'

export function listCategories(): Category[] {
  const posts = postService.listPosts()
  const catMap = new Map<string, number>()

  for (const post of posts) {
    if (post.category) {
      catMap.set(post.category, (catMap.get(post.category) || 0) + 1)
    }
  }

  return Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function renameCategory(oldName: string, newName: string): void {
  const posts = postService.listPosts()
  for (const post of posts) {
    if (post.category === oldName) {
      const fullPost = postService.getPost(post.slug)!
      postService.updatePost(post.slug, { ...fullPost, category: newName }, fullPost.content)
    }
  }
}

export function deleteCategory(name: string): void {
  const posts = postService.listPosts()
  for (const post of posts) {
    if (post.category === name) {
      const fullPost = postService.getPost(post.slug)!
      postService.updatePost(post.slug, { ...fullPost, category: undefined }, fullPost.content)
    }
  }
}
