import express from 'express'
import { authenticateJWT } from '../middleware/auth.middleware.js'
import { prisma } from '../app.js'

const router = express.Router()

// GET /api/playlists — get all user playlists with song count
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { songs: true } } },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(playlists.map(p => ({
      ...p,
      songCount: p._count.songs
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/playlists — create playlist
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, description, isPublic = false } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const playlist = await prisma.playlist.create({
      data: { name, description, isPublic, userId: req.user.id }
    })
    res.status(201).json(playlist)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/playlists/:id — get playlist with all songs
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { songs: { orderBy: { addedAt: 'asc' } }, user: true }
    })
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })
    res.json(playlist)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/playlists/:id — update playlist
router.patch('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body
    const playlist = await prisma.playlist.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { name, description, isPublic }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/playlists/:id — delete playlist
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    await prisma.playlist.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/playlists/:id/songs — add song
router.post('/:id/songs', authenticateJWT, async (req, res) => {
  try {
    const { youtubeId, title, artist, thumbnail, duration } = req.body
    // Verify playlist ownership
    const playlist = await prisma.playlist.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })

    const song = await prisma.playlistSong.upsert({
      where: { playlistId_youtubeId: { playlistId: req.params.id, youtubeId } },
      update: {},
      create: { playlistId: req.params.id, youtubeId, title, artist, thumbnail, duration }
    })
    res.status(201).json(song)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/playlists/:id/songs/:youtubeId — remove song
router.delete('/:id/songs/:youtubeId', authenticateJWT, async (req, res) => {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })

    await prisma.playlistSong.deleteMany({
      where: { playlistId: req.params.id, youtubeId: req.params.youtubeId }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
