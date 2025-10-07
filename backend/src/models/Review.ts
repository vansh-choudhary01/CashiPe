import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  userId?: string
  orderId?: string
  targetType: 'technician' | 'device' | 'order'
  targetId: string
  rating: number // 1-5
  comment?: string
}

const ReviewSchema = new Schema<IReview>({
  userId: String,
  orderId: String,
  targetType: { type: String, enum: ['technician', 'device', 'order'], required: true },
  targetId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
}, { timestamps: true })

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
