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

## Documentation Map

| Topic | File |
|-------|------|
| System design | [docs/architecture.md](docs/architecture.md) |
| Blog post format | [docs/content-guide.md](docs/content-guide.md) |
| Deployment | [docs/deployment.md](docs/deployment.md) |
