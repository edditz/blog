export interface PostFrontmatter {
  title: string
  date: string
  frontmatter: string
  tags: string[]
  category?: string
  image?: string
  draft?: boolean
  updatedDate?: string
}

export interface PostMeta extends PostFrontmatter {
  slug: string
}

export interface Post extends PostMeta {
  content: string
}

export interface PostListQuery {
  search?: string
  tag?: string
  category?: string
  status?: 'all' | 'draft' | 'published'
  page?: number
  limit?: number
}

export interface PostListResponse {
  posts: PostMeta[]
  total: number
  page: number
  limit: number
}

export interface BatchAction {
  action: 'delete' | 'publish' | 'unpublish' | 'tag'
  slugs: string[]
  tags?: string[]
}

export interface Tag {
  name: string
  count: number
}

export interface Category {
  name: string
  count: number
}

export interface ImageUploadResponse {
  filename: string
  path: string
  url: string
}

export interface ApiError {
  error: string
  message: string
}
