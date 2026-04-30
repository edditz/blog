# Blog Admin Dashboard Implementation Plan

> **Status:** Implementation complete. All UI components migrated to HeroUI v3 (Beta).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local blog management dashboard with dual-mode editor (WYSIWYG + source), image management, and CRUD operations for posts, tags, and categories.

**Architecture:** Monorepo with pnpm workspaces. React SPA frontend (HeroUI + TipTap + CodeMirror) communicates with Express backend via REST API. Backend reads/writes MDX files directly from the blog project's `src/posts/` directory.

**Tech Stack:** React 19, TypeScript, HeroUI v3 (Beta), TipTap, CodeMirror 6, Express, gray-matter, Vite, Tailwind CSS v4, pnpm workspaces

---

## File Structure

```
blog-admin/
├── package.json                    # Root package.json with workspaces
├── pnpm-workspace.yaml             # pnpm workspace config
├── tsconfig.base.json              # Shared TypeScript config
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── types.ts            # Shared type definitions
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts            # Express server entry
│   │       ├── config.ts           # Configuration loader
│   │       ├── routes/
│   │       │   ├── posts.ts        # Post CRUD routes
│   │       │   ├── images.ts       # Image upload/serve routes
│   │       │   ├── tags.ts         # Tag management routes
│   │       │   └── categories.ts   # Category management routes
│   │       └── services/
│   │           ├── post.ts         # Post file operations
│   │           ├── tag.ts          # Tag aggregation from posts
│   │           └── category.ts     # Category aggregation from posts
│   └── client/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/
│           │   └── client.ts       # Axios instance + API functions
│           ├── stores/
│           │   ├── posts.ts        # Post list state
│           │   └── editor.ts       # Editor state
│           ├── pages/
│           │   ├── PostList.tsx
│           │   ├── PostEdit.tsx
│           │   ├── TagManager.tsx
│           │   └── CategoryManager.tsx
│           ├── components/
│           │   ├── layout/
│           │   │   ├── Sidebar.tsx
│           │   │   └── AdminLayout.tsx
│           │   ├── posts/
│           │   │   ├── PostTable.tsx
│           │   │   ├── PostFilters.tsx
│           │   │   └── BatchActions.tsx
│           │   ├── editor/
│           │   │   ├── SourceEditor.tsx      # CodeMirror
│           │   │   ├── WysiwygEditor.tsx     # TipTap
│           │   │   ├── EditorToolbar.tsx
│           │   │   ├── ModeSwitch.tsx
│           │   │   ├── FrontmatterForm.tsx
│           │   │   ├── ImageManager.tsx
│           │   │   └── SlashCommand.tsx
│           │   └── ui/
│           │       └── (removed — using HeroUI v3 directly)
│           └── types/
│               └── index.ts        # Re-exports from shared
```

---

## Phase 1: Monorepo Setup

### Task 1: Create Root Monorepo Structure

**Files:**
- Create: `blog-admin/package.json`
- Create: `blog-admin/pnpm-workspace.yaml`
- Create: `blog-admin/tsconfig.base.json`
- Create: `blog-admin/.gitignore`

- [ ] **Step 1: Create project root directory**

```bash
mkdir -p blog-admin/packages/{shared/src,server/src/{routes,services},client/src}
cd blog-admin
git init
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "blog-admin",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "start": "pnpm --filter @blog-admin/server start"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

- [ ] **Step 3: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .gitignore**

```
node_modules
dist
*.local
.env
.env.*
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -chore: initialize monorepo structure
```

---

### Task 2: Setup Shared Types Package

**Files:**
- Create: `blog-admin/packages/shared/package.json`
- Create: `blog-admin/packages/shared/tsconfig.json`
- Create: `blog-admin/packages/shared/src/types.ts`

- [ ] **Step 1: Create shared package.json**

```json
{
  "name": "@blog-admin/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/types.ts",
  "types": "./src/types.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create shared tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create shared types**

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat: add shared types package"
```

---

### Task 3: Setup Server Package

**Files:**
- Create: `blog-admin/packages/server/package.json`
- Create: `blog-admin/packages/server/tsconfig.json`
- Create: `blog-admin/packages/server/src/index.ts`
- Create: `blog-admin/packages/server/src/config.ts`

- [ ] **Step 1: Create server package.json**

```json
{
  "name": "@blog-admin/server",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@blog-admin/shared": "workspace:*",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "gray-matter": "^4.0.3",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create server tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create config module**

```typescript
import path from 'node:path'
import fs from 'node:fs'

export interface Config {
  blogRoot: string
  postsDir: string
  port: number
}

function loadConfig(): Config {
  // Walk up from cwd to find blog-admin.config.json (monorepo root)
  let dir = process.cwd()
  let configPath = ''
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, 'blog-admin.config.json')
    if (fs.existsSync(candidate)) {
      configPath = candidate
      break
    }
    dir = path.dirname(dir)
  }

  let fileConfig: Partial<Config> = {}
  if (configPath) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  return {
    blogRoot: process.env.BLOG_ROOT || fileConfig.blogRoot || process.cwd(),
    postsDir: fileConfig.postsDir || 'src/posts',
    port: Number(process.env.PORT) || fileConfig.port || 3001,
  }
}

export const config = loadConfig()
```

- [ ] **Step 4: Create server entry**

```typescript
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', blogRoot: config.blogRoot })
})

// Serve static frontend in production
const clientDist = path.resolve(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.listen(config.port, () => {
  console.log(`Blog Admin running on http://localhost:${config.port}`)
  console.log(`Blog root: ${config.blogRoot}`)
})
```

- [ ] **Step 5: Install dependencies and verify**

```bash
cd blog-admin
pnpm install
pnpm --filter @blog-admin/server dev
```

Expected: Server starts on port 3001, logs "Blog Admin running on http://localhost:3001"

- [ ] **Step 6: Commit**

```bash
git add packages/server
git commit -m "feat: add server package with Express setup"
```

---

### Task 4: Setup Client Package

**Files:**
- Create: `blog-admin/packages/client/package.json`
- Create: `blog-admin/packages/client/tsconfig.json`
- Create: `blog-admin/packages/client/vite.config.ts`
- Create: `blog-admin/packages/client/index.html`
- Create: `blog-admin/packages/client/src/main.tsx`
- Create: `blog-admin/packages/client/src/App.tsx`

- [ ] **Step 1: Create client package.json**

```json
{
  "name": "@blog-admin/client",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@blog-admin/shared": "workspace:*",
    "@heroui/react": "^3.0.0",
    "@heroui/styles": "^3.0.0",
    "@tiptap/extension-image": "^2.6.0",
    "@tiptap/extension-placeholder": "^2.6.0",
    "@tiptap/pm": "^2.6.0",
    "@tiptap/react": "^2.6.0",
    "@tiptap/starter-kit": "^2.6.0",
    "axios": "^1.7.0",
    "codemirror": "^6.0.1",
    "@codemirror/lang-markdown": "^6.2.0",
    "@codemirror/language-data": "^6.5.0",
    "@codemirror/view": "^6.28.0",
    "@codemirror/state": "^6.4.0",
    "framer-motion": "^11.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create client tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blog Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] **Step 6: Create App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import PostList from './pages/PostList'
import PostEdit from './pages/PostEdit'
import TagManager from './pages/TagManager'
import CategoryManager from './pages/CategoryManager'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/new" element={<PostEdit />} />
        <Route path="/posts/:slug/edit" element={<PostEdit />} />
        <Route path="/tags" element={<TagManager />} />
        <Route path="/categories" element={<CategoryManager />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 7: Install and verify**

```bash
cd blog-admin
pnpm install
pnpm --filter @blog-admin/client dev
```

Expected: Vite dev server starts on port 5173

- [ ] **Step 8: Commit**

```bash
git add packages/client
git commit -m "feat: add client package with React + Vite setup"
```

---

## Phase 2: Backend - Post CRUD

### Task 5: Post Service - Read Posts

**Files:**
- Create: `blog-admin/packages/server/src/services/post.ts`

- [ ] **Step 1: Create post service**

```typescript
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { config } from '../config.js'
import type { Post, PostMeta, PostFrontmatter } from '@blog-admin/shared'

const postsPath = () => path.resolve(config.blogRoot, config.postsDir)

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
```

- [ ] **Step 2: Commit**

```bash
git add packages/server/src/services/post.ts
git commit -m "feat: add post service with read operations"
```

---

### Task 6: Post Service - Write Operations

**Files:**
- Modify: `blog-admin/packages/server/src/services/post.ts`

- [ ] **Step 1: Add write operations to post service**

Append to `packages/server/src/services/post.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/server/src/services/post.ts
git commit -m "feat: add post write operations (create, update, delete)"
```

---

### Task 7: Post API Routes

**Files:**
- Create: `blog-admin/packages/server/src/routes/posts.ts`
- Modify: `blog-admin/packages/server/src/index.ts`

- [ ] **Step 1: Create posts routes**

```typescript
import { Router } from 'express'
import * as postService from '../services/post.js'
import type { PostListQuery, BatchAction } from '@blog-admin/shared'

const router = Router()

router.get('/', (req, res) => {
  try {
    const query: PostListQuery = req.query
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
```

- [ ] **Step 2: Register routes in server index**

Modify `packages/server/src/index.ts` to add:

```typescript
import postsRouter from './routes/posts.js'

// After app.use(express.json())
app.use('/api/posts', postsRouter)
```

- [ ] **Step 3: Test the API**

```bash
pnpm --filter @blog-admin/server dev
curl http://localhost:3001/api/posts
```

Expected: JSON response with posts list from the blog project

- [ ] **Step 4: Commit**

```bash
git add packages/server/src/routes/posts.ts packages/server/src/index.ts
git commit -m "feat: add post CRUD API routes"
```

---

### Task 8: Tag and Category Services + Routes

**Files:**
- Create: `blog-admin/packages/server/src/services/tag.ts`
- Create: `blog-admin/packages/server/src/services/category.ts`
- Create: `blog-admin/packages/server/src/routes/tags.ts`
- Create: `blog-admin/packages/server/src/routes/categories.ts`
- Modify: `blog-admin/packages/server/src/index.ts`

- [ ] **Step 1: Create tag service**

```typescript
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
```

- [ ] **Step 2: Create category service**

```typescript
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
```

- [ ] **Step 3: Create tags routes**

```typescript
import { Router } from 'express'
import * as tagService from '../services/tag.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(tagService.listTags())
})

router.put('/:name', (req, res) => {
  try {
    tagService.renameTag(req.params.name, req.body.name)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.delete('/:name', (req, res) => {
  try {
    tagService.deleteTag(req.params.name)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

export default router
```

- [ ] **Step 4: Create categories routes**

```typescript
import { Router } from 'express'
import * as categoryService from '../services/category.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(categoryService.listCategories())
})

router.put('/:name', (req, res) => {
  try {
    categoryService.renameCategory(req.params.name, req.body.name)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.delete('/:name', (req, res) => {
  try {
    categoryService.deleteCategory(req.params.name)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

export default router
```

- [ ] **Step 5: Register routes in server index**

Add to `packages/server/src/index.ts`:

```typescript
import tagsRouter from './routes/tags.js'
import categoriesRouter from './routes/categories.js'

app.use('/api/tags', tagsRouter)
app.use('/api/categories', categoriesRouter)
```

- [ ] **Step 6: Test**

```bash
curl http://localhost:3001/api/tags
curl http://localhost:3001/api/categories
```

Expected: JSON arrays with tag/category counts

- [ ] **Step 7: Commit**

```bash
git add packages/server/src/services/tag.ts packages/server/src/services/category.ts packages/server/src/routes/tags.ts packages/server/src/routes/categories.ts packages/server/src/index.ts
git commit -m "feat: add tag and category services with routes"
```

---

### Task 9: Image Upload Routes

**Files:**
- Create: `blog-admin/packages/server/src/routes/images.ts`
- Modify: `blog-admin/packages/server/src/index.ts`

- [ ] **Step 1: Install multer types**

```bash
pnpm --filter @blog-admin/server add multer @types/multer
```

- [ ] **Step 2: Create images routes**

```typescript
import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { config } from '../config.js'

const router = Router({ mergeParams: true })

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.resolve(config.blogRoot, config.postsDir, req.params.slug, 'images')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
    cb(null, `${name}${ext}`)
  },
})

const upload = multer({ storage })

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'NO_FILE', message: 'No file uploaded' })
  }

  const { slug } = req.params
  const filename = req.file.filename

  res.json({
    filename,
    path: `images/${filename}`,
    url: `/api/images/${slug}/${filename}`,
  })
})

router.get('/:file', (req, res) => {
  const filePath = path.resolve(
    config.blogRoot,
    config.postsDir,
    req.params.slug,
    'images',
    req.params.file,
  )

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Image not found' })
  }

  res.sendFile(filePath)
})

router.delete('/:file', (req, res) => {
  const filePath = path.resolve(
    config.blogRoot,
    config.postsDir,
    req.params.slug,
    'images',
    req.params.file,
  )

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Image not found' })
  }

  fs.unlinkSync(filePath)
  res.status(204).send()
})

export default router
```

- [ ] **Step 3: Register routes**

Add to `packages/server/src/index.ts`:

```typescript
import imagesRouter from './routes/images.js'

app.use('/api/images/:slug', imagesRouter)
```

- [ ] **Step 4: Commit**

```bash
git add packages/server/src/routes/images.ts packages/server/src/index.ts
git commit -m "feat: add image upload and serve routes"
```

---

## Phase 3: Frontend - Layout & Pages

### Task 10: API Client

**Files:**
- Create: `blog-admin/packages/client/src/api/client.ts`

- [ ] **Step 1: Create API client**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/api/client.ts
git commit -m "feat: add API client with all endpoint functions"
```

---

### Task 11: Admin Layout with Sidebar

**Files:**
- Create: `blog-admin/packages/client/src/components/layout/AdminLayout.tsx`
- Create: `blog-admin/packages/client/src/components/layout/Sidebar.tsx`
- Create: `blog-admin/packages/client/src/index.css`

- [ ] **Step 1: Create index.css with Tailwind**

```css
@import "tailwindcss";
@import "@heroui/styles";
```

Note: Tailwind CSS v4 uses CSS-first config. No `tailwind.config.ts` or `postcss.config.js` needed. The `@tailwindcss/vite` plugin handles everything.

- [ ] **Step 2: Create Sidebar component**

```tsx
import { NavLink } from 'react-router-dom'
import { FileText, Tag, Folder } from 'lucide-react'

const navItems = [
  { to: '/posts', label: '文章', icon: FileText },
  { to: '/tags', label: '标签', icon: Tag },
  { to: '/categories', label: '分类', icon: Folder },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-surface border-r border-default min-h-screen p-4">
      <h1 className="text-xl font-bold mb-6 px-2">Blog Admin</h1>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-surface-secondary hover:text-foreground'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 5: Create AdminLayout component**

```tsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Install dependencies**

```bash
pnpm --filter @blog-admin/client add lucide-react @heroui/react @heroui/styles
pnpm --filter @blog-admin/client add -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 7: Commit**

```bash
git add packages/client/src/components/layout/ packages/client/src/index.css
git commit -m "feat: add admin layout with sidebar navigation"
```

---

### Task 12: Post List Page

**Files:**
- Create: `blog-admin/packages/client/src/pages/PostList.tsx`
- Create: `blog-admin/packages/client/src/components/posts/PostTable.tsx`

- [ ] **Step 1: Create PostTable component**

```tsx
import type { PostMeta } from '@blog-admin/shared'
import { useNavigate } from 'react-router-dom'

interface Props {
  posts: PostMeta[]
  selected: Set<string>
  onSelect: (slug: string) => void
  onSelectAll: () => void
}

export default function PostTable({ posts, selected, onSelect, onSelectAll }: Props) {
  const navigate = useNavigate()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-800">
          <th className="py-3 px-2 text-left">
            <input
              type="checkbox"
              checked={selected.size === posts.length && posts.length > 0}
              onChange={onSelectAll}
            />
          </th>
          <th className="py-3 px-2 text-left">标题</th>
          <th className="py-3 px-2 text-left">标签</th>
          <th className="py-3 px-2 text-left">日期</th>
          <th className="py-3 px-2 text-left">状态</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr
            key={post.slug}
            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
            onClick={() => navigate(`/posts/${post.slug}/edit`)}
          >
            <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(post.slug)}
                onChange={() => onSelect(post.slug)}
              />
            </td>
            <td className="py-3 px-2 font-medium">{post.title}</td>
            <td className="py-3 px-2">
              <div className="flex gap-1 flex-wrap">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td className="py-3 px-2 text-gray-500">{post.date}</td>
            <td className="py-3 px-2">
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  post.draft
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}
              >
                {post.draft ? '草稿' : '已发布'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 2: Create PostList page**

```tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { listPosts, batchAction } from '@/api/client'
import PostTable from '@/components/posts/PostTable'
import type { PostMeta } from '@blog-admin/shared'

export default function PostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [selected, setSelected] = useState(new Set<string>())
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listPosts({ search: search || undefined, status })
      setPosts(res.posts)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const toggleSelect = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.slug)),
    )
  }

  const handleBatch = async (action: 'delete' | 'publish' | 'unpublish') => {
    if (selected.size === 0) return
    await batchAction({ action, slugs: Array.from(selected) })
    setSelected(new Set())
    fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">文章</h2>
        <button
          onClick={() => navigate('/posts/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          新建文章
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索标题、摘要、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        >
          <option value="all">全部</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <span className="text-sm text-gray-500">已选 {selected.size} 篇</span>
          <button onClick={() => handleBatch('publish')} className="text-sm text-blue-600 hover:underline">
            发布
          </button>
          <button onClick={() => handleBatch('unpublish')} className="text-sm text-blue-600 hover:underline">
            取消发布
          </button>
          <button onClick={() => handleBatch('delete')} className="text-sm text-red-600 hover:underline">
            删除
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">暂无文章</div>
      ) : (
        <PostTable posts={posts} selected={selected} onSelect={toggleSelect} onSelectAll={toggleSelectAll} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Test**

```bash
pnpm --filter @blog-admin/client dev
```

Expected: Post list page shows posts from the blog

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/pages/PostList.tsx packages/client/src/components/posts/PostTable.tsx
git commit -m "feat: add post list page with search and batch operations"
```

---

### Task 13: Tag and Category Management Pages

**Files:**
- Create: `blog-admin/packages/client/src/pages/TagManager.tsx`
- Create: `blog-admin/packages/client/src/pages/CategoryManager.tsx`

- [ ] **Step 1: Create TagManager page**

```tsx
import { useEffect, useState } from 'react'
import { listTags, renameTag, deleteTag } from '@/api/client'
import type { Tag } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const fetchTags = async () => {
    setTags(await listTags())
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditing(null)
      return
    }
    await renameTag(oldName, newName.trim())
    setEditing(null)
    fetchTags()
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除标签 "${name}"？这会从所有文章中移除该标签。`)) return
    await deleteTag(name)
    fetchTags()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">标签管理</h2>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.name}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            {editing === tag.name ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(tag.name)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.name)}
                className="px-2 py-1 border rounded bg-white dark:bg-gray-800"
              />
            ) : (
              <span className="font-medium">{tag.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{tag.count} 篇文章</span>
              <button
                onClick={() => {
                  setEditing(tag.name)
                  setNewName(tag.name)
                }}
                className="text-gray-400 hover:text-blue-600"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(tag.name)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {tags.length === 0 && <p className="text-gray-500">暂无标签</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CategoryManager page**

```tsx
import { useEffect, useState } from 'react'
import { listCategories, renameCategory, deleteCategory } from '@/api/client'
import type { Category } from '@blog-admin/shared'
import { Pencil, Trash2 } from 'lucide-react'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const fetchCategories = async () => {
    setCategories(await listCategories())
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditing(null)
      return
    }
    await renameCategory(oldName, newName.trim())
    setEditing(null)
    fetchCategories()
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除分类 "${name}"？这会从所有文章中移除该分类。`)) return
    await deleteCategory(name)
    fetchCategories()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">分类管理</h2>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            {editing === cat.name ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRename(cat.name)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.name)}
                className="px-2 py-1 border rounded bg-white dark:bg-gray-800"
              />
            ) : (
              <span className="font-medium">{cat.name}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{cat.count} 篇文章</span>
              <button
                onClick={() => {
                  setEditing(cat.name)
                  setNewName(cat.name)
                }}
                className="text-gray-400 hover:text-blue-600"
              >
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(cat.name)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500">暂无分类</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/pages/TagManager.tsx packages/client/src/pages/CategoryManager.tsx
git commit -m "feat: add tag and category management pages"
```

---

## Phase 4: Editor

### Task 14: Frontmatter Form

**Files:**
- Create: `blog-admin/packages/client/src/components/editor/FrontmatterForm.tsx`

- [ ] **Step 1: Create FrontmatterForm component**

```tsx
import type { PostFrontmatter } from '@blog-admin/shared'

interface Props {
  data: PostFrontmatter
  onChange: (data: PostFrontmatter) => void
}

export default function FrontmatterForm({ data, onChange }: Props) {
  const update = (partial: Partial<PostFrontmatter>) => {
    onChange({ ...data, ...partial })
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">日期</label>
        <input
          type="text"
          value={data.date}
          onChange={(e) => update({ date: e.target.value })}
          placeholder="MM/DD/YYYY"
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">摘要</label>
        <input
          type="text"
          value={data.frontmatter}
          onChange={(e) => update({ frontmatter: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">标签（逗号分隔）</label>
        <input
          type="text"
          value={data.tags.join(', ')}
          onChange={(e) =>
            update({
              tags: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">分类</label>
        <input
          type="text"
          value={data.category || ''}
          onChange={(e) => update({ category: e.target.value || undefined })}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div className="col-span-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.draft ?? false}
            onChange={(e) => update({ draft: e.target.checked })}
          />
          <span className="text-sm">草稿</span>
        </label>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/components/editor/FrontmatterForm.tsx
git commit -m "feat: add frontmatter form component"
```

---

### Task 15: CodeMirror Source Editor

**Files:**
- Create: `blog-admin/packages/client/src/components/editor/SourceEditor.tsx`

- [ ] **Step 1: Create SourceEditor component**

```tsx
import { useEffect, useRef } from 'react'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SourceEditor({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        markdown(),
        keymap.of([...defaultKeymap, indentWithTab]),
        placeholder('开始写作...'),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.lineWrapping,
      ],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  return <div ref={containerRef} className="min-h-[400px] border rounded-lg overflow-hidden" />
}
```

- [ ] **Step 2: Install CodeMirror dependencies**

```bash
pnpm --filter @blog-admin/client add @codemirror/view @codemirror/state @codemirror/lang-markdown @codemirror/commands @codemirror/theme-one-dark @codemirror/language-data
```

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/components/editor/SourceEditor.tsx
git commit -m "feat: add CodeMirror source editor"
```

---

### Task 16: TipTap WYSIWYG Editor

**Files:**
- Create: `blog-admin/packages/client/src/components/editor/WysiwygEditor.tsx`
- Create: `blog-admin/packages/client/src/components/editor/EditorToolbar.tsx`

- [ ] **Step 1: Create EditorToolbar component**

```tsx
import { useCurrentEditor } from '@tiptap/react'
import { Bold, Italic, Heading1, Heading2, Code, List, ListOrdered, Quote, Image } from 'lucide-react'

export default function EditorToolbar() {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const btn = (active: boolean) =>
    `p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
      active ? 'bg-gray-200 dark:bg-gray-700' : ''
    }`

  return (
    <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-800 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btn(editor.isActive('heading', { level: 1 }))}
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btn(editor.isActive('code'))}
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive('orderedList'))}
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive('blockquote'))}
      >
        <Quote size={16} />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create WysiwygEditor component**

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './EditorToolbar'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function WysiwygEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: '开始写作...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown())
    },
  })

  return (
    <div className="border rounded-lg overflow-hidden">
      <EditorToolbar />
      <EditorContent editor={editor} className="p-4 min-h-[400px] prose dark:prose-invert max-w-none" />
    </div>
  )
}
```

- [ ] **Step 3: Install TipTap dependencies**

```bash
pnpm --filter @blog-admin/client add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder
```

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/components/editor/WysiwygEditor.tsx packages/client/src/components/editor/EditorToolbar.tsx
git commit -m "feat: add TipTap WYSIWYG editor with toolbar"
```

---

### Task 17: Post Edit Page with Mode Switching

**Files:**
- Create: `blog-admin/packages/client/src/pages/PostEdit.tsx`
- Create: `blog-admin/packages/client/src/components/editor/ModeSwitch.tsx`

- [ ] **Step 1: Create ModeSwitch component**

```tsx
interface Props {
  mode: 'source' | 'wysiwyg'
  onChange: (mode: 'source' | 'wysiwyg') => void
}

export default function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onChange('source')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          mode === 'source'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        源码模式
      </button>
      <button
        onClick={() => onChange('wysiwyg')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          mode === 'wysiwyg'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        WYSIWYG
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create PostEdit page**

```tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { getPost, createPost, updatePost } from '@/api/client'
import FrontmatterForm from '@/components/editor/FrontmatterForm'
import SourceEditor from '@/components/editor/SourceEditor'
import WysiwygEditor from '@/components/editor/WysiwygEditor'
import ModeSwitch from '@/components/editor/ModeSwitch'
import type { PostFrontmatter } from '@blog-admin/shared'

const emptyFrontmatter: PostFrontmatter = {
  title: '',
  date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
  frontmatter: '',
  tags: [],
  draft: true,
}

export default function PostEdit() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEdit = !!slug

  const [title, setTitle] = useState('')
  const [frontmatter, setFrontmatter] = useState<PostFrontmatter>(emptyFrontmatter)
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<'source' | 'wysiwyg'>('source')
  const [saving, setSaving] = useState(false)

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
          .replace(/[^a-z0-9一-鿿]+/g, '-')
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
        <button onClick={() => navigate('/posts')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} />
          返回
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
    </div>
  )
}
```

- [ ] **Step 3: Test the full flow**

```bash
pnpm dev
```

Expected: Can create new post, edit existing post, switch between source and WYSIWYG modes

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/pages/PostEdit.tsx packages/client/src/components/editor/ModeSwitch.tsx
git commit -m "feat: add post edit page with dual-mode editor"
```

---

## Phase 4b: Image Management & Slash Commands

### Task 17b: Image Manager Component

**Files:**
- Create: `blog-admin/packages/client/src/components/editor/ImageManager.tsx`

- [ ] **Step 1: Create ImageManager component**

```tsx
import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, X } from 'lucide-react'
import { uploadImage, deleteImage } from '@/api/client'

interface Props {
  slug: string
  onInsert: (url: string, alt: string) => void
  onClose: () => void
}

interface ImageItem {
  filename: string
  url: string
}

export default function ImageManager({ slug, onInsert, onClose }: Props) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [slug])

  const fetchImages = async () => {
    const res = await fetch(`/api/images/${slug}`)
    if (res.ok) {
      setImages(await res.json())
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadImage(slug, file)
      }
      fetchImages()
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定删除图片 ${filename}？`)) return
    await deleteImage(slug, filename)
    fetchImages()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleUpload(e.dataTransfer.files)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">图片管理</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X size={20} />
          </button>
        </div>

        <div
          className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg m-4 text-center cursor-pointer hover:border-blue-400"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-500">
            {uploading ? '上传中...' : '拖拽图片到此处，或点击选择文件'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.filename} className="group relative">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => onInsert(img.url, img.filename)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    插入
                  </button>
                  <button
                    onClick={() => handleDelete(img.filename)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{img.filename}</p>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无图片</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Integrate into PostEdit page**

Add to `packages/client/src/pages/PostEdit.tsx`:

```tsx
import ImageManager from '@/components/editor/ImageManager'
import { Image } from 'lucide-react'

// Add state
const [showImages, setShowImages] = useState(false)

// Add button in the header area (after Save button)
<button
  onClick={() => setShowImages(true)}
  className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
>
  <Image size={16} />
  图片
</button>

// Add ImageManager modal
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
```

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/components/editor/ImageManager.tsx packages/client/src/pages/PostEdit.tsx
git commit -m "feat: add image manager with drag-and-drop upload"
```

---

### Task 17c: Slash Command for MDX Components

**Files:**
- Create: `blog-admin/packages/client/src/components/editor/SlashCommand.tsx`
- Modify: `blog-admin/packages/client/src/components/editor/WysiwygEditor.tsx`

- [ ] **Step 1: Create SlashCommand component**

```tsx
import { useState, useEffect, useRef } from 'react'

interface Props {
  items: { label: string; description: string; action: () => void }[]
  position: { top: number; left: number }
  onClose: () => void
}

export default function SlashCommand({ items, position, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filtered[selectedIndex]?.action()
        onClose()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filtered, selectedIndex, onClose])

  if (filtered.length === 0) return null

  return (
    <div
      ref={listRef}
      className="absolute z-50 bg-white dark:bg-gray-900 border rounded-lg shadow-lg w-64 max-h-48 overflow-auto"
      style={{ top: position.top, left: position.left }}
    >
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索组件..."
        className="w-full px-3 py-2 border-b bg-transparent text-sm outline-none"
      />
      {filtered.map((item, i) => (
        <button
          key={item.label}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
            i === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
          }`}
          onClick={() => {
            item.action()
            onClose()
          }}
        >
          <div className="font-medium">{item.label}</div>
          <div className="text-xs text-gray-500">{item.description}</div>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Integrate slash commands into WysiwygEditor**

Modify `packages/client/src/components/editor/WysiwygEditor.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './EditorToolbar'
import SlashCommand from './SlashCommand'

interface Props {
  value: string
  onChange: (value: string) => void
}

const mdxComponents = [
  {
    label: 'Callout',
    description: '提示框（info/warning/error）',
    action: (editor: any) => {
      editor.chain().focus().insertContent('<Callout type="info">\n  提示内容\n</Callout>\n').run()
    },
  },
  {
    label: 'Tabs',
    description: '标签页组件',
    action: (editor: any) => {
      editor.chain().focus().insertContent('<Tabs>\n  <TabItem label="标签1">\n    内容1\n  </TabItem>\n</Tabs>\n').run()
    },
  },
  {
    label: 'Quote',
    description: '引用块',
    action: (editor: any) => {
      editor.chain().focus().toggleBlockquote().run()
    },
  },
  {
    label: 'Code Block',
    description: '代码块',
    action: (editor: any) => {
      editor.chain().focus().toggleCodeBlock().run()
    },
  },
  {
    label: 'Image',
    description: '插入图片',
    action: (editor: any) => {
      const url = prompt('图片 URL:')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
  },
]

export default function WysiwygEditor({ value, onChange }: Props) {
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: '输入 / 插入组件...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown?.getMarkdown() || editor.getText())
    },
    onTransaction: ({ editor }) => {
      const { state } = editor
      const { $from } = state.selection
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)

      if (textBefore.endsWith('/')) {
        const coords = editor.view.coordsAtPos(state.selection.from)
        setSlashMenu({ top: coords.bottom + 4, left: coords.left })
      } else if (!textBefore.includes('/')) {
        setSlashMenu(null)
      }
    },
  })

  const getComponentActions = useCallback(() => {
    if (!editor) return []
    return mdxComponents.map((comp) => ({
      ...comp,
      action: () => comp.action(editor),
    }))
  }, [editor])

  return (
    <div className="border rounded-lg overflow-hidden relative">
      <EditorToolbar />
      <EditorContent editor={editor} className="p-4 min-h-[400px] prose dark:prose-invert max-w-none" />
      {slashMenu && (
        <SlashCommand
          items={getComponentActions()}
          position={slashMenu}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/components/editor/SlashCommand.tsx packages/client/src/components/editor/WysiwygEditor.tsx
git commit -m "feat: add slash command menu for MDX components"
```

---

## Phase 5: Polish & Integration

### Task 18: Blog Root Configuration

**Files:**
- Create: `blog-admin/blog-admin.config.json`
- Create: `blog-admin/README.md`

- [ ] **Step 1: Create config file**

```json
{
  "blogRoot": "/Users/eddie/projects/myblog",
  "postsDir": "src/posts",
  "port": 3001
}
```

- [ ] **Step 2: Create README**

```markdown
# Blog Admin

本地博客管理后台。

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm start
```

## 配置

编辑 `blog-admin.config.json`:

```json
{
  "blogRoot": "/path/to/your/blog",
  "postsDir": "src/posts",
  "port": 3001
}
```

或使用环境变量:

```bash
BLOG_ROOT=/path/to/blog pnpm dev
```
```

- [ ] **Step 3: Commit**

```bash
git add blog-admin.config.json README.md
git commit -m "docs: add configuration and README"
```

---

### Task 19: Final Integration Test

- [ ] **Step 1: Start full stack**

```bash
cd blog-admin
pnpm dev
```

- [ ] **Step 2: Test post list**

Open http://localhost:5173, verify posts from the blog are displayed

- [ ] **Step 3: Test create post**

Click "新建文章", fill in title and content, save, verify MDX file is created in the blog project

- [ ] **Step 4: Test edit post**

Click on an existing post, modify content, save, verify changes are written to the MDX file

- [ ] **Step 5: Test tag/category management**

Navigate to tags and categories pages, verify counts are correct

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: final integration verification"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-4 | Monorepo setup (shared, server, client) |
| 2 | 5-9 | Backend post/tag/category/image services and routes |
| 3 | 10-13 | Frontend layout, post list, tag/category pages |
| 4 | 14-17 | Editor (frontmatter form, CodeMirror, TipTap, mode switch) |
| 4b | 17b-17c | Image management UI and slash commands |
| 5 | 18-19 | Configuration and integration testing |

Total: 21 tasks, ~55 steps
