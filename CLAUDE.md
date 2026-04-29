# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bilingual (Chinese/English) personal blog built with Astro 5.x, Tailwind CSS 3.x, and Pagefind for search. Deployed to Aliyun OSS via GitHub Actions.

→ [AGENTS.md](AGENTS.md) for full project map

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build + generate Pagefind index
npm run preview      # Preview production build
npm run check        # Astro type checking
```

## Key Files

- `src/i18n/ui.ts` - all UI translations (add new translation keys here)
- `src/i18n/utils.ts` - language detection and translation helpers
- `src/content/config.ts` - blog schema definition
- `src/styles/global.css` - CSS variables for theming
- `tailwind.config.js` - custom colors/fonts using CSS variables

## Documentation

| Topic | File |
|-------|------|
| System design | [docs/architecture.md](docs/architecture.md) |
| Blog post format | [docs/content-guide.md](docs/content-guide.md) |
| Deployment | [docs/deployment.md](docs/deployment.md) |

## Path Aliases

`@/` maps to `src/` (configured in tsconfig.json)
