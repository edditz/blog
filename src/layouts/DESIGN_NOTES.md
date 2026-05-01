# Layout Design Notes

How the main layout works and why it's structured this way.

## Layout.astro — The Shell

Every page wraps in this layout. It provides:
- HTML head (meta, OG tags, RSS, analytics)
- Navbar with navigation, theme toggle, RSS link, search trigger
- `<slot />` for page content
- Footer and BackToTop components
- Search overlay (modal)

## Critical Systems

### Dark Mode (Flash Prevention)

The dark mode script runs in `<head>` with `is:inline` — this is intentional. It must execute before the body renders to prevent a flash of wrong theme (FOWT).

Flow:
1. Read `localStorage.theme` or detect `prefers-color-scheme`
2. Add/remove `.dark` class on `<html>` immediately
3. Listen for `astro:after-swap` to re-apply on page transitions

Theme toggle uses View Transitions API for a circular clip-path animation radiating from the click point.

### Event Lifecycle (View Transitions)

Astro's ClientRouter persists the layout across page navigations. Event listeners must be managed carefully:

- `astro:before-swap`: Clean up all event listeners (theme, search, scroll)
- `astro:page-load`: Re-attach all event listeners

Every listener is stored in a module-scoped variable (e.g., `onThemeToggleClick`) so it can be removed by reference. Without this, listeners leak on each navigation.

### Search System

Cmd+K client-side search, no external library:

1. `search.json.ts` endpoint generates a JSON index at build time
2. First open: fetches `/search.json` and caches in `searchData`
3. Filtering: case-insensitive match against title, frontmatter, and tags
4. UI: overlay with backdrop blur, modal with scale transition

The search overlay uses `inert` attribute and `aria-hidden` for accessibility when closed.

### Scroll-Aware Navbar

- Adds `nav-scrolled` class when scroll > 100px (visual change)
- Adds `nav-hidden` class when scrolling down past 200px (hides navbar)
- Shows navbar again when scrolling up

## Modifying Layout

- **Add nav item**: Edit `siteConfig.nav` in `src/config.ts`
- **Change search behavior**: Edit the `renderResults` function in the `<script>` block
- **Modify theme toggle animation**: Edit the `onThemeToggleClick` handler
- **Add global head tags**: Add to the `<head>` section
- **Change navbar styling**: Edit the `<nav>` element's classes
