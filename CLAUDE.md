# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Astro 6, Tailwind CSS v4, and the Serene Ink theme.
Deployed to Aliyun OSS via GitHub Actions.

→ [AGENTS.md](AGENTS.md) for full project map

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build static site
npm run preview      # Preview production build
npm run new-post     # Scaffold a new blog post
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

## Path Aliases

`@/` maps to `src/` (configured in tsconfig.json)
