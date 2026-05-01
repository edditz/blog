# Blog Admin System

博客管理后台，独立于 Astro 前端站点，用于管理文章、标签、分类和图片。

## Quick Start

```bash
# 从项目根目录启动（推荐）
./start-admin.sh

# 或手动启动
cd blog-admin
pnpm install
pnpm dev
```

启动后：
- 前端 (Vite): http://localhost:5173
- 后端 (Express): http://localhost:3001

## Architecture

```
blog-admin/
├── packages/
│   ├── shared/       # 共享类型定义 (@blog-admin/shared)
│   ├── server/       # Express API 服务 (@blog-admin/server)
│   └── client/       # React SPA 前端 (@blog-admin/client)
├── blog-admin.config.json   # 配置文件
└── pnpm-workspace.yaml      # monorepo 配置
```

### Data Flow

```
React SPA (Vite :5173)
  → proxy /api → Express (:3001)
    → 读写 blog 仓库的 src/posts/ 目录
    → 直接操作 MDX 文件（gray-matter 解析 frontmatter）
```

后台直接读写博客仓库的文件系统，没有独立数据库。所有数据都存在 MDX 文件的 frontmatter 中。

## Configuration

`blog-admin.config.json`:

```json
{
  "blogRoot": "/Users/eddie/projects/myblog",
  "postsDir": "src/posts",
  "port": 3001
}
```

环境变量覆盖：
- `BLOG_ROOT` — 博客仓库路径
- `PORT` — 后端端口

## API Reference

### Posts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts` | 列表（支持分页、搜索、筛选） |
| GET | `/api/posts/:slug` | 获取单篇文章 |
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:slug` | 更新文章 |
| DELETE | `/api/posts/:slug` | 删除文章（删除整个目录） |
| POST | `/api/posts/batch` | 批量操作 |

**查询参数** (GET /api/posts):
- `search` — 搜索标题、描述、标签
- `tag` — 按标签筛选
- `category` — 按分类筛选
- `status` — `all` | `draft` | `published`
- `page` / `limit` — 分页

**批量操作** (POST /api/posts/batch):
```json
{
  "action": "delete" | "publish" | "unpublish" | "tag",
  "slugs": ["post-1", "post-2"],
  "tags": ["new-tag"]  // 仅 action=tag 时需要
}
```

### Tags

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tags` | 列出所有标签（含文章计数） |
| PUT | `/api/tags/:name` | 重命名标签（批量更新所有引用） |
| DELETE | `/api/tags/:name` | 删除标签（从所有文章中移除） |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | 列出所有分类（含文章计数） |
| PUT | `/api/categories/:name` | 重命名分类 |
| DELETE | `/api/categories/:name` | 删除分类 |

### Images

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/:slug` | 上传图片到文章目录 |
| GET | `/api/images/:slug/:file` | 获取图片 |
| DELETE | `/api/images/:slug/:file` | 删除图片 |

图片存储在 `src/posts/{slug}/images/` 目录下。

## Frontend

### Tech Stack
- React 19 + React Router 6
- HeroUI v3 (组件库)
- Tailwind CSS v4
- CodeMirror 6 (源码编辑器)
- TipTap (WYSIWYG 编辑器)
- Zustand (状态管理)
- Axios (HTTP 客户端)

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | → `/posts` | 重定向 |
| `/posts` | PostList | 文章列表（搜索、筛选、批量操作） |
| `/posts/new` | PostEdit | 新建文章 |
| `/posts/:slug/edit` | PostEdit | 编辑文章 |
| `/tags` | TagManager | 标签管理 |
| `/categories` | CategoryManager | 分类管理 |

### Editor Modes

PostEdit 页面支持两种编辑模式：
- **Source Editor** — CodeMirror 6，直接编辑 MDX 源码
- **WYSIWYG Editor** — TipTap，所见即所得编辑

通过 ModeSwitch 组件切换。

## File Structure (Server)

```
packages/server/src/
├── index.ts          # Express 入口，路由注册
├── config.ts         # 配置加载（config.json + 环境变量）
├── routes/
│   ├── posts.ts      # /api/posts 路由
│   ├── tags.ts       # /api/tags 路由
│   ├── categories.ts # /api/categories 路由
│   └── images.ts     # /api/images 路由（multer 文件上传）
└── services/
    ├── post.ts       # 文章 CRUD（读写 MDX 文件）
    ├── tag.ts        # 标签操作（遍历文章更新）
    └── category.ts   # 分类操作（遍历文章更新）
```

## File Structure (Client)

```
packages/client/src/
├── main.tsx              # 入口
├── App.tsx               # 路由定义
├── api/client.ts         # API 客户端（axios）
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx  # 布局（侧边栏 + 内容区）
│   │   └── Sidebar.tsx      # 导航侧边栏
│   ├── editor/
│   │   ├── SourceEditor.tsx    # CodeMirror 编辑器
│   │   ├── WysiwygEditor.tsx  # TipTap 编辑器
│   │   ├── FrontmatterForm.tsx # 元数据表单
│   │   ├── ModeSwitch.tsx     # 编辑模式切换
│   │   ├── EditorToolbar.tsx  # 编辑器工具栏
│   │   ├── ImageManager.tsx   # 图片管理弹窗
│   │   └── SlashCommand.tsx   # 斜杠命令
│   ├── posts/
│   │   └── PostTable.tsx      # 文章列表表格
│   ├── TablePagination.tsx    # 分页组件
│   └── EmptyState.tsx         # 空状态组件
└── pages/
    ├── PostList.tsx        # 文章列表页
    ├── PostEdit.tsx        # 文章编辑页
    ├── TagManager.tsx      # 标签管理页
    └── CategoryManager.tsx # 分类管理页
```

## Relationship with Astro Site

后台和前端站点是独立的项目：

- **Astro 端** (`src/`) — 静态站点生成，读取 `src/posts/` 生成页面
- **Admin 端** (`blog-admin/`) — 管理后台，读写同一个 `src/posts/` 目录

后台修改文件后，需要重新 `npm run build` 才能在生产站点看到变化。开发时 Astro 的 dev server 会自动热更新。
