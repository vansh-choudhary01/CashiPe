import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Review } from '../models/Review'

const router = Router()

const createSchema = z.object({
  orderId: z.string().optional(),
  targetType: z.enum(['technician','device','order']),
  targetId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const review = await Review.create({ ...parsed.data, userId: req.user!.id })
  res.json({ review })
})

router.get('/list', async (req, res) => {
  const targetType = req.query.targetType as string
  const targetId = req.query.targetId as string
  const filter: any = {}
  if (targetType) filter.targetType = targetType
  if (targetId) filter.targetId = targetId
  const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(100)
  res.json({ reviews })
})

export default router
