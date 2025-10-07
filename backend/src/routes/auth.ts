import { Router } from 'express'
import { z } from 'zod'
import { User } from '../models/User'
import { hashPassword, comparePassword } from '../utils/password'
import { signJwt } from '../utils/jwt'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password, name } = parsed.data
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already registered' })
  const passwordHash = await hashPassword(password)
  const user = await User.create({ email, passwordHash, name })
  const token = signJwt({ id: user.id })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password } = parsed.data
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await comparePassword(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = signJwt({ id: user.id })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).select('-passwordHash')
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({ user })
})

router.post('/logout', requireAuth, async (_req, res) => {
  // Stateless JWT logout: client should discard token
  res.json({ ok: true })
})

export default router
