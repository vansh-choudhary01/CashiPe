import mongoose from 'mongoose'
import { ENV } from './env'

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return
  mongoose.connection.on('connected', () => console.log('MongoDB connected'))
  mongoose.connection.on('error', (err) => console.error('MongoDB error', err))
  await mongoose.connect(ENV.MONGODB_URI)
}
