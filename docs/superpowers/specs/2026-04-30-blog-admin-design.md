# Blog Admin Dashboard Design

## Overview

A lightweight, purely local blog management dashboard for the Astro blog. Provides a better editing experience than VS Code for writing MDX posts, with WYSIWYG and source code editing modes, image management, and blog management features.

## Goals

- Provide a better editor experience for writing MDX posts
- Manage blog posts efficiently (especially when there are many)
- Support both WYSIWYG and source code editing modes
- Handle image uploads and management
- All operations map to local filesystem (no remote backend)
- Generate MDX files following existing blog format

## Architecture

### Monorepo Structure

```
blog-admin/
├── packages/
│   ├── client/          # React SPA (HeroUI + TipTap + CodeMirror)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── editor/       # Editor components
│   │   │   │   ├── posts/        # Post list, filters
│   │   │   │   ├── tags/         # Tag management
│   │   │   │   ├── categories/   # Category management
│   │   │   │   └── ui/           # HeroUI base components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── stores/           # Zustand stores
│   │   │   ├── pages/            # Page components
│   │   │   └── types/            # Types from shared
│   │   └── package.json
│   │
│   ├── server/          # Node.js backend (Express)
│   │   ├── src/
│   │   │   ├── routes/           # API routes
│   │   │   ├── services/         # File operation logic
│   │   │   └── types/            # Types from shared
│   │   └── package.json
│   │
│   └── shared/          # Shared type definitions
│       ├── src/
│       │   └── types.ts
│       └── package.json
│
├── package.json         # Root package.json (workspaces)
└── pnpm-workspace.yaml
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 + TypeScript |
| UI Library | HeroUI (based on Tailwind CSS) |
| Routing | React Router v6 |
| State Management | Zustand |
| HTTP Client | Axios |
| Rich Text Editor | TipTap (WYSIWYG) |
| Code Editor | CodeMirror 6 (source mode) |
| Backend Framework | Express |
| MDX Parsing | gray-matter + @mdx-js/mdx |
| Build Tools | Vite (frontend) + tsx (backend) |
| Package Manager | pnpm workspaces |

## Backend API

### Endpoints

```
GET    /api/posts              # List posts (with filters, pagination)
GET    /api/posts/:slug        # Get single post (with content)
POST   /api/posts              # Create new post
PUT    /api/posts/:slug        # Update post
DELETE /api/posts/:slug        # Delete post
POST   /api/posts/batch        # Batch operations: { action: "delete"|"publish"|"unpublish"|"tag", slugs: string[], tags?: string[] }

POST   /api/images/:slug       # Upload image to post's images/ directory
GET    /api/images/:slug/:file # Get image
DELETE /api/images/:slug/:file # Delete image

GET    /api/tags               # List all tags with post counts
POST   /api/tags               # Create tag
PUT    /api/tags/:name         # Rename tag
DELETE /api/tags/:name         # Delete tag

GET    /api/categories         # List all categories with post counts
POST   /api/categories         # Create category
PUT    /api/categories/:name   # Rename category
DELETE /api/categories/:name   # Delete category
```

### Data Flow

1. Frontend sends request → Backend parses → Read/write `src/posts/` directory
2. Post content directly reads/writes MDX files
3. Images stored in each post's `images/` directory
4. Backend responsible for parsing frontmatter and MDX content

### Key Implementation

- Use `gray-matter` for frontmatter parsing
- Use `fs` module for file operations
- Support configuring blog project root directory (default: current directory)

## Frontend Design

### Layout

Traditional admin dashboard layout:

```
┌─────────────────────────────────────────────────────┐
│  Logo    Blog Admin                          User    │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  📝 Posts │  Content Area                            │
│          │                                          │
│  🏷️ Tags  │  (Switches based on left navigation)    │
│          │                                          │
│  📂 Cats  │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Pages

| Page | Features |
|------|----------|
| Post List | Filter, search, batch operations, new/edit/delete |
| Post Edit | Frontmatter form + dual-mode editor + image management |
| Tag Management | CRUD tags, view post count per tag |
| Category Management | CRUD categories, view post count per category |

### Post List Page

```
┌─────────────────────────────────────────────────────┐
│  [+ New Post]  [Filter: All/Draft/Published]        │
│  [Search: title, content, tags...]                  │
├─────────────────────────────────────────────────────┤
│  ☐  Title          Tags      Date    Status         │
│  ☐  Hello World   astro    01/15   Published        │
│  ☐  My Post       react    04/30   Draft            │
│                                                     │
│  [Batch Delete] [Batch Publish] [Batch Tag]         │
└─────────────────────────────────────────────────────┘
```

### Post Edit Page

```
┌─────────────────────────────────────────────────────┐
│  [← Back]  Title: [input]   [Save] [Publish]        │
├─────────────────────────────────────────────────────┤
│  Frontmatter:                                       │
│  [Date] [Tags] [Category] [Summary] [Cover] [Draft] │
├─────────────────────────────────────────────────────┤
│  [Source Mode] [WYSIWYG Mode]                       │
│  ┌───────────────────────────────────────┐          │
│  │  Editing Area                         │          │
│  │  (CodeMirror or TipTap)               │          │
│  └───────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

## Editor Design

### Dual Mode System

**Source Mode (CodeMirror 6)**
- Syntax highlighting (Markdown + MDX)
- Code folding, auto-completion
- Keyboard shortcuts (Ctrl+B bold, Ctrl+I italic, etc.)
- Direct MDX file editing

**WYSIWYG Mode (TipTap)**
- Rich text editor based on ProseMirror
- Custom extensions for MDX components (Callout, Tabs, etc.)
- Toolbar provides buttons for MDX component insertion
- Real-time preview, what you see is what you get

### Mode Switching

```
┌─────────────────────────────────────────────┐
│  [Source Mode] [WYSIWYG Mode]               │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │  Editing Area                         │  │
│  │  (CodeMirror or TipTap)               │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### MDX Component Insertion

**Slash Commands (like Notion)**

Type `/` in editor to trigger component picker:
```
/callout  →  Callout (info/warning/error)
/tabs     →  Tabs component
/quote    →  Quote component
/code     →  Code block
/image    →  Image with caption
...
```

Supports search filtering, works even with many components.

**Toolbar Dropdown**

```
┌─────────────────────────────────────────────┐
│  [B] [I] [H1] [H2] [Code] | [Components ▼] │
│                                    ├─ Callout│
│                                    ├─ Layout │
│                                    ├─ Media  │
│                                    └─ Other  │
└─────────────────────────────────────────────┘
```

**Implementation:**
- Slash command + dropdown menu combination
- Toolbar keeps common operations (bold, heading, code)
- Slash command `/` inserts MDX components (with search)
- Components many, still easy to find

### TipTap Custom Extensions

- `MdxCallout` - Callout component node
- `MdxTabs` - Tabs component node
- `MdxQuote` - Quote component node
- `MdxCodeBlock` - Enhanced code block
- `MdxImage` - Image with caption
- `SlashCommand` - Slash command input rule

## Schema Changes

### Current Schema

```typescript
{
  title: string
  date: string            // MM/DD/YYYY
  frontmatter: string     // Short description
  tags: string[]
  image?: Image
  draft?: boolean
  updatedDate?: string
}
```

### New Schema

```typescript
{
  title: string
  date: string            // MM/DD/YYYY
  frontmatter: string     // Short description
  tags: string[]
  category?: string       // NEW: optional single category
  image?: Image
  draft?: boolean
  updatedDate?: string
}
```

**Note:** Category is optional. Each post can belong to one category or none.

## Image Management

### Upload Flow

1. User clicks "Insert Image" button in editor
2. Image management dialog opens
3. Support drag-and-drop upload, paste upload
4. Images automatically saved to current post's `images/` directory
5. Image list shows all images for the post
6. Can delete, replace images

### Image Storage

```
src/posts/
├── hello-world/
│   ├── index.mdx
│   └── images/
│       ├── cover.webp
│       └── screenshot.png
```

### Image API

- Upload: `POST /api/images/:slug` with multipart form data
  - Response: `{ filename: string, path: string, url: string }`
- Get: `GET /api/images/:slug/:file`
- Delete: `DELETE /api/images/:slug/:file`

## Configuration

### Blog Project Root

Backend needs to know where the blog project is. Options:

1. **Environment variable**: `BLOG_ROOT=/path/to/myblog`
2. **Config file**: `blog-admin.config.json`
3. **Command line argument**: `--root /path/to/myblog`

Recommendation: Environment variable with config file fallback.

### Example Config

```json
{
  "blogRoot": "/Users/eddie/projects/myblog",
  "postsDir": "src/posts",
  "port": 3001
}
```

## Development Workflow

### Starting the App

```bash
# Development
pnpm dev          # Starts both frontend and backend

# Production
pnpm build        # Builds frontend
pnpm start        # Starts backend serving built frontend
```

### Development Mode

- Frontend: Vite dev server on port 5173
- Backend: Express on port 3001
- Vite proxies API requests to backend

### Production Mode

- Backend serves built frontend static files
- Single port (default 3001)

## Future Considerations

- **MDX Component Registry**: Auto-discover available MDX components from blog project
- **Live Preview**: Preview rendered blog post in iframe
- **Git Integration**: Commit changes from admin panel
- **Export/Import**: Export posts as ZIP, import from other formats
- **Multi-language Support**: i18n for admin UI
