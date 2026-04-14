import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import api from '../../utils/api.js'
import toast from 'react-hot-toast'

export default function AddToPlaylistModal({ song, onClose }) {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/playlists').then(r => {
      setPlaylists(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addSong = async (playlistId) => {
    try {
      await api.post(`/api/playlists/${playlistId}/songs`, {
        youtubeId: song.youtubeId,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration || '0:00'
      })
      toast.success('Added to playlist!')
      onClose()
    } catch {
      toast.error('Already in playlist or failed to add')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-surface2 rounded-2xl w-full max-w-sm p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Add to Playlist</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-white/50 mb-4 truncate">"{song.title}"</p>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="shimmer h-12 rounded-lg" />)}
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-center text-white/40 py-4">No playlists yet. Create one first!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => addSong(pl.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {pl.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{pl.name}</p>
                    <p className="text-xs text-white/40">{pl.songCount || 0} songs</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
