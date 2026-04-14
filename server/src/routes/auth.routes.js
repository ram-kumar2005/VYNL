import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { authenticateJWT } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET || 'vynl_super_secret_jwt_key',
      { expiresIn: '7d' }
    )
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie('vynl_token', token, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // Vercel (frontend) <-> Render (API) is cross-site in prod.
      sameSite: isProduction ? 'none' : 'lax'
    })
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const redirectUrl = new URL('/login', clientUrl)
    // Fallback for browsers that block third-party cookies (e.g. Safari).
    redirectUrl.searchParams.set('token', token)
    res.redirect(redirectUrl.toString())
  }
)

router.get('/me', authenticateJWT, (req, res) => {
  res.json({ user: req.user })
})

router.post('/logout', (req, res) => {
  res.clearCookie('vynl_token')
  res.json({ message: 'Logged out successfully' })
})

export default router
