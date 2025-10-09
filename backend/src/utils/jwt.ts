import jwt, { SignOptions } from 'jsonwebtoken'
import { ENV } from '../config/env'

export function signJwt(payload: object, expiresIn = '7d') {
  const opts: SignOptions = { expiresIn: expiresIn as any }
  return jwt.sign(payload as any, ENV.JWT_SECRET as string, opts)
}
