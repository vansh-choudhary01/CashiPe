import { Router } from 'express'
import { z } from 'zod'
import { DeviceCatalog } from '../models/DeviceCatalog'
import { Quote } from '../models/Quote'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const quoteSchema = z.object({
  category: z.string(),
  brand: z.string(),
  model: z.string(),
  storage: z.string(),
  condition: z.string(),
  questionnaire: z.record(z.any()).optional(),
})

// Simple rule engine + placeholder for AI market adjustment
function computePrice(base: number, condition: string, storage: string, questionnaire?: Record<string, any>) {
  const storageFactor: Record<string, number> = {
    '64 GB': 1,
    '128 GB': 1.08,
    '256 GB': 1.16,
    '512 GB': 1.25,
  }
  const conditionFactor: Record<string, number> = {
    'Like New': 1,
    'Good': 0.9,
    'Fair': 0.78,
    'Needs Repair': 0.5,
  }
  let price = base * (storageFactor[storage] || 1) * (conditionFactor[condition] || 1)
  // Questionnaire penalties (scratches/dents/battery cycles etc.)
  if (questionnaire) {
    if (questionnaire.scratches === 'many') price *= 0.93
    if (questionnaire.dents === 'yes') price *= 0.95
    if (questionnaire.batteryHealth && Number(questionnaire.batteryHealth) < 80) price *= 0.9
  }
  // Placeholder market trend factor (to be replaced by AI model/API)
  const marketTrendFactor = 1.0
  price *= marketTrendFactor
  return Math.round(price)
}

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = quoteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { category, brand, model, storage, condition, questionnaire } = parsed.data
  const device = await DeviceCatalog.findOne({ category, brand, model })
  if (!device) return res.status(404).json({ error: 'Device not found' })
  const basePrice = device.basePrice
  const final = computePrice(basePrice, condition, storage, questionnaire)
  const q = await Quote.create({
    userId: req.user!.id,
    category, brand, model, storage, condition,
    questionnaire,
    basePrice,
    finalPrice: final,
  })
  res.json({ quote: q })
})

export default router
