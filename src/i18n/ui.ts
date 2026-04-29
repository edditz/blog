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
export type TranslationKey = keyof (typeof ui)[typeof defaultLang]
