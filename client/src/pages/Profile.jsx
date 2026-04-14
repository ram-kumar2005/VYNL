import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Music, Heart, List, Clock, Play } from 'lucide-react'
import { useAuthStore } from '../store/authStore.js'
import { usePlayerStore } from '../store/playerStore.js'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { formatDate } from '../utils/formatters.js'
import PlaylistCard from '../components/cards/PlaylistCard.jsx'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const { playSong } = usePlayerStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [topSongs, setTopSongs] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/user/profile'),
      api.get('/api/user/stats'),
      api.get('/api/playlists')
    ]).then(([profileRes, statsRes, playlistRes]) => {
      setStats(profileRes.data.stats)
      setTopSongs(statsRes.data)
      setPlaylists(playlistRes.data)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    toast('Logging out...', { icon: '👋' })
    await logout()
  }

  const statCards = [
    { label: 'Total Plays', value: stats?.historyCount || 0, icon: Clock, color: 'from-blue-600 to-cyan-600' },
    { label: 'Songs Liked', value: stats?.likesCount || 0, icon: Heart, color: 'from-pink-600 to-red-600' },
    { label: 'Playlists', value: stats?.playlistsCount || 0, icon: List, color: 'from-purple-600 to-indigo-600' },
    { label: 'Minutes Listened', value: stats?.minutesListened || 0, icon: Music, color: 'from-green-600 to-teal-600' },
  ]

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
        <div className="relative">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-accent/30 shadow-2xl"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-accent animate-ping opacity-20" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Profile</p>
          <h1 className="text-4xl font-extrabold text-white mb-1">{user?.name}</h1>
          <p className="text-white/50 text-sm mb-1">{user?.email}</p>
          <p className="text-white/30 text-xs">Member since {formatDate(user?.createdAt)}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="shimmer h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${color} rounded-2xl p-4 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 opacity-10">
                <Icon size={60} />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{value.toLocaleString()}</p>
              <p className="text-white/70 text-xs font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Top Played */}
      {topSongs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">🏆 Top Played</h2>
          <div className="space-y-2">
            {topSongs.map((song, i) => (
              <motion.div
                key={song.youtubeId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <span className="text-2xl font-black text-white/20 w-8 text-center">#{i + 1}</span>
                <img src={song.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                  <p className="text-xs text-white/40 truncate">{song.artist}</p>
                </div>
                <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-lg">
                  {song.playCount}× played
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Your Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.map((pl, i) => (
              <PlaylistCard key={pl.id} playlist={pl} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
