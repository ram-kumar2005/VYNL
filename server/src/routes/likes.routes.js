import express from 'express'
import { authenticateJWT } from '../middleware/auth.middleware.js'
import { prisma } from '../app.js'

const router = express.Router()

// GET /api/likes — all liked songs newest first
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const likes = await prisma.like.findMany({
      where: { userId: req.user.id },
      orderBy: { likedAt: 'desc' }
    })
    res.json(likes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/likes/:youtubeId — toggle like
router.post('/:youtubeId', authenticateJWT, async (req, res) => {
  try {
    const { youtubeId } = req.params
    const { title, artist, thumbnail, duration } = req.body

    const existing = await prisma.like.findUnique({
      where: { userId_youtubeId: { userId: req.user.id, youtubeId } }
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      res.json({ liked: false })
    } else {
      await prisma.like.create({
        data: { userId: req.user.id, youtubeId, title, artist, thumbnail, duration: duration || '0:00' }
      })
      res.json({ liked: true })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/likes/check/:youtubeId — check if liked
router.get('/check/:youtubeId', authenticateJWT, async (req, res) => {
  try {
    const like = await prisma.like.findUnique({
      where: { userId_youtubeId: { userId: req.user.id, youtubeId: req.params.youtubeId } }
    })
    res.json({ liked: !!like })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
