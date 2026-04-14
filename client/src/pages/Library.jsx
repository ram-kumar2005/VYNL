import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Heart, Music } from 'lucide-react'
import api from '../utils/api.js'
import PlaylistCard from '../components/cards/PlaylistCard.jsx'
import CreatePlaylistModal from '../components/modals/CreatePlaylistModal.jsx'

export default function Library() {
  const [playlists, setPlaylists] = useState([])
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const [plRes, liRes] = await Promise.all([
        api.get('/api/playlists'),
        api.get('/api/likes')
      ])
      setPlaylists(plRes.data)
      setLikeCount(liRes.data.length)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  return (
    <>
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-white">Your Library</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            New Playlist
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface2 rounded-xl p-3 animate-pulse">
                <div className="shimmer aspect-square rounded-lg mb-3" />
                <div className="shimmer h-4 rounded mb-2 w-3/4" />
                <div className="shimmer h-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Liked Songs card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group cursor-pointer"
              onClick={() => navigate('/liked')}
            >
              <div className="relative aspect-square rounded-xl bg-gradient-to-br from-pink-600 via-red-500 to-orange-500 flex items-center justify-center mb-3 overflow-hidden">
                <Heart size={40} fill="white" className="text-white" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Music size={18} className="text-bg" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">Liked Songs</p>
              <p className="text-xs text-white/40 mt-0.5">{likeCount} songs</p>
            </motion.div>

            {/* User Playlists */}
            {playlists.map((pl, i) => (
              <PlaylistCard key={pl.id} playlist={pl} index={i} />
            ))}
          </div>
        )}

        {!loading && playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Music size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No playlists yet</p>
            <p className="text-sm mt-1">Create your first playlist to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 bg-accent text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Create Playlist
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreatePlaylistModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchData}
        />
      )}
    </>
  )
}
