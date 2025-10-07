import mongoose, { Schema, Document } from 'mongoose'

export interface IQuote extends Document {
  userId?: string
  category: string
  brand: string
  model: string
  storage: string
  condition: string
  questionnaire?: Record<string, any>
  basePrice: number
  finalPrice: number
  createdAt: Date
  updatedAt: Date
}

const QuoteSchema = new Schema<IQuote>({
  userId: { type: String },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  storage: { type: String, required: true },
  condition: { type: String, required: true },
  questionnaire: { type: Schema.Types.Mixed },
  basePrice: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
}, { timestamps: true })

export const Quote = mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema)
