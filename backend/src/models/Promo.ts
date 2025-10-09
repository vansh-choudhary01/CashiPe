import mongoose, { Schema, Document } from 'mongoose'

export interface IPromo extends Document {
  code: string
  type: 'percent' | 'fixed'
  amount: number
  active: boolean
  minOrderValue?: number
  expiresAt?: string
}

const PromoSchema = new Schema<IPromo>({
  code: { type: String, required: true, index: true, unique: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  amount: { type: Number, required: true },
  active: { type: Boolean, default: true },
  minOrderValue: Number,
  expiresAt: String,
}, { timestamps: true })

export const Promo = mongoose.models.Promo || mongoose.model<IPromo>('Promo', PromoSchema)
