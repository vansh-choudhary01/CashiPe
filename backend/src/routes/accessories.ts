import { Router } from 'express'
import { z } from 'zod'
import { Accessory } from '../models/Accessory'

const router = Router()

router.get('/', async (_req, res) => {
  const items = await Accessory.find({ active: true }).sort({ createdAt: -1 })
  res.json({ items })
})

router.get('/:id', async (req, res) => {
  const item = await Accessory.findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json({ item })
})

// Simple cart endpoints for demo (stateless tokens can be added later)
const cartSchema = z.object({ id: z.string(), quantity: z.number().min(1).max(10) })

router.post('/cart/add', async (req, res) => {
  const parsed = cartSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const product = await Accessory.findById(parsed.data.id)
  if (!product || !product.active) return res.status(404).json({ error: 'Product not found' })
  res.json({ ok: true })
})

export default router
