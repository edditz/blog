# Blog Admin

本地博客管理后台。

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm start
```

## 配置

编辑 `blog-admin.config.json`:

```json
{
  "blogRoot": "/path/to/your/blog",
  "postsDir": "src/posts",
  "port": 3001
}
```

或使用环境变量:

```bash
BLOG_ROOT=/path/to/blog pnpm dev
```

## 功能

- 文章管理（创建、编辑、删除、发布/取消发布）
- 标签管理（增删改查）
- 分类管理（增删改查）
- 图片上传和管理
- 双模式编辑器（源码模式 + WYSIWYG）
- 批量操作
- 搜索和筛选
