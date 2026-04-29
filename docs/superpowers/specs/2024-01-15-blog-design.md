# 个人博客系统设计文档

**日期：** 2024-01-15
**状态：** 已批准

---

## 1. 概述

构建一个个人博客系统，支持本地 Markdown 编写、Git 推送即发布、中英文多语言。

### 核心需求

| 需求 | 说明 |
|------|------|
| 内容格式 | 本地 Markdown / MDX 编写 |
| 样式 | Tailwind CSS，高度可定制 |
| 发布流程 | Git 推送即发布，本地可预览 |
| 架构 | 轻量，无服务器 |
| 功能 | 文章列表、分类/标签、搜索、RSS、中英文多语言 |
| 部署 | Vercel（后续可迁移阿里云） |
| SEO | 完整 SEO 支持 |

---

## 2. 技术栈

| 层级 | 技术选择 | 版本 |
|------|----------|------|
| 框架 | Astro | 4.x |
| 样式 | Tailwind CSS | 3.x |
| 插件 | @tailwindcss/typography | 0.5.x |
| 内容 | Markdown / MDX | - |
| 搜索 | Pagefind | 1.x |
| 部署 | Vercel | - |
| 版本控制 | GitHub | - |

---

## 3. 项目结构

```
myblog/
├── src/
│   ├── content/
│   │   └── blog/               # 博客文章
│   │       ├── en/             # 英文文章
│   │       └── zh/             # 中文文章
│   ├── layouts/
│   │   └── BaseLayout.astro    # 基础布局
│   ├── components/
│   │   ├── Header.astro        # 导航栏
│   │   ├── Footer.astro        # 页脚
│   │   ├── PostCard.astro      # 文章卡片
│   │   ├── LanguageSwitcher.astro  # 语言切换
│   │   └── Search.astro        # 搜索组件
│   └── pages/
│       ├── index.astro         # 首页（重定向）
│       ├── [...lang]/
│       │   ├── index.astro     # 语言首页
│       │   ├── blog/
│       │   │   ├── index.astro # 文章列表
│       │   │   └── [...slug].astro  # 文章详情
│       │   ├── tags/
│       │   │   ├── index.astro # 标签列表
│       │   │   └── [tag].astro # 标签下文章
│       │   └── categories/
│       │       ├── index.astro # 分类列表
│       │       └── [category].astro  # 分类下文章
│       └── rss.xml.js          # RSS feed
├── public/
│   ├── images/                 # 图片资源
│   └── favicon.ico
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. 文章格式

### Frontmatter

```yaml
---
title: 文章标题
description: 文章描述（用于 SEO 和列表展示）
pubDate: 2024-01-15
updatedDate: 2024-01-20  # 可选，更新日期
tags: [astro, blog, web]
category: 技术
lang: zh                  # zh 或 en
image: /images/cover.jpg  # 可选，封面图
draft: false              # 可选，草稿标记
---
```

### 文件命名

- 中文：`src/content/blog/zh/my-first-post.md`
- 英文：`src/content/blog/en/my-first-post.md`

---

## 5. 核心功能

### 5.1 文章列表

- 按发布时间倒序排列
- 显示标题、描述、日期、标签
- 支持分页（每页 10 篇）

### 5.2 分类/标签

- 从 frontmatter 自动提取
- 动态生成分类/标签页面
- 显示各分类/标签下文章数量

### 5.3 搜索

- 使用 Pagefind（构建时索引，客户端搜索）
- 支持中英文搜索
- 搜索结果高亮

### 5.4 RSS

- 使用 @astrojs/rss 插件
- 自动生成 `/rss.xml`
- 支持中英文双语 feed

### 5.5 多语言

- 路由前缀：`/zh/`、`/en/`
- 语言切换组件
- hreflang 标签（SEO）

### 5.6 SEO

- meta 标签（title、description）
- Open Graph 标签
- Twitter Card
- sitemap.xml
- 结构化数据（JSON-LD）
- canonical URL

### 5.7 暗色模式

- Tailwind dark mode
- 系统偏好检测
- 手动切换（localStorage 记忆）

---

## 6. 样式系统

### 6.1 Tailwind 配置

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            code: { backgroundColor: 'var(--color-code-bg)' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

### 6.2 CSS 变量

```css
:root {
  --color-primary: #1a1a2e;
  --color-secondary: #16213e;
  --color-accent: #e94560;
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-code-bg: #f3f4f6;
}

[data-theme="dark"] {
  --color-primary: #e2e8f0;
  --color-secondary: #cbd5e1;
  --color-accent: #ff6b6b;
  --color-bg: #1a1a2e;
  --color-text: #e2e8f0;
  --color-code-bg: #2d2d44;
}
```

---

## 7. 发布流程

```
本地编写 Markdown
      ↓
git add .
git commit -m "post: 新文章标题"
git push origin main
      ↓
Vercel 自动检测推送
      ↓
运行 astro build
      ↓
部署到 Vercel CDN
      ↓
博客更新上线（~30秒）
```

---

## 8. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev          # http://localhost:4321

# 构建
npm run build

# 预览构建结果
npm run preview
```

---

## 9. 迁移方案

### 从 Vercel 迁移到阿里云

1. 配置 GitHub Actions 构建
2. 构建产物上传到阿里云 OSS
3. 配置 CDN 加速
4. 修改 DNS 解析

迁移成本：约 1 天

---

## 10. 未来扩展

| 功能 | 实现方式 | 成本 |
|------|----------|------|
| 评论系统 | Giscus（GitHub Discussions） | 30 分钟 |
| 分享按钮 | 原生 Share API | 30 分钟 |
| 点赞功能 | Supabase | 半天 |
| 阅读统计 | Umami（自托管） | 半天 |

---

## 11. 依赖清单

```json
{
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/rss": "^3.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@astrojs/mdx": "^2.0.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.0",
    "pagefind": "^1.0.0"
  }
}
```

---

## 12. 验收标准

- [ ] 支持中英文多语言切换
- [ ] 文章列表、分类、标签功能正常
- [ ] 搜索功能可用（中英文）
- [ ] RSS feed 可订阅
- [ ] SEO 标签完整
- [ ] 暗色模式正常
- [ ] 本地预览支持热更新
- [ ] Git 推送自动部署
- [ ] 页面加载速度快（Lighthouse 90+）
