import axios from 'axios'
import type {
  Post,
  PostMeta,
  PostFrontmatter,
  PostListQuery,
  PostListResponse,
  BatchAction,
  Tag,
  Category,
  ImageUploadResponse,
} from '@blog-admin/shared'

const api = axios.create({ baseURL: '/api' })

export async function listPosts(query: PostListQuery = {}): Promise<PostListResponse> {
  const { data } = await api.get('/posts', { params: query })
  return data
}

export async function getPost(slug: string): Promise<Post> {
  const { data } = await api.get(`/posts/${slug}`)
  return data
}

export async function createPost(slug: string, post: PostFrontmatter, content: string): Promise<Post> {
  const { data } = await api.post('/posts', { slug, ...post, content })
  return data
}

export async function updatePost(slug: string, post: PostFrontmatter, content: string): Promise<Post> {
  const { data } = await api.put(`/posts/${slug}`, { ...post, content })
  return data
}

export async function deletePost(slug: string): Promise<void> {
  await api.delete(`/posts/${slug}`)
}

export async function batchAction(action: BatchAction): Promise<void> {
  await api.post('/posts/batch', action)
}

export async function listTags(): Promise<Tag[]> {
  const { data } = await api.get('/tags')
  return data
}

export async function renameTag(oldName: string, newName: string): Promise<void> {
  await api.put(`/tags/${oldName}`, { name: newName })
}

export async function deleteTag(name: string): Promise<void> {
  await api.delete(`/tags/${name}`)
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data
}

export async function renameCategory(oldName: string, newName: string): Promise<void> {
  await api.put(`/categories/${oldName}`, { name: newName })
}

export async function deleteCategory(name: string): Promise<void> {
  await api.delete(`/categories/${name}`)
}

export async function uploadImage(slug: string, file: File): Promise<ImageUploadResponse> {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post(`/images/${slug}`, formData)
  return data
}

export async function deleteImage(slug: string, filename: string): Promise<void> {
  await api.delete(`/images/${slug}/${filename}`)
}
