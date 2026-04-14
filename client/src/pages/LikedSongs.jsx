import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Shuffle, Heart, Trash2, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { usePlayerStore } from '../store/playerStore.js'
import { formatTime } from '../utils/formatters.js'
import ContextMenu from '../components/common/ContextMenu.jsx'
import toast from 'react-hot-toast'

export default function LikedSongs() {
  const navigate = useNavigate()
  const { playSong, addToQueue, playNextInsert } = usePlayerStore()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState({ show: false, song: null, pos: {} })

  useEffect(() => {
    api.get('/api/likes')
      .then(r => setSongs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unlike = async (youtubeId) => {
    try {
      await api.post(`/api/likes/${youtubeId}`, {})
      setSongs(prev => prev.filter(s => s.youtubeId !== youtubeId))
      toast.success('Removed from Liked Songs')
    } catch { toast.error('Failed') }
  }

  const playAll = () => { if (songs.length) playSong(songs[0], songs) }
  const shufflePlay = () => {
    if (!songs.length) return
    const s = [...songs].sort(() => Math.random() - 0.5)
    playSong(s[0], s)
  }

  const totalSecs = songs.reduce((acc, s) => {
    const parts = s.duration.split(':').map(Number)
    return acc + (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + (parts[1] || 0))
  }, 0)

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 h-64 bg-gradient-to-b from-pink-900/60 via-red-900/30 to-transparent pointer-events-none" />
        <div className="relative p-6 pb-0">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            {/* Cover */}
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center shadow-2xl flex-shrink-0">
              <Heart size={64} fill="white" className="text-white" />
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Playlist</p>
              <h1 className="text-4xl font-extrabold text-white mb-2">Liked Songs</h1>
              <p className="text-white/40 text-sm">{songs.length} songs · {formatTime(totalSecs)}</p>
              <div className="flex items-center gap-3 mt-5">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={playAll} disabled={!songs.length}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
                >
                  <Play size={18} fill="white" /> Play All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={shufflePlay} disabled={!songs.length}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
                >
                  <Shuffle size={18} /> Shuffle
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="px-4 pb-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-xl mb-2" />
          ))
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Heart size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No liked songs yet</p>
            <p className="text-sm mt-1">Like songs while they play to see them here</p>
          </div>
        ) : (
          songs.map((song, i) => {
            const isActive = usePlayerStore.getState().currentSong?.youtubeId === song.youtubeId
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ show: true, song, pos: { x: e.clientX, y: e.clientY } })
                }}
                onClick={() => playSong(song, songs)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group hover:bg-white/5 transition-colors ${isActive ? 'bg-accent/10' : ''}`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  <span className="text-sm text-white/30 group-hover:hidden block">{i + 1}</span>
                  <Play size={14} fill="white" className="text-white hidden group-hover:block mx-auto" />
                </div>
                <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-accent' : 'text-white'}`}>{song.title}</p>
                  <p className="text-xs text-white/40 truncate">{song.artist}</p>
                </div>
                <span className="text-sm text-white/40 flex-shrink-0">{song.duration}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); unlike(song.youtubeId) }}
                  className="text-pink-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </motion.div>
            )
          })
        )}
      </div>

      {contextMenu.show && (
        <ContextMenu
          position={contextMenu.pos}
          onClose={() => setContextMenu({ show: false })}
          items={[
            { label: 'Play Now', action: () => playSong(contextMenu.song, songs) },
            { label: 'Play Next', action: () => playNextInsert(contextMenu.song) },
            { label: 'Add to Queue', action: () => addToQueue(contextMenu.song) },
            { label: 'Unlike', action: () => unlike(contextMenu.song.youtubeId), variant: 'danger' },
          ]}
        />
      )}
    </div>
  )
}
