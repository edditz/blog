# My Blog

一个基于 Astro 构建的个人博客系统，支持中英文多语言、暗色模式、搜索功能。

## 功能特性

- ✅ 中英文多语言支持
- ✅ 文章列表、分类、标签
- ✅ 全文搜索（Pagefind）
- ✅ RSS 订阅
- ✅ SEO 优化（Sitemap、Open Graph、Twitter Card）
- ✅ 暗色模式
- ✅ 响应式设计
- ✅ Git 推送即发布

## 技术栈

- **框架**: Astro 5.x
- **样式**: Tailwind CSS 3.x
- **搜索**: Pagefind
- **部署**: Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
myblog/
├── src/
│   ├── components/      # 组件
│   ├── content/blog/    # 博客文章
│   │   ├── en/          # 英文文章
│   │   └── zh/          # 中文文章
│   ├── i18n/            # 国际化配置
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面路由
│   └── styles/          # 样式文件
├── public/              # 静态资源
├── astro.config.mjs     # Astro 配置
└── tailwind.config.js   # Tailwind 配置
```

## 发布流程

1. 在 `src/content/blog/zh/` 或 `src/content/blog/en/` 目录下创建 Markdown 文件
2. 添加 frontmatter（标题、日期、标签等）
3. 提交并推送到 GitHub
4. Vercel 自动构建并部署（约 30 秒）

## 许可证

- 代码：[MIT License](LICENSE.code)
- 博客内容：[CC BY-SA 4.0](LICENSE.content)
