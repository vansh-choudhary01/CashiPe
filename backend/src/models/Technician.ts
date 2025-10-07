import mongoose, { Schema, Document } from 'mongoose'

export interface ITechnician extends Document {
  name: string
  phone: string
  serviceAreas: string[]
  active: boolean
}

const TechnicianSchema = new Schema<ITechnician>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  serviceAreas: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const Technician = mongoose.models.Technician || mongoose.model<ITechnician>('Technician', TechnicianSchema)
