# Column System Design

## Overview

A "column" (专栏) system for grouping related blog posts into themed collections. Unlike tags (single-post labels), columns are curated collections with their own metadata (cover image, description) and a dedicated detail page.

## Requirements

- Columns are themed collections, no strict reading order
- One post can belong to multiple columns
- Rich column detail page (cover, description, post count, post list)
- Column badge displayed on homepage post cards, linking to column detail page
- Dedicated `/columns` page listing all columns
- "Columns" entry added to navbar

## Data Model

### Column Definition

Each column is a `.ts` file in `src/columns/`:

```ts
// src/columns/ai-tools.ts
import { defineColumn } from "./utils";

export default defineColumn({
  id: "ai-tools",
  title: "AI 工具",
  description: "探索 AI 工具的使用与技巧",
  cover: "/images/columns/ai-tools.webp", // optional
});
```

### Post Frontmatter

Add `columns` field to content schema in `src/content.config.ts`:

```ts
columns: z.array(z.string()).optional().default([])
```

Post usage:

```yaml
---
title: "手腕上的Claude Code"
columns: ["ai-tools", "productivity"]
tags: ["AI", "Claude Code"]
---
```

### Association Logic

Build-time: match post `columns` field values against column `id` to group posts.

## Pages & Routes

| Route | File | Purpose |
|-------|------|---------|
| `/columns` | `src/pages/columns/index.astro` | Column list page |
| `/columns/[slug]` | `src/pages/columns/[slug].astro` | Column detail page |

### Column List Page (`/columns`)

- Grid layout of column cards
- Each card: cover image, title, description, post count
- Click card -> navigate to detail page

### Column Detail Page (`/columns/[slug]`)

- Header: cover image + title + description + post count
- Body: list of posts in this column (reuse Writing component list style)

### Homepage Changes

- Add column badge(s) to each post card (similar to existing tag badges)
- Badge links to `/columns/[slug]`

### Navbar Changes

- Add `{ label: "Columns", href: "/columns" }` to `src/config.ts` nav array

## File Structure

```
src/
├── columns/                     # Column definitions
│   ├── utils.ts                 # defineColumn helper + getColumns utility
│   └── ai-tools.ts              # Example column
├── pages/
│   └── columns/
│       ├── index.astro          # Column list page
│       └── [slug].astro         # Column detail page
├── components/
│   └── Writing.astro            # Modified: add column badges to post cards
├── content.config.ts            # Modified: add columns field to schema
└── config.ts                    # Modified: add Columns nav link
```

## Utility Functions (`src/columns/utils.ts`)

- `defineColumn(config)` — type-safe column definition helper
- `getColumns()` — loads all column definitions
- `getColumnWithPosts(slug)` — loads a column + its associated posts (sorted by date desc)
- `getAllColumnsWithPosts()` — loads all columns + their posts (for list page)

## Implementation Notes

- Columns are build-time only, no runtime database
- Column cover images stored in `public/images/columns/`
- Reuse existing `Badge` component for column badges on post cards
- Reuse `Writing.astro` list item style for column detail page post list
- Follow existing code patterns: Astro static generation, glob loaders, Tailwind styling
