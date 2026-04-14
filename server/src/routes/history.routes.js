import express from 'express'
import { authenticateJWT } from '../middleware/auth.middleware.js'
import { prisma } from '../app.js'

const router = express.Router()

// GET /api/history — last 50 played songs
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const history = await prisma.playHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 50
    })
    res.json(history)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/history — log play
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { youtubeId, title, artist, thumbnail } = req.body
    if (!youtubeId) return res.status(400).json({ error: 'youtubeId required' })

    const entry = await prisma.playHistory.create({
      data: {
        userId: req.user.id,
        youtubeId,
        title: title || 'Unknown',
        artist: artist || 'Unknown',
        thumbnail: thumbnail || ''
      }
    })
    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/history — clear all history
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    await prisma.playHistory.deleteMany({ where: { userId: req.user.id } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
