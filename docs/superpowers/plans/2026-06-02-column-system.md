# Column System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a column (专栏) system that groups blog posts into themed collections with dedicated list and detail pages.

**Architecture:** Column definitions live in `src/columns/` as individual TS files. Posts reference columns via a `columns` frontmatter field. Build-time utilities load definitions and associate posts. Two new pages (`/columns` and `/columns/[slug]`) render column data. Homepage post cards get column badges.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS v4 (existing stack)

---

### Task 1: Column type definition and utility functions

**Files:**
- Create: `src/columns/utils.ts`
- Create: `src/columns/types.ts`

- [ ] **Step 1: Create column type definition**

Create `src/columns/types.ts`:

```ts
export interface Column {
  id: string;
  title: string;
  description: string;
  cover?: string;
}

export interface ColumnWithPosts extends Column {
  posts: {
    id: string;
    slug: string;
    title: string;
    date: string;
    frontmatter: string;
    readTime: number;
    tags: string[];
  }[];
}
```

- [ ] **Step 2: Create utility functions**

Create `src/columns/utils.ts`:

```ts
import type { Column, ColumnWithPosts } from "./types";
import { getCollection } from "astro:content";
import { calcReadTime } from "@/utils/reading-time";

// Import all column definitions
const columnModules = import.meta.glob<Column>("./*.ts", { eager: true });

const columns: Column[] = Object.values(columnModules);

export function defineColumn(config: Column): Column {
  return config;
}

export function getColumns(): Column[] {
  return columns.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAllColumnsWithPosts(): Promise<ColumnWithPosts[]> {
  const entries = await getCollection("post");
  const allPosts = entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      id: entry.id,
      slug: entry.id,
      title: entry.data.title,
      date: entry.data.date,
      frontmatter: entry.data.frontmatter,
      readTime: calcReadTime(entry.body!),
      tags: entry.data.tags,
      columns: entry.data.columns,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return getColumns().map((column) => ({
    ...column,
    posts: allPosts.filter((post) => post.columns.includes(column.id)),
  }));
}

export async function getColumnWithPosts(slug: string): Promise<ColumnWithPosts | undefined> {
  const all = await getAllColumnsWithPosts();
  return all.find((col) => col.id === slug);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx astro check`
Expected: No errors related to new files (may see existing unrelated warnings)

- [ ] **Step 4: Commit**

```bash
git add src/columns/types.ts src/columns/utils.ts
git commit -m "feat: add column type definitions and utility functions"
```

---

### Task 2: Add columns field to content schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add columns field to post schema**

In `src/content.config.ts`, add the `columns` field to the schema object after `tags`:

```ts
schema: ({ image }) => z.object({
    title: z.string(),
    date: z.string(),
    frontmatter: z.string(),
    tags: z.array(z.string()),
    columns: z.array(z.string()).optional().default([]),
    image: image().optional(),
    draft: z.boolean().optional().default(false),
    updatedDate: z.string().optional(),
}),
```

- [ ] **Step 2: Add columns to existing post frontmatter**

In `src/posts/watch-claude-island/index.mdx`, add an empty columns array (no column to assign yet, but validates the schema):

```yaml
columns: []
```

Add after the `tags` line in frontmatter.

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/posts/watch-claude-island/index.mdx
git commit -m "feat: add columns field to post content schema"
```

---

### Task 3: Create first sample column definition

**Files:**
- Create: `src/columns/ai-tools.ts`

- [ ] **Step 1: Create column definition file**

Create `src/columns/ai-tools.ts`:

```ts
import { defineColumn } from "./utils";

export default defineColumn({
  id: "ai-tools",
  title: "AI 工具",
  description: "探索 AI 工具的使用与技巧",
});
```

- [ ] **Step 2: Assign this column to the existing post**

In `src/posts/watch-claude-island/index.mdx`, update frontmatter:

```yaml
columns: ["ai-tools"]
```

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 4: Commit**

```bash
git add src/columns/ai-tools.ts src/posts/watch-claude-island/index.mdx
git commit -m "feat: add ai-tools sample column and assign to post"
```

---

### Task 4: Column list page

**Files:**
- Create: `src/pages/columns/index.astro`

- [ ] **Step 1: Create column list page**

Create `src/pages/columns/index.astro`:

```astro
---
import Layout from "@/layouts/Layout.astro";
import { siteConfig } from "@/config";
import { getAllColumnsWithPosts } from "@/columns/utils";

const columnsWithPosts = await getAllColumnsWithPosts();
const nonEmptyColumns = columnsWithPosts.filter((col) => col.posts.length > 0);
---

<Layout title={`Columns | ${siteConfig.title}`}>
    <main class="page">
        <div class="mb-10">
            <a
                href="/"
                class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
                <span>←</span> Back to writing
            </a>
        </div>

        <span class="uppercase text-primary font-medium tracking-widest"
            >browse</span
        >

        <h1 class="text-4xl mt-10">Columns</h1>
        <p class="text-lg max-w-122 text-muted-foreground">
            Curated collections of posts on related topics.
        </p>

        <section class="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
            {
                nonEmptyColumns.map((col) => (
                    <a
                        href={`/columns/${col.id}`}
                        class="group flex flex-col gap-3 p-6 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-300"
                    >
                        {col.cover && (
                            <img
                                src={col.cover}
                                alt={col.title}
                                class="w-full h-40 object-cover rounded-lg"
                            />
                        )}
                        <h2 class="text-xl font-medium group-hover:text-primary transition-colors">
                            {col.title}
                        </h2>
                        <p class="text-sm text-muted-foreground">
                            {col.description}
                        </p>
                        <span class="text-xs text-muted-foreground">
                            {col.posts.length}
                            {col.posts.length === 1 ? " post" : " posts"}
                        </span>
                    </a>
                ))
            }
        </section>
    </main>
</Layout>
```

- [ ] **Step 2: Verify build and preview**

Run: `npm run build`
Expected: Build succeeds, `/columns` route is generated

- [ ] **Step 3: Commit**

```bash
git add src/pages/columns/index.astro
git commit -m "feat: add column list page at /columns"
```

---

### Task 5: Column detail page

**Files:**
- Create: `src/pages/columns/[slug].astro`

- [ ] **Step 1: Create column detail page**

Create `src/pages/columns/[slug].astro`:

```astro
---
import { getCollection } from "astro:content";
import Layout from "@/layouts/Layout.astro";
import Badge from "@/components/ui/Badge.astro";
import { siteConfig } from "@/config";
import { getAllColumnsWithPosts } from "@/columns/utils";

export async function getStaticPaths() {
    const columnsWithPosts = await getAllColumnsWithPosts();
    return columnsWithPosts
        .filter((col) => col.posts.length > 0)
        .map((col) => ({
            params: { slug: col.id },
            props: { column: col },
        }));
}

const { column } = Astro.props;
---

<Layout title={`${column.title} | ${siteConfig.title}`}>
    <main class="page">
        <div class="mb-10">
            <a
                href="/columns"
                class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
                <span>←</span> All columns
            </a>
        </div>

        <span class="uppercase text-primary font-medium tracking-widest"
            >column</span
        >

        <h1 class="text-4xl mt-10">{column.title}</h1>
        <p class="text-lg max-w-122 text-muted-foreground">
            {column.description}
        </p>
        <p class="text-sm text-muted-foreground mt-2">
            {column.posts.length}
            {column.posts.length === 1 ? " post" : " posts"} in this collection
        </p>

        <section class="mt-20 flex flex-col gap-3">
            {
                column.posts.map((post) => (
                    <section class="flex flex-col gap-2 group hover:bg-muted px-3 py-8 rounded-md transition-all duration-300">
                        <div class="flex flex-col md:flex-row gap-2 md:justify-between md:items-start">
                            <a href={`/posts/${post.slug}`}>
                                <h2 class="text-2xl group-hover:text-primary leading-tight">
                                    {post.title}
                                </h2>
                            </a>
                            <span class="text-muted-foreground text-xs shrink-0 whitespace-nowrap md:mt-1 md:text-right text-left mt-1">
                                {post.readTime} min read
                            </span>
                        </div>
                        <p class="text-muted-foreground">{post.frontmatter}</p>
                        <section class="flex gap-2 flex-wrap">
                            {post.tags.map((tag) => (
                                <Badge content={tag} href={`/tags/${tag}`} />
                            ))}
                        </section>
                    </section>
                ))
            }
        </section>
    </main>
</Layout>
```

- [ ] **Step 2: Verify build and preview**

Run: `npm run build`
Expected: Build succeeds, `/columns/ai-tools` route is generated

- [ ] **Step 3: Commit**

```bash
git add src/pages/columns/[slug].astro
git commit -m "feat: add column detail page at /columns/[slug]"
```

---

### Task 6: Add column badges to homepage post cards

**Files:**
- Modify: `src/components/Writing.astro`

- [ ] **Step 1: Import column data in Writing.astro**

At the top of the `---` script section in `src/components/Writing.astro`, add the import after existing imports:

```ts
import { getColumns } from "@/columns/utils";
```

Then after the `grouped` variable definition (around line 52), add:

```ts
const columnLookup = Object.fromEntries(
    getColumns().map((col) => [col.id, col]),
);
```

- [ ] **Step 2: Add column badges to post card**

Find the badges section (around line 100-106). Replace:

```astro
<section class="flex gap-2 flex-wrap">
    {post.tags.map((tag) => (
        <Badge
            content={tag}
            href={`/tags/${tag}`}
        />
    ))}
</section>
```

With:

```astro
<section class="flex gap-2 flex-wrap">
    {post.columns?.map((colId: string) => {
        const col = columnLookup[colId];
        return col ? (
            <Badge
                content={col.title}
                href={`/columns/${col.id}`}
            />
        ) : null;
    })}
    {post.tags.map((tag) => (
        <Badge
            content={tag}
            href={`/tags/${tag}`}
        />
    ))}
</section>
```

- [ ] **Step 3: Map columns into allPosts data**

In the `allPosts` mapping (around line 16-21), ensure `columns` is included. The spread `...entry.data` already covers it, but verify the mapped type includes it. Add `columns` to the mapped object explicitly if needed:

```ts
const allPosts = entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
        id: entry.id,
        slug: entry.id,
        readTime: calcReadTime(entry.body!),
        columns: entry.data.columns,
        ...entry.data,
    }))
```

- [ ] **Step 4: Verify build and preview**

Run: `npm run build`
Expected: Homepage post cards now show column badges before tag badges

- [ ] **Step 5: Commit**

```bash
git add src/components/Writing.astro
git commit -m "feat: add column badges to homepage post cards"
```

---

### Task 7: Add Columns to navbar

**Files:**
- Modify: `src/config.ts`

- [ ] **Step 1: Add Columns nav link**

In `src/config.ts`, update the `nav` array to include a Columns link:

```ts
nav: [
    { label: "Writing", href: "/" },
    { label: "Columns", href: "/columns" },
    { label: "Tags", href: "/tags" },
    { label: "About", href: "/about" },
],
```

- [ ] **Step 2: Verify build and preview**

Run: `npm run build`
Expected: Navbar shows "Columns" link between Writing and Tags

- [ ] **Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: add Columns link to navbar"
```
