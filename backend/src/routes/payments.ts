import { Router } from 'express'
import { z } from 'zod'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { ENV } from '../config/env'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Order } from '../models/Order'

const router = Router()

// ----- Razorpay -----
const itemSchema = z.object({ id: z.string(), name: z.string(), price: z.number().nonnegative(), quantity: z.number().int().positive() })
const createOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  items: z.array(itemSchema).min(1),
})

router.post('/razorpay/order', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    //uncomment after debug
  // const instance = new Razorpay({ key_id: ENV.RAZORPAY_KEY_ID, key_secret: ENV.RAZORPAY_KEY_SECRET })
  // const rzpOrder = await instance.orders.create({ amount: Math.round(parsed.data.amount * 100), currency: parsed.data.currency, receipt: parsed.data.receipt })
  const rzpOrder = {
    id: 'test-order-id',
    amount: Math.round(parsed.data.amount * 100),
    currency: parsed.data.currency,
    receipt: parsed.data.receipt,
  }
  // Persist purchase order with items and payment metadata
  const dbOrder = await Order.create({
    type: 'purchase',
    userId: req.user!.id,
    status: 'created',
    items: parsed.data.items,
    price: parsed.data.amount,
    payment: {
      provider: 'razorpay',
      orderId: rzpOrder.id,
      status: 'created',
    },
  })

  res.json({ order: rzpOrder, dbOrder })
})

const verifySchema = z.object({ order_id: z.string(), payment_id: z.string(), signature: z.string() })

router.post('/razorpay/verify', async (req, res) => {
  const parsed = verifySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { order_id, payment_id, signature } = parsed.data
  const body = `${order_id}|${payment_id}`
  const expected = crypto.createHmac('sha256', ENV.RAZORPAY_KEY_SECRET).update(body).digest('hex')
  const valid = expected === signature

  if (valid) {
    // Mark order as paid/verified
    await Order.findOneAndUpdate(
      { 'payment.orderId': order_id },
      {
        $set: {
          status: 'paid',
          'payment.paymentId': payment_id,
          'payment.signature': signature,
          'payment.status': 'verified',
        },
        $push: { timeline: { status: 'paid', at: new Date().toISOString(), note: 'Payment verified via Razorpay' } },
      },
    )
  }

  res.json({ valid })
})

// Save payout method for an order
const payoutSchema = z.object({
  orderId: z.string(),
  payout: z.object({
    method: z.enum(['upi', 'bank', 'wallet']),
    upi: z.string().optional(),
    bank: z
      .object({ ifsc: z.string(), account: z.string(), name: z.string() })
      .optional(),
  }),
})

router.post('/payout-method', requireAuth, async (req: AuthRequest, res) => {
  const parsed = payoutSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { orderId, payout } = parsed.data
  const order = await Order.findOne({ _id: orderId, userId: req.user!.id })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  order.payout = payout as any
  await order.save()
  res.json({ order })
})

// ----- Paytm Stubs -----
// Note: Implement production-grade checksums using Paytm's SDK when keys are available.
const paytmInitSchema = z.object({ amount: z.number().positive(), orderId: z.string(), customerId: z.string() })

router.post('/paytm/init', async (req, res) => {
  const parsed = paytmInitSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  // Return minimal payload to proceed on client. Integrate official SDK for prod.
  res.json({
    txnToken: 'stub-token',
    orderId: parsed.data.orderId,
    amount: parsed.data.amount,
    mid: process.env.PAYTM_MID,
    callbackUrl: process.env.PAYTM_CALLBACK_URL,
  })
})

router.post('/paytm/callback', async (_req, res) => {
  // Verify checksum, update payment/order status accordingly
  res.json({ received: true })
})

export default router
