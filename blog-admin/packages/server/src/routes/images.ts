import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { config } from '../config.js'

const router = Router({ mergeParams: true })

interface ImageParams extends Record<string, string> {
  slug: string
  file: string
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { slug } = req.params as ImageParams
    const dir = path.resolve(config.blogRoot, config.postsDir, slug, 'images')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
    cb(null, `${name}${ext}`)
  },
})

const upload = multer({ storage })

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'NO_FILE', message: 'No file uploaded' })
  }

  const { slug } = req.params as ImageParams
  const filename = req.file.filename

  res.json({
    filename,
    path: `images/${filename}`,
    url: `/api/images/${slug}/${filename}`,
  })
})

router.get('/:file', (req, res) => {
  const { slug, file } = req.params as ImageParams
  const filePath = path.resolve(
    config.blogRoot,
    config.postsDir,
    slug,
    'images',
    file,
  )

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Image not found' })
  }

  res.sendFile(filePath)
})

router.delete('/:file', (req, res) => {
  const { slug, file } = req.params as ImageParams
  const filePath = path.resolve(
    config.blogRoot,
    config.postsDir,
    slug,
    'images',
    file,
  )

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Image not found' })
  }

  fs.unlinkSync(filePath)
  res.status(204).send()
})

export default router
