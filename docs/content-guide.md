# Content Guide

## Blog Post Format

Posts are Markdown files in `src/content/blog/{lang}/` where `{lang}` is `zh` or `en`.

### Required Frontmatter

```yaml
---
title: Post Title
description: Brief description for previews and SEO
pubDate: 2024-01-15
lang: zh
---
```

### Optional Frontmatter

```yaml
---
updatedDate: 2024-02-01    # Shows "updated on" if present
tags: [astro, blog]         # Default: []
category: 技术              # Default: '未分类'
image: /images/cover.jpg    # Shows hero image on card
draft: true                 # Excludes from build
---
```

### Example

```markdown
---
title: 你好，世界
description: 这是我的第一篇博客文章
pubDate: 2024-01-15
tags: [astro, blog]
category: 技术
lang: zh
---

Welcome content here...

## Subheading

More content.
```

## File Naming

- Filename becomes the URL slug: `hello-world.md` → `/zh/blog/hello-world`
- Use kebab-case: `my-new-post.md`
- Language prefix is stripped: file in `en/` gets URL `/en/blog/hello-world`

## Content Rules

1. **One post per file** — no multi-post files
2. **Language matches directory** — `zh/` files must have `lang: zh`
3. **Images** — place in `public/images/`, reference as `/images/filename.jpg`
4. **MDX supported** — use `.mdx` extension for component imports in content
