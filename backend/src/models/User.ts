import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash: string
  name?: string
  phone?: string
  kyc?: {
    pan?: string
    license?: string
  }
  membershipTier?: 'none' | 'gold'
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: String,
  phone: String,
  kyc: {
    pan: String,
    license: String,
  },
  membershipTier: { type: String, enum: ['none', 'gold'], default: 'none' },
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
