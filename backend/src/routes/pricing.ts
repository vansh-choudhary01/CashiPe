import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const quoteSchema = z.object({
  category: z.string(),
  brand: z.string(),
  model: z.string(),
  storage: z.string().optional(),
  ageMonths: z.number().int().nonnegative().default(0),
  promoCode: z.string().optional(),
  condition: z.object({
    screenCracks: z.boolean().default(false),
    bodyDents: z.boolean().default(false),
    batteryHealth: z.number().min(0).max(100).default(90),
    cameraIssue: z.boolean().default(false),
    faceIdIssue: z.boolean().default(false),
  }).default({}),
  accessories: z.object({
    box: z.boolean().default(false),
    charger: z.boolean().default(false),
    earphones: z.boolean().default(false),
  }).default({}),
})

router.post('/quote', async (req, res) => {
  const parsed = quoteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { brand, model, storage, ageMonths, condition, accessories, promoCode } = parsed.data

  // Base price heuristic (stub) – replace with DB-based model pricing
  let base = 10000
  if (brand.toLowerCase().includes('apple')) base += 15000
  if (brand.toLowerCase().includes('samsung')) base += 8000
  if (storage) {
    const n = parseInt(storage.replace(/\D/g, ''), 10)
    if (!Number.isNaN(n)) base += Math.min(5000, Math.floor(n / 64) * 1500)
  }

  // Age depreciation applied to base
  const depreciationRate = Math.min(0.6, (ageMonths / 12) * 0.15)
  const depreciated = Math.round(base * (1 - depreciationRate))

  // Condition deductions
  let deductions = 0
  if (condition.screenCracks) deductions += 3000
  if (condition.bodyDents) deductions += 1000
  if (condition.cameraIssue) deductions += 800
  if (condition.faceIdIssue) deductions += 2000
  if (condition.batteryHealth < 80) deductions += Math.round((80 - condition.batteryHealth) * 30)

  // Accessory bonuses
  let bonuses = 0
  if (accessories.box) bonuses += 300
  if (accessories.charger) bonuses += 500
  if (accessories.earphones) bonuses += 200

  const prePromoTotal = Math.max(500, depreciated - deductions + bonuses)

  // Promo lookup and application
  let promo: any = null
  let promoDiscount = 0
  if (promoCode) {
    try {
      const Promo = (await import('../models/Promo')).Promo
      promo = await Promo.findOne({ code: promoCode.trim().toUpperCase(), active: true })
      if (promo) {
        if (promo.type === 'percent') promoDiscount = Math.round(prePromoTotal * (promo.amount / 100))
        else promoDiscount = Math.round(promo.amount)
      }
    } catch (e) {
      // log and continue without promo
      console.error('Promo lookup failed', e)
    }
  }

  const total = Math.max(0, prePromoTotal - promoDiscount)

  res.json({
    breakdown: {
      base,
      depreciated,
      depreciationAmount: Math.round(base * depreciationRate),
      deductions,
      bonuses,
      prePromoTotal,
      promo: promo ? { code: promo.code, type: promo.type, amount: promo.amount, discount: promoDiscount } : null,
    },
    total,
    summary: `${brand} ${model}${storage ? ' ' + storage : ''}`,
  })
})

export default router
 
// Identify device by IMEI/serial (stubbed heuristics)
router.post('/identify', (req, res) => {
  const imei = String((req.body?.imei || req.body?.serial || '') as string).trim()
  if (!imei) return res.status(400).json({ error: 'imei or serial required' })
  // Very naive stub: if starts with 35 => iPhone, 86 => Android Samsung, else generic
  let brand = 'Generic'
  let model = 'Device'
  if (/^35/.test(imei)) { brand = 'Apple'; model = 'iPhone'; }
  else if (/^86/.test(imei)) { brand = 'Samsung'; model = 'Galaxy'; }
  res.json({ brand, model })
})
