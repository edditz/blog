# My Blog

Personal blog built with Astro 6, Tailwind CSS v4, and the Serene Ink theme.

## Quick Start

```bash
npm install
npm run dev        # Dev server
npm run build      # Build static site
npm run new-post   # Scaffold new post
```

## Architecture

Astro 6 static site with Content Layer API. Posts in `src/posts/{year}/*.mdx`.
Cmd+K client-side search. Dark mode via `.dark` class on `<html>`.
View transitions via ClientRouter.

### Blog Admin (`blog-admin/`)

独立的博客管理后台，pnpm monorepo 结构：
- `packages/shared` — 共享类型
- `packages/server` — Express API (port 3001)
- `packages/client` — React SPA (Vite port 5173)

直接读写 `src/posts/` 目录，无独立数据库。
启动：`./dev.sh` 或 `cd blog-admin && pnpm dev`

→ [docs/architecture.md](docs/architecture.md)

## Directory Structure

```
src/
├── assets/images/     # Image assets for components
├── components/        # Astro components (Author, Writing, UI components, etc.)
├── content.config.ts  # Content collection schema (glob loader)
├── layouts/           # Layout.astro (main layout with navbar, search, etc.)
├── pages/             # Routes (index, about, posts/[...slug], tags, etc.)
├── posts/             # Blog posts: {year}/*.mdx
├── scripts/           # cursor.ts (custom cursor effect)
├── styles/            # global.css (Tailwind v4 CSS-first config)
├── types.ts           # TypeScript interfaces
└── utils/             # date.ts, reading-time.ts
```

## Key Conventions

1. **Posts**: Place in `src/posts/{year}/`, use MM/DD/YYYY date format
2. **Frontmatter**: `title`, `date`, `frontmatter` (description), `tags`, `draft`, `updatedDate`
3. **Theming**: CSS variables in global.css, dark mode via `.dark` class
4. **Search**: Cmd+K search powered by search.json.ts endpoint
5. **Path alias**: `@/` → `src/`

## Common Tasks

| Task | Files / Commands |
|------|-----------------|
| Add a new blog post | `npm run new-post "Title"` → edit `src/posts/{year}/*.mdx` |
| Change site title/nav/socials | `src/config.ts` |
| Modify page layout/navbar/footer | `src/layouts/Layout.astro`, `src/components/Footer.astro` |
| Add/modify MDX components | `src/components/ui/` (Callout, Tabs, Quote, etc.) |
| Change theme colors | `src/styles/global.css` (`:root` and `.dark` variables) |
| Modify post schema | `src/content.config.ts` |
| Add a new page | `src/pages/` (Astro file-based routing) |
| Change posts-per-page | `src/config.ts` → `postsPerPage` |
| Modify search behavior | `src/pages/search.json.ts` (index), `src/layouts/Layout.astro` (UI) |
| Add about page content | `src/pages/about.astro`, `src/components/about/` |
| Start blog + admin | `./dev.sh` or `cd blog-admin && pnpm dev` |
| Add admin API endpoint | `blog-admin/packages/server/src/routes/` + `services/` |
| Modify admin UI | `blog-admin/packages/client/src/pages/` |
| Change admin shared types | `blog-admin/packages/shared/src/types.ts` |

## Documentation Map

| Topic | File |
|-------|------|
| System design | [docs/architecture.md](docs/architecture.md) |
| Blog post format | [docs/content-guide.md](docs/content-guide.md) |
| Deployment | [docs/deployment.md](docs/deployment.md) |
| Coding conventions | [docs/conventions.md](docs/conventions.md) |
| Component architecture | [src/components/DESIGN_NOTES.md](src/components/DESIGN_NOTES.md) |
| Layout architecture | [src/layouts/DESIGN_NOTES.md](src/layouts/DESIGN_NOTES.md) |
| Blog admin system | [docs/blog-admin.md](docs/blog-admin.md) |
| Admin design notes | [blog-admin/DESIGN_NOTES.md](blog-admin/DESIGN_NOTES.md) |
