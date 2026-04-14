import jwt from 'jsonwebtoken'
import { prisma } from '../app.js'

export async function authenticateJWT(req, res, next) {
  const token = req.cookies?.vynl_token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vynl_super_secret_jwt_key')
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
