import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import postsRouter from './routes/posts.js'
import tagsRouter from './routes/tags.js'
import categoriesRouter from './routes/categories.js'
import imagesRouter from './routes/images.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // API routes
  app.use('/api/posts', postsRouter)
  app.use('/api/tags', tagsRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/images/:slug', imagesRouter)

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', blogRoot: config.blogRoot })
  })

  // Serve static frontend in production
  const clientDist = path.resolve(__dirname, '../../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })

  return app
}

// Start server when run directly
const isMainModule = process.argv[1]?.includes('index')
if (isMainModule) {
  const app = createApp()
  app.listen(config.port, () => {
    console.log(`Blog Admin running on http://localhost:${config.port}`)
    console.log(`Blog root: ${config.blogRoot}`)
  })
}