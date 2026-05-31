# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Astro 6, Tailwind CSS v4, and the Serene Ink theme.
Deployed to Aliyun ECS via `scripts/deploy.sh` (rsync).

→ [AGENTS.md](AGENTS.md) for full project map

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build static site
npm run preview      # Preview production build
npm run new-post     # Scaffold a new blog post
bash scripts/deploy.sh  # Build and deploy to production

# Blog Admin (独立项目)
cd blog-admin && pnpm dev   # Start admin backend + frontend
./test.sh                    # Run admin API tests
```

## Key Files

- `src/config.ts` - Site configuration (title, author, nav, socials)
- `src/content.config.ts` - Content collection schema
- `src/styles/global.css` - Tailwind v4 CSS-first config + theme variables
- `src/layouts/Layout.astro` - Main layout (navbar, search, dark mode)
- `src/utils/date.ts` - Date parsing (MM/DD/YYYY format)

## Documentation

| Topic | File |
|-------|------|
| System design | [docs/architecture.md](docs/architecture.md) |
| Blog post format | [docs/content-guide.md](docs/content-guide.md) |
| Deployment | [docs/deployment.md](docs/deployment.md) |
| Coding conventions | [docs/conventions.md](docs/conventions.md) |
| Component architecture | [src/components/DESIGN_NOTES.md](src/components/DESIGN_NOTES.md) |
| Layout architecture | [src/layouts/DESIGN_NOTES.md](src/layouts/DESIGN_NOTES.md) |
| Blog admin system | [docs/blog-admin.md](docs/blog-admin.md) |
| Admin API testing | [docs/blog-admin.md#testing](docs/blog-admin.md#testing) |
| MDX 组件接入编辑器 | [docs/mdx-component-guide.md](docs/mdx-component-guide.md) |

## Path Aliases

`@/` maps to `src/` (configured in tsconfig.json)
