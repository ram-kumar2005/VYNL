import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play, Shuffle, Plus, Trash2, MoreHorizontal, Clock,
  ChevronLeft, Music
} from 'lucide-react'
import api from '../utils/api.js'
import { usePlayerStore } from '../store/playerStore.js'
import { useAuthStore } from '../store/authStore.js'
import { formatTime } from '../utils/formatters.js'
import ContextMenu from '../components/common/ContextMenu.jsx'
import toast from 'react-hot-toast'

export default function PlaylistPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playSong, addToQueue, playNextInsert } = usePlayerStore()
  const { user } = useAuthStore()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState({ show: false, song: null, pos: {} })

  const fetchPlaylist = async () => {
    try {
      const res = await api.get(`/api/playlists/${id}`)
      setPlaylist(res.data)
    } catch {
      toast.error('Playlist not found')
      navigate('/library')
    }
    setLoading(false)
  }

  useEffect(() => { fetchPlaylist() }, [id])

  const removeSong = async (youtubeId) => {
    try {
      await api.delete(`/api/playlists/${id}/songs/${youtubeId}`)
      setPlaylist(prev => ({ ...prev, songs: prev.songs.filter(s => s.youtubeId !== youtubeId) }))
      toast.success('Removed from playlist')
    } catch { toast.error('Failed to remove') }
  }

  const playAll = () => {
    if (!playlist?.songs?.length) return
    playSong(playlist.songs[0], playlist.songs)
  }

  const shufflePlay = () => {
    if (!playlist?.songs?.length) return
    const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5)
    playSong(shuffled[0], shuffled)
  }

  const totalDuration = playlist?.songs?.reduce((acc, s) => {
    const parts = s.duration.split(':').map(Number)
    return acc + (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + (parts[1] || 0))
  }, 0) || 0

  // Generate cover from first 4 thumbs
  const covers = playlist?.songs?.slice(0, 4).map(s => s.thumbnail) || []

  if (loading) {
    return (
      <div className="p-6">
        <div className="shimmer h-48 rounded-2xl mb-6 w-full max-w-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer h-16 rounded-xl mb-2" />
        ))}
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Hero */}
      <div className="relative p-6 pb-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          {/* Cover */}
          <div className="w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-surface2 shadow-2xl">
            {covers.length >= 4 ? (
              <div className="grid grid-cols-2 h-full">
                {covers.map((c, i) => (
                  <img key={i} src={c} alt="" className="w-full h-full object-cover" />
                ))}
              </div>
            ) : covers.length > 0 ? (
              <img src={covers[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent/40 to-purple-600/40 flex items-center justify-center">
                <Music size={48} className="text-white/40" />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-col justify-end">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Playlist</p>
            <h1 className="text-4xl font-extrabold text-white mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-white/50 text-sm mb-3">{playlist.description}</p>
            )}
            <p className="text-white/40 text-sm">
              {playlist.songs.length} songs · {formatTime(totalDuration)}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playAll}
                disabled={!playlist.songs.length}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
              >
                <Play size={18} fill="white" /> Play All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shufflePlay}
                disabled={!playlist.songs.length}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
              >
                <Shuffle size={18} /> Shuffle
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="px-4 pb-8">
        {/* Header */}
        {playlist.songs.length > 0 && (
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-xs text-white/30 uppercase tracking-wider border-b border-white/5 mb-2">
            <span className="w-8 text-center">#</span>
            <span>Title</span>
            <span className="w-24 text-right">Duration</span>
            <span className="w-8" />
          </div>
        )}

        {playlist.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Music size={48} className="mb-4 opacity-50" />
            <p className="text-lg">This playlist is empty</p>
            <p className="text-sm mt-1">Search for songs and add them here</p>
          </div>
        ) : (
          playlist.songs.map((song, i) => {
            const { currentSong, isPlaying: playing } = usePlayerStore.getState()
            const isActive = currentSong?.youtubeId === song.youtubeId
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ show: true, song, pos: { x: e.clientX, y: e.clientY } })
                }}
                onClick={() => playSong(song, playlist.songs)}
                className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group hover:bg-white/5 transition-colors ${isActive ? 'bg-accent/10' : ''}`}
              >
                <div className="w-8 text-center">
                  {isActive ? (
                    <div className="flex items-center justify-center gap-0.5 h-4">
                      <div className="eq-bar" />
                      <div className="eq-bar" />
                      <div className="eq-bar" />
                    </div>
                  ) : (
                    <span className="text-sm text-white/30 group-hover:hidden">{i + 1}</span>
                  )}
                  <Play size={14} fill="white" className="text-white hidden group-hover:block mx-auto" />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-accent' : 'text-white'}`}>{song.title}</p>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </div>
                </div>
                <span className="text-sm text-white/40 w-24 text-right">{song.duration}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeSong(song.youtubeId) }}
                  className="w-8 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
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
            { label: 'Play Now', action: () => playSong(contextMenu.song, playlist.songs) },
            { label: 'Play Next', action: () => playNextInsert(contextMenu.song) },
            { label: 'Add to Queue', action: () => addToQueue(contextMenu.song) },
            { label: 'Remove from Playlist', action: () => removeSong(contextMenu.song.youtubeId), variant: 'danger' },
          ]}
        />
      )}
    </div>
  )
}
