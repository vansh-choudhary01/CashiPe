import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { User } from '../models/User'

const router = Router()

router.get('/status', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id)
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({ membershipTier: user.membershipTier || 'none' })
})

const enrollSchema = z.object({ tier: z.enum(['gold']) })

router.post('/enroll', requireAuth, async (req: AuthRequest, res) => {
  const parsed = enrollSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const user = await User.findByIdAndUpdate(req.user!.id, { membershipTier: parsed.data.tier }, { new: true })
  res.json({ membershipTier: user?.membershipTier || 'none' })
})

export default router
