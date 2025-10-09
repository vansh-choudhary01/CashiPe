import mongoose, { Schema } from 'mongoose'

export interface IAddress {
  userId: string
  label?: string
  address1: string
  address2?: string
  city: string
  pin: string
  phone?: string
  isDefault?: boolean
}

const AddressSchema = new Schema<IAddress>({
  userId: { type: String, required: true, index: true },
  label: String,
  address1: { type: String, required: true },
  address2: String,
  city: { type: String, required: true },
  pin: { type: String, required: true },
  phone: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true })

export const Address = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema)
