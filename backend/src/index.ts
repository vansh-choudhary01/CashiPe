import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { ENV } from './config/env'
import { connectMongo } from './config/db'
import authRouter from './routes/auth'
import catalogRouter from './routes/catalog'
import quoteRouter from './routes/quote'
import ordersRouter from './routes/orders'
import paymentsRouter from './routes/payments'
import pickupRouter from './routes/pickup'
import membershipRouter from './routes/membership'
import reviewsRouter from './routes/reviews'
import accessoriesRouter from './routes/accessories'
import pricingRouter from './routes/pricing'
import promosRouter from './routes/promos'

const app = express()

// Security & parsers
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

// Basic rate limit
const limiter = rateLimit({ windowMs: 60_000, max: 120 })
app.use(limiter)


// Health route
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'cashpe-api', time: new Date().toISOString() })
})

// Routes
app.use('/auth', authRouter)
app.use('/catalog', catalogRouter)
app.use('/quotes', quoteRouter)
app.use('/orders', ordersRouter)
app.use('/payments', paymentsRouter)
app.use('/pickup', pickupRouter)
app.use('/membership', membershipRouter)
app.use('/reviews', reviewsRouter)
app.use('/accessories', accessoriesRouter)
app.use('/pricing', pricingRouter)
app.use('/promos', promosRouter)
// TODO: mount routes (orders, pickup, payments, accessories, membership, reviews, admin)

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  await connectMongo()
  app.listen(ENV.PORT, () => {
    console.log(`API listening on http://localhost:${ENV.PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
