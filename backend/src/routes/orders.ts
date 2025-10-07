import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Order } from '../models/Order'

const router = Router()

const createSellOrderSchema = z.object({
  category: z.string(),
  brand: z.string(),
  model: z.string(),
  storage: z.string(),
  condition: z.string(),
  price: z.number().positive(),
  address: z.string().min(6),
})



router.post('/sell', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSellOrderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const o = await Order.create({ type: 'sell', userId: req.user!.id, status: 'created', ...parsed.data })
  res.json({ order: o })
})

const scheduleSchema = z.object({
  orderId: z.string(),
  pickupAt: z.string(), // ISO datetime
  address: z.string().min(6),
})

router.post('/schedule', requireAuth, async (req: AuthRequest, res) => {
  const parsed = scheduleSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { orderId, pickupAt, address } = parsed.data
  const order = await Order.findOne({ _id: orderId, userId: req.user!.id })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  order.pickupAt = pickupAt
  order.address = address
  order.status = 'scheduled'
  await order.save()
  res.json({ order })
})

router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const orders = await Order.find({ userId: req.user!.id }).sort({ createdAt: -1 })
  res.json({ orders })
})

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user!.id })
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json({ order })
})

export default router
