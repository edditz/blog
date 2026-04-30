import path from 'node:path'
import fs from 'node:fs'

export interface Config {
  blogRoot: string
  postsDir: string
  port: number
}

function loadConfig(): Config {
  const configPath = path.resolve(process.cwd(), 'blog-admin.config.json')

  let fileConfig: Partial<Config> = {}
  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  return {
    blogRoot: process.env.BLOG_ROOT || fileConfig.blogRoot || process.cwd(),
    postsDir: fileConfig.postsDir || 'src/posts',
    port: Number(process.env.PORT) || fileConfig.port || 3001,
  }
}

export const config = loadConfig()