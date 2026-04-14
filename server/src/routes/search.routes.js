import express from 'express'
import { searchSongs, getTrending, getRelated } from '../services/youtube.service.js'

const router = express.Router()

// GET /api/search?q=&lang=
router.get('/', async (req, res) => {
  try {
    const { q = '', lang = 'all', limit = 20 } = req.query
    if (!q.trim()) return res.json([])
    const results = await searchSongs(q, lang, parseInt(limit))
    res.json(results)
  } catch (err) {
    console.error('Search error:', err.message)
    res.status(500).json({ error: 'Search failed', details: err.message })
  }
})

// GET /api/search/trending?lang=
router.get('/trending', async (req, res) => {
  try {
    const { lang = 'tamil' } = req.query
    const results = await getTrending(lang)
    res.json(results)
  } catch (err) {
    console.error('Trending error:', err.message)
    res.status(500).json({ error: 'Trending fetch failed', details: err.message })
  }
})

// GET /api/search/related/:youtubeId
router.get('/related/:youtubeId', async (req, res) => {
  try {
    const results = await getRelated(req.params.youtubeId)
    res.json(results)
  } catch (err) {
    console.error('Related error:', err.message)
    res.status(500).json({ error: 'Related fetch failed' })
  }
})

export default router
