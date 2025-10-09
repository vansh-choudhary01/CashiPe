import mongoose, { Schema } from 'mongoose'

export type OrderType = 'sell' | 'purchase'
export type OrderStatus = 'created' | 'scheduled' | 'picked_up' | 'inspected' | 'paid' | 'delivered' | 'cancelled'

export interface IOrder {
  type: OrderType
  userId?: string
  // Sell order fields
  category?: string
  brand?: string
  model?: string
  storage?: string
  condition?: string
  price?: number
  // Purchase order fields
  productId?: string
  quantity?: number
  items?: { id: string; name: string; price: number; quantity: number }[]
  payment?: {
    provider: 'razorpay'
    orderId?: string
    paymentId?: string
    signature?: string
    status?: 'created' | 'verified'
  }
  timeline?: { status: string; at: string; note?: string }[]
  documents?: { type: 'invoice'; url: string; createdAt: string }[]
  payout?: { method: 'upi' | 'bank' | 'wallet'; upi?: string; bank?: { ifsc: string; account: string; name: string } }
  // Shared
  status: OrderStatus
  pickupAt?: string
  address?: string
}

const OrderSchema = new Schema<IOrder>({
  type: { type: String, enum: ['sell', 'purchase'], required: true },
  userId: String,
  category: String,
  brand: String,
  model: String,
  storage: String,
  condition: String,
  price: Number,
  productId: String,
  quantity: { type: Number, default: 1 },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  payment: {
    provider: { type: String, enum: ['razorpay'], default: 'razorpay' },
    orderId: String,
    paymentId: String,
    signature: String,
    status: { type: String, enum: ['created', 'verified'], default: 'created' },
  },
  timeline: [
    {
      status: String,
      at: String,
      note: String,
    },
  ],
  documents: [
    {
      type: { type: String, enum: ['invoice'] },
      url: String,
      createdAt: String,
    },
  ],
  payout: {
    method: { type: String, enum: ['upi', 'bank', 'wallet'] },
    upi: String,
    bank: {
      ifsc: String,
      account: String,
      name: String,
    },
  },
  status: { type: String, enum: ['created','scheduled','picked_up','inspected','paid','delivered','cancelled'], default: 'created' },
  pickupAt: String,
  address: String,
}, { timestamps: true })

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

