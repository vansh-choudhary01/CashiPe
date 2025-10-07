import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ENV } from '../config/env'

export interface AuthRequest extends Request {
  user?: { id: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { id: string }
    req.user = { id: payload.id }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
