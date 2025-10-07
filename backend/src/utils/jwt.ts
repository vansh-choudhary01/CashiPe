import jwt from 'jsonwebtoken'
import { ENV } from '../config/env'

export function signJwt(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn })
}
