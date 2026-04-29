# My Blog

Bilingual (zh/en) personal blog built with Astro 5, Tailwind CSS, and Pagefind.

## Quick Start

```bash
npm install
npm run dev        # Dev server
npm run build      # Build + Pagefind index
npm run check      # Type check
```

## Architecture

Astro static site with i18n routing (`/{lang}/...`). Content in Markdown via Astro collections. Dark mode via CSS variables + `data-theme` attribute.

→ [docs/architecture.md](docs/architecture.md)

## Directory Structure

```
src/
├── components/     # Astro components (Header, Footer, PostCard, Search, etc.)
├── content/blog/   # Blog posts: {zh,en}/ directories
├── i18n/           # Translations (ui.ts) and utilities (utils.ts)
├── layouts/        # BaseLayout.astro
├── pages/          # Routes: [lang]/ param for all pages
└── styles/         # global.css with CSS variables for theming
```

## Key Conventions

1. **Language in URL**: All routes are `/{lang}/...` — extract lang with `getLangFromUrl()`
2. **Translations**: Add keys to `src/i18n/ui.ts` for both `zh` and `en`
3. **Blog posts**: Place in `src/content/blog/{lang}/`, must include `lang` in frontmatter
4. **Theming**: Use CSS variables from `global.css`, not hardcoded colors
5. **Path alias**: `@/` → `src/`

## Documentation Map

| Topic | File |
|-------|------|
| System design | [docs/architecture.md](docs/architecture.md) |
| Blog post format | [docs/content-guide.md](docs/content-guide.md) |
| Deployment | [docs/deployment.md](docs/deployment.md) |

## Common Tasks

| Task | Files/Commands |
|------|----------------|
| Add blog post | `src/content/blog/{lang}/*.md` → see [content-guide.md](docs/content-guide.md) |
| Add translation | `src/i18n/ui.ts` |
| Change theme | `src/styles/global.css` + `tailwind.config.js` |
| Modify layout | `src/layouts/BaseLayout.astro` |
| Type check | `npm run check` |
