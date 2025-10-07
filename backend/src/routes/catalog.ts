import { Router } from 'express'
import { z } from 'zod'
import { DeviceCatalog } from '../models/DeviceCatalog'

const router = Router()

router.get('/categories', async (_req, res) => {
  const cats = await DeviceCatalog.distinct('category')
  res.json({ categories: cats })
})

router.get('/brands', async (req, res) => {
  const cat = req.query.category as string | undefined
  const filter: any = {}
  if (cat) filter.category = cat
  const brands = await DeviceCatalog.distinct('brand', filter)
  res.json({ brands })
})

router.get('/models', async (req, res) => {
  const category = req.query.category as string
  const brand = req.query.brand as string
  if (!category || !brand) return res.status(400).json({ error: 'category and brand required' })
  const models = await DeviceCatalog.find({ category, brand }).select('model basePrice storageOptions conditions grade')
  res.json({ models })
})

router.get('/search', async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim()
  if (!q) return res.json({ results: [] })
  const regex = new RegExp(q, 'i')
  const results = await DeviceCatalog.find({ $or: [{ brand: regex }, { model: regex }, { category: regex }] }).limit(50)
  res.json({ results })
})

export default router
