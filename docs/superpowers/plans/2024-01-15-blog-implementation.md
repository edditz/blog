# 个人博客系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个支持中英文多语言的个人博客系统，使用 Astro + Tailwind CSS，部署到 Vercel。

**Architecture:** 静态站点生成（SSG），Markdown 内容驱动，Tailwind CSS 样式，Astro Islands 架构支持后续交互功能扩展。

**Tech Stack:** Astro 4.x, Tailwind CSS 3.x, @tailwindcss/typography, Pagefind, Vercel

---

## 文件结构

```
myblog/
├── src/
│   ├── content/
│   │   ├── blog/
│   │   │   ├── en/
│   │   │   │   └── hello-world.md
│   │   │   └── zh/
│   │   │       └── hello-world.md
│   │   └── config.ts
│   ├── i18n/
│   │   ├── ui.ts
│   │   └── utils.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── LanguageSwitcher.astro
│   │   └── ThemeToggle.astro
│   └── pages/
│       ├── index.astro
│       ├── rss.xml.js
│       └── [...lang]/
│           ├── index.astro
│           ├── blog/
│           │   ├── index.astro
│           │   └── [...slug].astro
│           ├── tags/
│           │   ├── index.astro
│           │   └── [tag].astro
│           └── categories/
│               ├── index.astro
│               └── [category].astro
├── public/
│   ├── images/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.js`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro`

- [ ] **Step 1: 初始化 Astro 项目**

Run: `npm create astro@latest myblog -- --template minimal --no-install --no-git`

Expected: 项目创建成功

- [ ] **Step 2: 安装依赖**

Run:
```bash
cd myblog
npm install astro @astrojs/tailwind tailwindcss @tailwindcss/typography @astrojs/rss @astrojs/sitemap @astrojs/mdx
```

Expected: 依赖安装成功，无错误

- [ ] **Step 3: 创建 Astro 配置**

Create: `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

export default defineConfig({
  site: 'https://yourblog.com',
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
  ],
})
```

- [ ] **Step 4: 创建 Tailwind 配置**

Create: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            code: {
              backgroundColor: 'var(--color-code-bg)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

- [ ] **Step 5: 创建 TypeScript 配置**

Create: `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: 创建首页重定向**

Create: `src/pages/index.astro`

```astro
---
return Astro.redirect('/zh/')
---
```

- [ ] **Step 7: 提交代码**

```bash
git init
git add .
git commit -m "chore: initialize astro project with tailwind"
```

---

## Task 2: 国际化（i18n）配置

**Files:**
- Create: `src/i18n/ui.ts`
- Create: `src/i18n/utils.ts`

- [ ] **Step 1: 创建翻译文件**

Create: `src/i18n/ui.ts`

```typescript
export const languages = {
  zh: '中文',
  en: 'English',
} as const

export const defaultLang = 'zh'

export const ui = {
  zh: {
    'site.title': '我的博客',
    'site.description': '分享技术与生活',
    'nav.home': '首页',
    'nav.blog': '博客',
    'nav.tags': '标签',
    'nav.categories': '分类',
    'post.readMore': '阅读全文',
    'post.publishedAt': '发布于',
    'post.updatedAt': '更新于',
    'post.tags': '标签',
    'post.category': '分类',
    'list.tags': '所有标签',
    'list.categories': '所有分类',
    'list.posts': '文章列表',
    'list.noPosts': '暂无文章',
    'rss.title': 'RSS Feed',
    'rss.description': '订阅我的博客',
  },
  en: {
    'site.title': 'My Blog',
    'site.description': 'Sharing tech and life',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.tags': 'Tags',
    'nav.categories': 'Categories',
    'post.readMore': 'Read More',
    'post.publishedAt': 'Published on',
    'post.updatedAt': 'Updated on',
    'post.tags': 'Tags',
    'post.category': 'Category',
    'list.tags': 'All Tags',
    'list.categories': 'All Categories',
    'list.posts': 'Posts',
    'list.noPosts': 'No posts yet',
    'rss.title': 'RSS Feed',
    'rss.description': 'Subscribe to my blog',
  },
} as const

export type Lang = keyof typeof ui
export type TranslationKey = keyof typeof ui[typeof defaultLang]
```

- [ ] **Step 2: 创建工具函数**

Create: `src/i18n/utils.ts`

```typescript
import { ui, defaultLang, type Lang, type TranslationKey } from './ui'

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/')
  if (lang in ui) return lang as Lang
  return defaultLang
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return ui[lang][key] || ui[defaultLang][key]
  }
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname
  const parts = pathname.split('/')
  const lang = parts[1]

  if (lang in ui) {
    return '/' + parts.slice(2).join('/')
  }
  return pathname
}
```

- [ ] **Step 3: 提交代码**

```bash
git add src/i18n/
git commit -m "feat: add i18n configuration and utilities"
```

---

## Task 3: 内容集合配置

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/zh/hello-world.md`
- Create: `src/content/blog/en/hello-world.md`

- [ ] **Step 1: 创建内容集合配置**

Create: `src/content/config.ts`

```typescript
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default('未分类'),
    lang: z.enum(['zh', 'en']),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
```

- [ ] **Step 2: 创建中文示例文章**

Create: `src/content/blog/zh/hello-world.md`

```markdown
---
title: 你好，世界
description: 这是我的第一篇博客文章
pubDate: 2024-01-15
tags: [astro, blog]
category: 技术
lang: zh
---

欢迎来到我的博客！

这是我使用 Astro 构建的个人博客。在这里，我将分享我的技术学习笔记和生活感悟。

## 关于这个博客

这个博客使用以下技术构建：

- **Astro** - 静态站点生成框架
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Markdown** - 内容格式

## 未来计划

我计划在这里分享：

1. Web 开发技术文章
2. 编程最佳实践
3. 工具和资源推荐
4. 个人项目经验

感谢你的阅读！
```

- [ ] **Step 3: 创建英文示例文章**

Create: `src/content/blog/en/hello-world.md`

```markdown
---
title: Hello World
description: This is my first blog post
pubDate: 2024-01-15
tags: [astro, blog]
category: Tech
lang: en
---

Welcome to my blog!

This is my personal blog built with Astro. Here, I'll share my technical learning notes and life reflections.

## About This Blog

This blog is built with:

- **Astro** - Static site generation framework
- **Tailwind CSS** - Utility-first CSS framework
- **Markdown** - Content format

## Future Plans

I plan to share:

1. Web development articles
2. Programming best practices
3. Tool and resource recommendations
4. Personal project experiences

Thank you for reading!
```

- [ ] **Step 4: 提交代码**

```bash
git add src/content/
git commit -m "feat: add content collection config and sample posts"
```

---

## Task 4: 基础布局组件

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/styles/global.css`

- [ ] **Step 1: 创建全局样式**

Create: `src/styles/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #1a1a2e;
  --color-secondary: #16213e;
  --color-accent: #e94560;
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-code-bg: #f3f4f6;
  --color-border: #e5e7eb;
  --color-card-bg: #ffffff;
  --color-nav-bg: #ffffff;
}

[data-theme="dark"] {
  --color-primary: #e2e8f0;
  --color-secondary: #cbd5e1;
  --color-accent: #ff6b6b;
  --color-bg: #0f172a;
  --color-text: #e2e8f0;
  --color-code-bg: #1e293b;
  --color-border: #334155;
  --color-card-bg: #1e293b;
  --color-nav-bg: #0f172a;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-bg text-text font-sans;
  transition: background-color 0.3s, color 0.3s;
}
```

- [ ] **Step 2: 创建基础布局**

Create: `src/layouts/BaseLayout.astro`

```astro
---
import Header from '@/components/Header.astro'
import Footer from '@/components/Footer.astro'
import { getLangFromUrl } from '@/i18n/utils'

interface Props {
  title: string
  description?: string
  image?: string
  article?: boolean
}

const { title, description, image, article } = Astro.props
const lang = getLangFromUrl(Astro.url)
const canonicalURL = new URL(Astro.url.pathname, Astro.site)
---

<!doctype html>
<html lang={lang} data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="canonical" href={canonicalURL} />

  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  {description && <meta name="description" content={description} />}

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={article ? 'article' : 'website'} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={title} />
  {description && <meta property="og:description" content={description} />}
  {image && <meta property="og:image" content={new URL(image, Astro.site)} />}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalURL} />
  <meta property="twitter:title" content={title} />
  {description && <meta property="twitter:description" content={description} />}
  {image && <meta property="twitter:image" content={new URL(image, Astro.site)} />}
</head>
<body class="min-h-screen flex flex-col">
  <Header />
  <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
    <slot />
  </main>
  <Footer />
</body>
</html>

<script>
  // 主题切换逻辑
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', theme)
</script>
```

- [ ] **Step 3: 提交代码**

```bash
git add src/layouts/ src/styles/
git commit -m "feat: add base layout and global styles"
```

---

## Task 5: Header 组件

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/LanguageSwitcher.astro`
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: 创建语言切换组件**

Create: `src/components/LanguageSwitcher.astro`

```astro
---
import { languages } from '@/i18n/ui'
import { getLangFromUrl, getRouteFromUrl } from '@/i18n/utils'

const lang = getLangFromUrl(Astro.url)
const route = getRouteFromUrl(Astro.url)
---

<div class="flex items-center gap-2">
  {Object.entries(languages).map(([code, label]) => (
    <a
      href={`/${code}${route}`}
      class={`px-2 py-1 text-sm rounded transition-colors ${
        lang === code
          ? 'bg-accent text-white'
          : 'text-text hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </a>
  ))}
</div>
```

- [ ] **Step 2: 创建主题切换组件**

Create: `src/components/ThemeToggle.astro`

```astro
---
---

<button
  id="theme-toggle"
  class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  aria-label="Toggle theme"
>
  <svg class="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd" />
  </svg>
  <svg class="w-5 h-5 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
</button>

<script>
  const toggle = document.getElementById('theme-toggle')
  toggle?.addEventListener('click', () => {
    const html = document.documentElement
    const current = html.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  })
</script>
```

- [ ] **Step 3: 创建 Header 组件**

Create: `src/components/Header.astro`

```astro
---
import LanguageSwitcher from './LanguageSwitcher.astro'
import ThemeToggle from './ThemeToggle.astro'
import { getLangFromUrl, useTranslations } from '@/i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)

const navItems = [
  { href: `/${lang}/`, label: t('nav.home') },
  { href: `/${lang}/blog/`, label: t('nav.blog') },
  { href: `/${lang}/tags/`, label: t('nav.tags') },
  { href: `/${lang}/categories/`, label: t('nav.categories') },
]
---

<header class="sticky top-0 z-50 bg-nav-bg/80 backdrop-blur-sm border-b border-border">
  <nav class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href={`/${lang}/`} class="text-xl font-bold text-primary hover:text-accent transition-colors">
      {t('site.title')}
    </a>

    <div class="flex items-center gap-6">
      <ul class="flex items-center gap-4">
        {navItems.map(({ href, label }) => (
          <li>
            <a
              href={href}
              class={`text-sm font-medium transition-colors hover:text-accent ${
                Astro.url.pathname === href ? 'text-accent' : 'text-text'
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </nav>
</header>
```

- [ ] **Step 4: 提交代码**

```bash
git add src/components/
git commit -m "feat: add header with language switcher and theme toggle"
```

---

## Task 6: Footer 组件

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: 创建 Footer 组件**

Create: `src/components/Footer.astro`

```astro
---
import { getLangFromUrl, useTranslations } from '@/i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
const year = new Date().getFullYear()
---

<footer class="border-t border-border mt-auto">
  <div class="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p class="text-sm text-secondary">
      &copy; {year} {t('site.title')}. All rights reserved.
    </p>
    <div class="flex items-center gap-4">
      <a href={`/${lang}/rss.xml`} class="text-sm text-secondary hover:text-accent transition-colors">
        RSS
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: 提交代码**

```bash
git add src/components/Footer.astro
git commit -m "feat: add footer component"
```

---

## Task 7: PostCard 组件

**Files:**
- Create: `src/components/PostCard.astro`

- [ ] **Step 1: 创建 PostCard 组件**

Create: `src/components/PostCard.astro`

```astro
---
import { getLangFromUrl, useTranslations } from '@/i18n/utils'

interface Props {
  title: string
  description: string
  pubDate: Date
  tags: string[]
  category: string
  slug: string
  image?: string
}

const { title, description, pubDate, tags, category, slug, image } = Astro.props
const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)

const dateStr = pubDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
---

<article class="group bg-card-bg rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
  {image && (
    <a href={`/${lang}/blog/${slug}/`}>
      <img
        src={image}
        alt={title}
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </a>
  )}

  <div class="p-4">
    <div class="flex items-center gap-2 mb-2 text-sm text-secondary">
      <time datetime={pubDate.toISOString()}>{dateStr}</time>
      <span>&middot;</span>
      <span>{category}</span>
    </div>

    <h3 class="text-lg font-semibold mb-2">
      <a
        href={`/${lang}/blog/${slug}/`}
        class="text-primary hover:text-accent transition-colors"
      >
        {title}
      </a>
    </h3>

    <p class="text-secondary text-sm mb-4 line-clamp-2">
      {description}
    </p>

    <div class="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <a
          href={`/${lang}/tags/${tag}/`}
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-secondary rounded hover:bg-accent hover:text-white transition-colors"
        >
          #{tag}
        </a>
      ))}
    </div>
  </div>
</article>
```

- [ ] **Step 2: 提交代码**

```bash
git add src/components/PostCard.astro
git commit -m "feat: add post card component"
```

---

## Task 8: 语言首页

**Files:**
- Create: `src/pages/[lang]/index.astro`

- [ ] **Step 1: 创建语言首页**

Create: `src/pages/[lang]/index.astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }))
}

const { lang } = Astro.params
const t = useTranslations(lang as keyof typeof languages)

const posts = (await getCollection('blog', ({ data }) => {
  return data.lang === lang && !data.draft
})).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

const recentPosts = posts.slice(0, 5)
---

<BaseLayout title={t('site.title')} description={t('site.description')}>
  <section class="mb-12">
    <h1 class="text-3xl font-bold mb-4 text-primary">{t('site.title')}</h1>
    <p class="text-secondary">{t('site.description')}</p>
  </section>

  <section>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-primary">{t('list.posts')}</h2>
      <a href={`/${lang}/blog/`} class="text-sm text-accent hover:underline">
        {t('post.readMore')} &rarr;
      </a>
    </div>

    {recentPosts.length > 0 ? (
      <div class="grid gap-6">
        {recentPosts.map((post) => (
          <PostCard
            title={post.data.title}
            description={post.data.description}
            pubDate={post.data.pubDate}
            tags={post.data.tags}
            category={post.data.category}
            slug={post.slug}
            image={post.data.image}
          />
        ))}
      </div>
    ) : (
      <p class="text-secondary">{t('list.noPosts')}</p>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 2: 提交代码**

```bash
git add src/pages/\[lang\]/index.astro
git commit -m "feat: add language home page with recent posts"
```

---

## Task 9: 文章列表页

**Files:**
- Create: `src/pages/[lang]/blog/index.astro`

- [ ] **Step 1: 创建文章列表页**

Create: `src/pages/[lang]/blog/index.astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }))
}

const { lang } = Astro.params
const t = useTranslations(lang as keyof typeof languages)

const posts = (await getCollection('blog', ({ data }) => {
  return data.lang === lang && !data.draft
})).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
---

<BaseLayout title={t('nav.blog')} description={t('list.posts')}>
  <h1 class="text-3xl font-bold mb-8 text-primary">{t('nav.blog')}</h1>

  {posts.length > 0 ? (
    <div class="grid gap-6">
      {posts.map((post) => (
        <PostCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          tags={post.data.tags}
          category={post.data.category}
          slug={post.slug}
          image={post.data.image}
        />
      ))}
    </div>
  ) : (
    <p class="text-secondary">{t('list.noPosts')}</p>
  )}
</BaseLayout>
```

- [ ] **Step 2: 提交代码**

```bash
git add src/pages/\[lang\]/blog/index.astro
git commit -m "feat: add blog listing page"
```

---

## Task 10: 文章详情页

**Files:**
- Create: `src/pages/[lang]/blog/[...slug].astro`

- [ ] **Step 1: 创建文章详情页**

Create: `src/pages/[lang]/blog/[...slug].astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { getLangFromUrl, useTranslations } from '@/i18n/utils'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map((post) => ({
    params: {
      lang: post.data.lang,
      slug: post.slug,
    },
    props: { post },
  }))
}

const { post } = Astro.props
const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)

const { Content } = await post.render()

const dateStr = post.data.pubDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const updatedStr = post.data.updatedDate?.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
---

<BaseLayout
  title={post.data.title}
  description={post.data.description}
  image={post.data.image}
  article
>
  <article class="prose prose-lg dark:prose-invert max-w-none">
    <header class="mb-8">
      <h1 class="text-3xl font-bold mb-4 text-primary">{post.data.title}</h1>

      <div class="flex flex-wrap items-center gap-4 text-sm text-secondary">
        <time datetime={post.data.pubDate.toISOString()}>
          {t('post.publishedAt')} {dateStr}
        </time>

        {updatedStr && (
          <span>
            {t('post.updatedAt')} {updatedStr}
          </span>
        )}

        <span>{t('post.category')}: {post.data.category}</span>
      </div>

      <div class="flex flex-wrap gap-2 mt-4">
        {post.data.tags.map((tag) => (
          <a
            href={`/${lang}/tags/${tag}/`}
            class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-secondary rounded hover:bg-accent hover:text-white transition-colors"
          >
            #{tag}
          </a>
        ))}
      </div>
    </header>

    <Content />
  </article>
</BaseLayout>
```

- [ ] **Step 2: 提交代码**

```bash
git add src/pages/\[lang\]/blog/\[...slug\].astro
git commit -m "feat: add blog post detail page"
```

---

## Task 11: 标签页面

**Files:**
- Create: `src/pages/[lang]/tags/index.astro`
- Create: `src/pages/[lang]/tags/[tag].astro`

- [ ] **Step 1: 创建标签列表页**

Create: `src/pages/[lang]/tags/index.astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }))
}

const { lang } = Astro.params
const t = useTranslations(lang as keyof typeof languages)

const posts = await getCollection('blog', ({ data }) => {
  return data.lang === lang && !data.draft
})

const tags = [...new Set(posts.flatMap((post) => post.data.tags))]
const tagCounts = tags.map((tag) => ({
  name: tag,
  count: posts.filter((post) => post.data.tags.includes(tag)).length,
}))
---

<BaseLayout title={t('list.tags')} description={t('list.tags')}>
  <h1 class="text-3xl font-bold mb-8 text-primary">{t('list.tags')}</h1>

  <div class="flex flex-wrap gap-4">
    {tagCounts.map(({ name, count }) => (
      <a
        href={`/${lang}/tags/${name}/`}
        class="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-accent hover:text-white transition-colors"
      >
        #{name} ({count})
      </a>
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 2: 创建标签下文章页**

Create: `src/pages/[lang]/tags/[tag].astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft)
  const allTags = [...new Set(posts.flatMap((post) => post.data.tags))]

  return Object.keys(languages).flatMap((lang) =>
    allTags.map((tag) => ({
      params: { lang, tag },
      props: {
        posts: posts
          .filter((p) => p.data.lang === lang && p.data.tags.includes(tag))
          .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()),
      },
    }))
  )
}

const { lang, tag } = Astro.params
const { posts } = Astro.props
const t = useTranslations(lang as keyof typeof languages)
---

<BaseLayout title={`#${tag}`} description={`${t('post.tags')}: ${tag}`}>
  <h1 class="text-3xl font-bold mb-8 text-primary">
    {t('post.tags')}: #{tag}
  </h1>

  {posts.length > 0 ? (
    <div class="grid gap-6">
      {posts.map((post) => (
        <PostCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          tags={post.data.tags}
          category={post.data.category}
          slug={post.slug}
          image={post.data.image}
        />
      ))}
    </div>
  ) : (
    <p class="text-secondary">{t('list.noPosts')}</p>
  )}
</BaseLayout>
```

- [ ] **Step 3: 提交代码**

```bash
git add src/pages/\[lang\]/tags/
git commit -m "feat: add tags pages"
```

---

## Task 12: 分类页面

**Files:**
- Create: `src/pages/[lang]/categories/index.astro`
- Create: `src/pages/[lang]/categories/[category].astro`

- [ ] **Step 1: 创建分类列表页**

Create: `src/pages/[lang]/categories/index.astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }))
}

const { lang } = Astro.params
const t = useTranslations(lang as keyof typeof languages)

const posts = await getCollection('blog', ({ data }) => {
  return data.lang === lang && !data.draft
})

const categories = [...new Set(posts.map((post) => post.data.category))]
const categoryCounts = categories.map((category) => ({
  name: category,
  count: posts.filter((post) => post.data.category === category).length,
}))
---

<BaseLayout title={t('list.categories')} description={t('list.categories')}>
  <h1 class="text-3xl font-bold mb-8 text-primary">{t('list.categories')}</h1>

  <div class="grid gap-4 sm:grid-cols-2">
    {categoryCounts.map(({ name, count }) => (
      <a
        href={`/${lang}/categories/${name}/`}
        class="p-4 bg-card-bg border border-border rounded-lg hover:border-accent hover:shadow-md transition-all"
      >
        <h2 class="text-lg font-semibold text-primary">{name}</h2>
        <p class="text-sm text-secondary">{count} {t('list.posts')}</p>
      </a>
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 2: 创建分类下文章页**

Create: `src/pages/[lang]/categories/[category].astro`

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { getCollection } from 'astro:content'
import { languages } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft)
  const allCategories = [...new Set(posts.map((post) => post.data.category))]

  return Object.keys(languages).flatMap((lang) =>
    allCategories.map((category) => ({
      params: { lang, category },
      props: {
        posts: posts
          .filter((p) => p.data.lang === lang && p.data.category === category)
          .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()),
      },
    }))
  )
}

const { lang, category } = Astro.params
const { posts } = Astro.props
const t = useTranslations(lang as keyof typeof languages)
---

<BaseLayout title={category} description={`${t('post.category')}: ${category}`}>
  <h1 class="text-3xl font-bold mb-8 text-primary">
    {t('post.category')}: {category}
  </h1>

  {posts.length > 0 ? (
    <div class="grid gap-6">
      {posts.map((post) => (
        <PostCard
          title={post.data.title}
          description={post.data.description}
          pubDate={post.data.pubDate}
          tags={post.data.tags}
          category={post.data.category}
          slug={post.slug}
          image={post.data.image}
        />
      ))}
    </div>
  ) : (
    <p class="text-secondary">{t('list.noPosts')}</p>
  )}
</BaseLayout>
```

- [ ] **Step 3: 提交代码**

```bash
git add src/pages/\[lang\]/categories/
git commit -m "feat: add categories pages"
```

---

## Task 13: RSS Feed

**Files:**
- Create: `src/pages/rss.xml.js`

- [ ] **Step 1: 创建 RSS Feed**

Create: `src/pages/rss.xml.js`

```javascript
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export const GET = async (context) => {
  const posts = await getCollection('blog', ({ data }) => !data.draft)

  const zhPosts = posts
    .filter((p) => p.data.lang === 'zh')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  const enPosts = posts
    .filter((p) => p.data.lang === 'en')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  // 默认返回中文 RSS
  return rss({
    title: '我的博客',
    description: '分享技术与生活',
    site: context.site,
    items: zhPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/zh/blog/${post.slug}/`,
      categories: [...post.data.tags, post.data.category],
    })),
    customData: '<language>zh-cn</language>',
  })
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/pages/rss.xml.js
git commit -m "feat: add RSS feed"
```

---

## Task 14: Sitemap 和 SEO

**Files:**
- Modify: `astro.config.mjs`
- Create: `src/components/SEO.astro`

- [ ] **Step 1: 更新 Astro 配置**

Modify: `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

export default defineConfig({
  site: 'https://yourblog.com',
  integrations: [
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
})
```

- [ ] **Step 2: 提交代码**

```bash
git add astro.config.mjs
git commit -m "feat: add sitemap and markdown config"
```

---

## Task 15: 搜索功能

**Files:**
- Create: `src/components/Search.astro`
- Modify: `src/pages/[lang]/blog/index.astro`

- [ ] **Step 1: 创建搜索组件**

Create: `src/components/Search.astro`

```astro
---
import { getLangFromUrl } from '@/i18n/utils'

const lang = getLangFromUrl(Astro.url)
---

<div class="relative">
  <input
    type="text"
    id="search-input"
    placeholder={lang === 'zh' ? '搜索文章...' : 'Search posts...'}
    class="w-full px-4 py-2 border border-border rounded-lg bg-card-bg text-text focus:outline-none focus:border-accent"
  />
  <div
    id="search-results"
    class="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-border rounded-lg shadow-lg hidden max-h-96 overflow-y-auto z-50"
  >
  </div>
</div>

<script>
  import PagefindUI from '@pagefind/default-ui'

  const searchInput = document.getElementById('search-input')
  const searchResults = document.getElementById('search-results')

  if (searchInput && searchResults) {
    const pagefind = new PagefindUI({
      element: searchResults,
      showSubResults: false,
      showImages: false,
    })

    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value
      if (query.length > 2) {
        pagefind.triggerSearch(query)
        searchResults.classList.remove('hidden')
      } else {
        searchResults.classList.add('hidden')
      }
    })

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target as Node) && !searchResults.contains(e.target as Node)) {
        searchResults.classList.add('hidden')
      }
    })
  }
</script>
```

- [ ] **Step 2: 安装 Pagefind**

Run: `npm install pagefind`

- [ ] **Step 3: 更新 package.json 脚本**

Modify: `package.json`

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview"
  }
}
```

- [ ] **Step 4: 添加搜索到文章列表页**

Modify: `src/pages/[lang]/blog/index.astro`

在 `<h1>` 标签后添加：

```astro
<div class="mb-8">
  <Search />
</div>
```

并在 frontmatter 中导入：

```astro
import Search from '@/components/Search.astro'
```

- [ ] **Step 5: 提交代码**

```bash
git add src/components/Search.astro package.json src/pages/\[lang\]/blog/index.astro
git commit -m "feat: add search functionality with pagefind"
```

---

## Task 16: 静态资源

**Files:**
- Create: `public/favicon.svg`

- [ ] **Step 1: 创建 favicon**

Create: `public/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">📝</text>
</svg>
```

- [ ] **Step 2: 提交代码**

```bash
git add public/
git commit -m "chore: add favicon"
```

---

## Task 17: 部署配置

**Files:**
- Create: `vercel.json` (可选)
- Create: `.gitignore`

- [ ] **Step 1: 创建 .gitignore**

Create: `.gitignore`

```
# build output
dist/
.pagefind/

# generated types
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS-specific files
.DS_Store
```

- [ ] **Step 2: 提交代码**

```bash
git add .gitignore
git commit -m "chore: add gitignore"
```

- [ ] **Step 3: 推送到 GitHub**

```bash
git remote add origin https://github.com/yourusername/myblog.git
git push -u origin main
```

- [ ] **Step 4: 部署到 Vercel**

1. 登录 Vercel (https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置：
   - Framework Preset: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 "Deploy"

---

## Task 18: 最终验证

- [ ] **Step 1: 本地构建测试**

Run: `npm run build`

Expected: 构建成功，无错误

- [ ] **Step 2: 本地预览**

Run: `npm run preview`

Expected: http://localhost:4321 可访问

- [ ] **Step 3: 验证功能**

- [ ] 首页显示正确
- [ ] 中英文切换正常
- [ ] 文章列表显示正确
- [ ] 文章详情页正常
- [ ] 标签页正常
- [ ] 分类页正常
- [ ] RSS 可访问
- [ ] 暗色模式正常
- [ ] 搜索功能正常

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "chore: final verification and cleanup"
git push
```

---

## 完成

博客系统已部署完成！

### 后续步骤

1. 绑定自定义域名
2. 添加更多文章
3. 自定义样式
4. 按需添加社交功能（Giscus 评论等）

### 有用的命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览构建结果
```
