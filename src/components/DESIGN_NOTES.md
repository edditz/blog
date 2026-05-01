# Component Design Notes

Why components are organized this way and the patterns they follow.

## Directory Structure

```
components/
├── ui/           # Reusable content components for MDX posts
├── posts/        # Post-reading experience (TOC, sharing)
├── about/        # About page specific components
└── *.astro       # Site-wide components (header, footer, etc.)
```

### Why this split?
- **ui/**: Components blog authors import in MDX files. Kept generic and reusable.
- **posts/**: Only used on the post detail page (`[...slug].astro`). Separate because they depend on post-specific data (headings, URL).
- **about/**: Only used on the about page. Separate to avoid bloating the global namespace.
- **Root level**: Used by Layout.astro or multiple pages. Site-wide concerns.

## Key Patterns

### UI Components (ui/)
- Accept props via `Astro.props`, no `interface Props` needed for simple cases
- Use `<slot />` for content projection
- Dark mode via Tailwind `dark:` variant with explicit color classes
- Icons from `@lucide/astro`
- Example: Callout.astro uses a type map to select icon + colors

### Post List (Writing.astro)
- Fetches all posts via `getCollection("post")`
- Filters drafts, sorts by date descending
- Groups by year → month for display
- Pagination computed from `siteConfig.postsPerPage`
- Reading time calculated via `utils/reading-time.ts`

### Post Detail (posts/)
- DesktopTOC: Fixed sidebar table of contents, generated from headings
- MobileTOC: Collapsible inline TOC for small screens
- ShareButtons: Social share links (Twitter, LinkedIn, copy link)

## Adding a New Component

1. Decide location: `ui/` for MDX-usable, `posts/` for post page, root for site-wide
2. Create `.astro` file with PascalCase name
3. Use `Astro.props` for configuration, `<slot />` for content
4. Follow existing dark mode pattern: explicit `dark:` Tailwind classes
5. If for MDX: add import example to `docs/content-guide.md`
