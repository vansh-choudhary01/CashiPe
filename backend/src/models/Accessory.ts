import mongoose, { Schema, Document } from 'mongoose'

export interface IAccessory extends Document {
  name: string
  description?: string
  price: number
  inventory: number
  media?: string[]
  active: boolean
}

const AccessorySchema = new Schema<IAccessory>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  inventory: { type: Number, default: 0 },
  media: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const Accessory = mongoose.models.Accessory || mongoose.model<IAccessory>('Accessory', AccessorySchema)
