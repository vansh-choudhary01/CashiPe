import { Router } from 'express'
import { z } from 'zod'
import { Promo } from '../models/Promo'

const router = Router()

const checkSchema = z.object({ code: z.string().min(1), amount: z.number().optional() })

router.post('/check', async (req, res) => {
  const parsed = checkSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { code } = parsed.data
  const promo = await Promo.findOne({ code: code.trim().toUpperCase(), active: true })
  if (!promo) return res.status(404).json({ valid: false, message: 'Invalid or expired promo code' })
  // Basic expiry/min order checking
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return res.status(404).json({ valid: false, message: 'Promo expired' })
  res.json({ valid: true, promo: { code: promo.code, type: promo.type, amount: promo.amount, minOrderValue: promo.minOrderValue } })
})

// Admin endpoints (no auth in this simple demo; add requireAuth + roles for prod)
const createSchema = z.object({ code: z.string().min(1), type: z.enum(['percent','fixed']), amount: z.number().nonnegative(), minOrderValue: z.number().optional(), expiresAt: z.string().optional() })

router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  const p = await Promo.create({ code: data.code.trim().toUpperCase(), type: data.type, amount: data.amount, minOrderValue: data.minOrderValue, expiresAt: data.expiresAt })
  res.json({ promo: p })
})

router.get('/', async (_req, res) => {
  const list = await Promo.find().sort({ createdAt: -1 })
  res.json({ promos: list })
})

router.put('/:id', async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const p = await Promo.findByIdAndUpdate(req.params.id, { $set: parsed.data }, { new: true })
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ promo: p })
})

router.delete('/:id', async (req, res) => {
  const p = await Promo.findByIdAndDelete(req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
