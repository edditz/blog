import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export const GET = async (context) => {
  const posts = await getCollection('blog', ({ data }) => !data.draft)

  const zhPosts = posts
    .filter((p) => p.data.lang === 'zh')
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
      link: `/zh/blog/${post.slug.replace(/^(zh|en)\//, '')}/`,
      categories: [...post.data.tags, post.data.category],
    })),
    customData: '<language>zh-cn</language>',
  })
}
