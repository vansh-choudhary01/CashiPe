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

const createSellBatchSchema = z.object({
  items: z.array(z.object({ category: z.string(), brand: z.string(), model: z.string(), storage: z.string(), condition: z.string(), price: z.number().positive() })).min(1),
  address: z.string().min(6),
})



router.post('/sell', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSellOrderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const o = await Order.create({
    type: 'sell',
    userId: req.user!.id,
    status: 'created',
    ...parsed.data,
    timeline: [{ status: 'created', at: new Date().toISOString(), note: 'Order created' }],
  })
  res.json({ order: o })
})

router.post('/sell-batch', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSellBatchSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { items, address } = parsed.data
  const order = await Order.create({
    type: 'sell',
    userId: req.user!.id,
    status: 'created',
    items,
    address,
    price: items.reduce((s: number, it: any) => s + Number(it.price || 0), 0),
    timeline: [{ status: 'created', at: new Date().toISOString(), note: 'Batch sell order created' }],
  })
  res.json({ order })
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
  order.timeline = [
    ...(order.timeline || []),
    { status: 'scheduled', at: new Date().toISOString(), note: `Pickup at ${pickupAt}` },
  ]
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

// Timeline retrieval
router.get('/:id/timeline', requireAuth, async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user!.id })
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json({ timeline: order.timeline || [] })
})

// Create invoice document (stub URL)
router.post('/:id/invoice', requireAuth, async (req: AuthRequest, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user!.id })
  if (!order) return res.status(404).json({ error: 'Not found' })
  // Generate a simple invoice as a text blob and store as data URL (demo only)
  const invoiceText = []
  invoiceText.push('CashiPe - Invoice')
  invoiceText.push('===================')
  invoiceText.push(`Order ID: ${order._id || order.id}`)
  invoiceText.push(`Type: ${order.type}`)
  if (order.items && order.items.length) {
    invoiceText.push('Items:')
    for (const it of order.items) invoiceText.push(` - ${it.name} x${it.quantity} @ ${it.price}`)
  } else {
    invoiceText.push(`${order.brand || ''} ${order.model || ''} ${order.storage || ''}`)
  }
  invoiceText.push(`Amount: ₹ ${Number(order.price || 0).toLocaleString('en-IN')}`)
  invoiceText.push(`Created: ${new Date(order.createdAt || Date.now()).toLocaleString()}`)
  const text = invoiceText.join('\n')
  const b64 = Buffer.from(text).toString('base64')
  const url = `data:text/plain;base64,${b64}`
  const doc = { type: 'invoice' as const, url, createdAt: new Date().toISOString() }
  order.documents = [...(order.documents || []), doc]
  await order.save()
  res.json({ document: doc })
})

export default router
