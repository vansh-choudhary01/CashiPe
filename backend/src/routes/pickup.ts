import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Order } from '../models/Order'

const router = Router()

router.get('/slots', async (_req, res) => {
  // Static demo slots; replace with real scheduling/geo logic
  const now = new Date()
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)
  const slots: string[] = []
  for (let d = 0; d < 7; d++) {
    for (const hour of [9, 11, 13, 15, 17]) {
      const dt = new Date(base)
      dt.setDate(dt.getDate() + d)
      dt.setHours(hour)
      slots.push(dt.toISOString())
    }
  }
  res.json({ slots })
})

const scheduleSchema = z.object({ orderId: z.string(), pickupAt: z.string().datetime() })

router.post('/schedule', requireAuth, async (req: AuthRequest, res) => {
  const parsed = scheduleSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { orderId, pickupAt } = parsed.data
  const order = await Order.findOne({ _id: orderId, userId: req.user!.id })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  order.pickupAt = pickupAt
  order.status = 'scheduled'
  await order.save()
  res.json({ order })
})

export default router
