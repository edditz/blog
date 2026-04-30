import { Router } from 'express'
import * as tagService from '../services/tag.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(tagService.listTags())
})

router.put('/:name', (req, res) => {
  try {
    tagService.renameTag(req.params.name, req.body.name)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.delete('/:name', (req, res) => {
  try {
    tagService.deleteTag(req.params.name)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

export default router
