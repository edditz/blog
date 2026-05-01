# Blog Admin Design Notes

设计决策和架构说明。

## 为什么是 Monorepo

三个包共享类型定义，放在一个 pnpm workspace 里：

- `@blog-admin/shared` — 纯类型，无运行时代码
- `@blog-admin/server` — Express 后端
- `@blog-admin/client` — React 前端

类型只定义一次，前后端共享。修改 `shared/src/types.ts` 后两端同时生效。

## 为什么没有数据库

后台直接操作博客仓库的文件系统。每个文章是一个 MDX 文件，frontmatter 就是元数据。

优势：
- 无需额外基础设施
- 文章就是 Git 版本控制的文件
- 与 Astro 的 Content Layer API 天然兼容
- 备份 = git push

代价：
- 标签/分类重命名需要遍历所有文件
- 没有全文搜索索引（靠内存过滤）
- 并发编辑可能冲突（单人使用场景下可接受）

## Server 设计

### 配置加载

`config.ts` 从两个来源合并配置：
1. `blog-admin.config.json`（walk up from cwd 查找）
2. 环境变量 `BLOG_ROOT` / `PORT`

环境变量优先级更高。

### 文章存储格式

每个文章是一个目录：
```
src/posts/{slug}/
├── index.mdx      # 文章内容 + frontmatter
└── images/        # 文章关联图片
```

`post.ts` 服务使用 `gray-matter` 解析 frontmatter，写入时手动拼接 YAML。

### 标签/分类是派生数据

没有独立的标签/分类存储。`tag.ts` 和 `category.ts` 通过遍历所有文章的 frontmatter 来聚合。

重命名操作 = 遍历所有文章 → 找到引用 → 更新 frontmatter → 写回文件。

### 图片上传

使用 `multer` 处理 multipart 上传。图片存储在对应文章的 `images/` 子目录。文件名自动 slugify。

## Client 设计

### 编辑器双模式

- **Source Editor** (CodeMirror 6): 直接编辑 MDX 源码，适合熟悉 Markdown 的用户
- **WYSIWYG Editor** (TipTap): 所见即所得，适合快速排版

两种模式共享同一个 `content` state，切换时内容不丢失。

### 路由结构

```
/posts           → 文章列表
/posts/new       → 新建文章
/posts/:slug/edit → 编辑文章
/tags            → 标签管理
/categories      → 分类管理
```

AdminLayout 包裹所有路由，提供侧边栏 + 内容区布局。

### API 代理

开发模式下 Vite 将 `/api` 请求代理到 Express 服务 (localhost:3001)。生产模式下 Express 同时 serve 前端静态文件。

## 与 Astro 站点的关系

两个独立项目，共享同一个文件系统 (`src/posts/`)：

```
myblog/
├── src/               # Astro 站点（读取 posts）
├── blog-admin/        # 管理后台（读写 posts）
└── start-admin.sh     # 启动脚本
```

后台修改文件 → Astro dev server 热更新 / 需要重新 build。
