import { Router } from 'express'
import * as categoryService from '../services/category.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(categoryService.listCategories())
})

router.put('/:name', (req, res) => {
  try {
    categoryService.renameCategory(req.params.name, req.body.name)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

router.delete('/:name', (req, res) => {
  try {
    categoryService.deleteCategory(req.params.name)
    res.status(204).send()
  } catch (err) {
    res.status(400).json({ error: 'BAD_REQUEST', message: String(err) })
  }
})

export default router
