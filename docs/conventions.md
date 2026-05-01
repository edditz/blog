# Conventions

Project-specific coding conventions for this Astro blog.

## Astro Patterns

### Component Files
- Use `.astro` single-file components (frontmatter + template + style)
- Keep components under 200 lines; extract logic to utils if needed
- Props defined via `interface Props` in frontmatter

### Routing
- File-based routing in `src/pages/`
- Dynamic routes use `[param]` or `[...spread]` syntax
- Paginated routes: `src/pages/page/[page].astro`

### Content Collections
- Posts defined in `src/content.config.ts` using Zod schema
- Loader: `glob` pattern pointing to `src/posts/{year}/*.mdx`
- Always validate frontmatter against the schema

## Component Organization

```
src/components/
├── ui/           # Reusable MDX components (Callout, Tabs, Quote, etc.)
├── posts/        # Post-specific components (TOC, ShareButtons)
├── about/        # About page components (Timeline, ActivityCard)
└── *.astro       # Global components (Author, Footer, BackToTop)
```

### Naming
- PascalCase for component files: `BackToTop.astro`, `LinkCard.astro`
- Component name matches filename

## CSS / Theming

### Tailwind v4 CSS-First Config
- Configuration in `src/styles/global.css` via `@theme inline`
- No `tailwind.config.js` — Tailwind v4 uses CSS-first approach
- Custom variants: `@custom-variant dark (&:where(.dark, .dark *))`

### CSS Variables
- All theme colors defined as HSL CSS custom properties in `:root` and `.dark`
- Variable naming: `--background`, `--foreground`, `--primary`, `--muted`, etc.
- Use `hsl()` format for color values
- Sidebar variables prefixed `--sidebar-*`

### Dark Mode
- Toggled via `.dark` class on `<html>`
- Persisted in `localStorage` key `theme`
- Script runs before paint to prevent flash (in Layout.astro `<head>`)
- View Transition API used for circular clip-path animation on toggle

## TypeScript

- Strict mode enabled (`extends: "astro/tsconfigs/strict"`)
- Path alias: `@/` → `src/`
- Types in `src/types.ts` for shared interfaces
- No `as any` or `@ts-ignore`

## MDX Content

### Frontmatter
- `date` format: always `MM/DD/YYYY` string (e.g., `"01/15/2024"`)
- `frontmatter` field = short description (not the standard MDX frontmatter concept)
- `draft: true` excludes from build

### Imports in MDX
```tsx
import Callout from '@/components/ui/Callout.astro';
```
- Always use `@/` alias, not relative paths

## Icon Library

- Icons from `@lucide/astro`
- Import specific icons: `import { Moon, Sun } from "@lucide/astro"`
- Size prop: `size={16}`

## Build & Deploy

- Static site only (`astro build` → `dist/`)
- No server-side rendering
- Deployed to Aliyun OSS via GitHub Actions
