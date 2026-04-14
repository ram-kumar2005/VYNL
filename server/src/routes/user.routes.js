import express from 'express'
import { authenticateJWT } from '../middleware/auth.middleware.js'
import { prisma } from '../app.js'

const router = express.Router()

// GET /api/user/profile — user info + counts
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const [likesCount, playlistsCount, historyCount] = await Promise.all([
      prisma.like.count({ where: { userId: req.user.id } }),
      prisma.playlist.count({ where: { userId: req.user.id } }),
      prisma.playHistory.count({ where: { userId: req.user.id } })
    ])

    res.json({
      user: req.user,
      stats: {
        likesCount,
        playlistsCount,
        historyCount,
        minutesListened: Math.floor(historyCount * 3.5) // estimation ~3.5 min avg
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/user/stats — top 5 most played songs
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const history = await prisma.playHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 200
    })

    // Aggregate by youtubeId
    const countMap = {}
    history.forEach(entry => {
      if (!countMap[entry.youtubeId]) {
        countMap[entry.youtubeId] = { ...entry, playCount: 0 }
      }
      countMap[entry.youtubeId].playCount++
    })

    const topSongs = Object.values(countMap)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5)

    res.json(topSongs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
