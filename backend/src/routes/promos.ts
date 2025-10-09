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

export default router
