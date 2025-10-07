import dotenv from 'dotenv'

dotenv.config()

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cashpe',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
}
