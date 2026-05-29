# Content Guide

## Blog Post Format

Posts are MDX files in `src/posts/{year}/` (e.g., `src/posts/2024/`).

### Required Frontmatter

```yaml
---
title: "Post Title"
date: "01/15/2024"
frontmatter: "Brief description for previews and SEO"
tags: ["tag1", "tag2"]
---
```

### Optional Frontmatter

```yaml
---
updatedDate: "02/01/2024"    # Shows "updated on" if present
image: "../../assets/images/cover.webp"  # Hero image
draft: true                  # Excludes from build
---
```

### Example

```mdx
---
title: "Hello World"
date: "01/15/2024"
frontmatter: "This is my first blog post"
tags: ["astro", "blog"]
draft: false
updatedDate: ""
---

Welcome content here...

## Subheading

More content.
```

## File Naming

- Filename becomes the URL slug: `hello-world-en.mdx` → `/posts/hello-world-en`
- Use kebab-case: `my-new-post.mdx`
- Organize by year: `src/posts/2024/my-post.mdx`

## Scaffolding New Posts

```bash
npm run new-post "My Post Title"
```

This creates a new MDX file in `src/posts/` with today's date and slugified filename.

## Content Rules

1. **One post per file** — no multi-post files
2. **Date format** — always MM/DD/YYYY string (e.g., `"01/15/2024"`)
3. **Images** — place in `src/assets/images/`, import and use:
   ```mdx
   import myImage from '@/assets/images/my-image.jpg';
   <img src={myImage.src} alt="description" />
   ```
4. **MDX components** — import from `@/components/ui/` (Callout, Tabs, Quote, etc.)
5. **Draft posts** — set `draft: true` to exclude from build

## Available MDX Components

Import components from `@/components/ui/`:

```mdx
import Callout from '@/components/ui/Callout.astro';
import Tabs from '@/components/ui/Tabs.astro';
import TabItem from '@/components/ui/TabItem.astro';
import Quote from '@/components/ui/Quote.astro';
import ProsCons from '@/components/ui/ProsCons.astro';
import LinkCard from '@/components/ui/LinkCard.astro';
import YouTube from '@/components/ui/YouTube.astro';
import Steps from '@/components/ui/Steps.astro';
import Figure from '@/components/ui/Figure.astro';
import Grid from '@/components/ui/Grid.astro';
import Divider from '@/components/ui/Divider.astro';
import Separator from '@/components/ui/Separator.astro';
import Badge from '@/components/ui/Badge.astro';
```

## Grid Component

Display content in columns:

```mdx
import Grid from '@/components/ui/Grid.astro';

<!-- Two columns -->
<Grid cols={2} caption="对比图">
  <Figure src="./images/before.jpg" alt="Before" />
  <Figure src="./images/after.jpg" alt="After" />
</Grid>

<!-- Three columns -->
<Grid cols={3}>
  <div class="p-4 border rounded-lg">Card 1</div>
  <div class="p-4 border rounded-lg">Card 2</div>
  <div class="p-4 border rounded-lg">Card 3</div>
</Grid>

<!-- Custom gap -->
<Grid cols={2} gap="lg">
  <img src="./images/a.jpg" alt="A" class="rounded-lg" />
  <img src="./images/b.jpg" alt="B" class="rounded-lg" />
</Grid>
```

Props:
- `cols` — `2` (default) | `3` | `4`
- `gap` — `"sm"` | `"md"` (default) | `"lg"`
- `caption` — optional caption text
- Responsive: single column on mobile, specified columns on desktop
