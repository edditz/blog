import path from 'node:path'
import fs from 'node:fs'

export interface Config {
  blogRoot: string
  postsDir: string
  port: number
}

function loadConfig(): Config {
  // Walk up from cwd to find blog-admin.config.json (monorepo root)
  let dir = process.cwd()
  let configPath = ''
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, 'blog-admin.config.json')
    if (fs.existsSync(candidate)) {
      configPath = candidate
      break
    }
    dir = path.dirname(dir)
  }

  let fileConfig: Partial<Config> = {}
  if (configPath) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  return {
    blogRoot: process.env.BLOG_ROOT || fileConfig.blogRoot || process.cwd(),
    postsDir: fileConfig.postsDir || 'src/posts',
    port: Number(process.env.PORT) || fileConfig.port || 3001,
  }
}

export const config = loadConfig()