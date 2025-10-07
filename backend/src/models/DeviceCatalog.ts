import mongoose, { Schema, Document } from 'mongoose'

export interface IDeviceCatalog extends Document {
  category: string // phone, laptop, tablet, etc.
  brand: string
  model: string
  basePrice: number
  storageOptions: string[]
  conditions: string[]
  grade?: 'Fair' | 'Good' | 'Superb'
}

const DeviceCatalogSchema = new Schema<IDeviceCatalog>({
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  model: { type: String, required: true, index: true },
  basePrice: { type: Number, required: true },
  storageOptions: { type: [String], default: ['64 GB', '128 GB', '256 GB', '512 GB'] },
  conditions: { type: [String], default: ['Like New', 'Good', 'Fair', 'Needs Repair'] },
  grade: { type: String, enum: ['Fair', 'Good', 'Superb'] },
}, { timestamps: true })

DeviceCatalogSchema.index({ category: 1, brand: 1, model: 1 }, { unique: true })

export const DeviceCatalog = mongoose.models.DeviceCatalog || mongoose.model<IDeviceCatalog>('DeviceCatalog', DeviceCatalogSchema)
