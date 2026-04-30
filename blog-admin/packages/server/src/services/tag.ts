import * as postService from './post.js'
import type { Tag } from '@blog-admin/shared'

export function listTags(): Tag[] {
  const posts = postService.listPosts()
  const tagMap = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function renameTag(oldName: string, newName: string): void {
  const posts = postService.listPosts()
  for (const post of posts) {
    if (post.tags.includes(oldName)) {
      const newTags = post.tags.map((t) => (t === oldName ? newName : t))
      const fullPost = postService.getPost(post.slug)!
      postService.updatePost(post.slug, { ...fullPost, tags: newTags }, fullPost.content)
    }
  }
}

export function deleteTag(name: string): void {
  const posts = postService.listPosts()
  for (const post of posts) {
    if (post.tags.includes(name)) {
      const newTags = post.tags.filter((t) => t !== name)
      const fullPost = postService.getPost(post.slug)!
      postService.updatePost(post.slug, { ...fullPost, tags: newTags }, fullPost.content)
    }
  }
}
