import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Address } from '../models/Address'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const list = await Address.find({ userId: req.user!.id }).sort({ createdAt: -1 })
  res.json({ addresses: list })
})

const createSchema = z.object({ label: z.string().optional(), address1: z.string().min(3), address2: z.string().optional(), city: z.string().min(2), pin: z.string().min(3), phone: z.string().optional(), isDefault: z.boolean().optional() })

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  if (data.isDefault) {
    await Address.updateMany({ userId: req.user!.id }, { isDefault: false })
  }
  const a = await Address.create({ userId: req.user!.id, ...data })
  res.json({ address: a })
})

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const a = await Address.findOne({ _id: req.params.id, userId: req.user!.id })
  if (!a) return res.status(404).json({ error: 'Not found' })
  if (parsed.data.isDefault) await Address.updateMany({ userId: req.user!.id }, { isDefault: false })
  Object.assign(a, parsed.data)
  await a.save()
  res.json({ address: a })
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const a = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user!.id })
  if (!a) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
