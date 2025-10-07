import type { NextApiRequest, NextApiResponse } from 'next'
import Razorpay from 'razorpay'

/**
 * API route for creating a Razorpay order. The amount provided in the request body
 * should be in rupees. Razorpay requires the amount in paise, so it's multiplied by 100.
 *
 * Expects a JSON body: { amount: number }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { amount } = req.body as { amount: number }
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })
    return res.status(200).json(order)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create order' })
  }
}