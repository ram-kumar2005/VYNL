import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, Library, Plus, Heart, Music } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { usePlayerStore } from '../../store/playerStore.js'
import api from '../../utils/api.js'
import CreatePlaylistModal from '../modals/CreatePlaylistModal.jsx'

const navLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Your Library' },
]

export default function Sidebar() {
  const { user } = useAuthStore()
  const { currentSong, isPlaying } = usePlayerStore()
  const [playlists, setPlaylists] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const fetchPlaylists = async () => {
    if (!user) return
    try {
      const res = await api.get('/api/playlists')
      setPlaylists(res.data)
    } catch {}
  }

  useEffect(() => { fetchPlaylists() }, [user])

  return (
    <>
      <aside className="w-60 flex-shrink-0 h-screen bg-surface flex flex-col border-r border-white/5 overflow-hidden">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <img src="/vynl-logo.svg" alt="Vynl" className="w-full h-full" />
            </div>
            <span className="text-xl font-extrabold gradient-text">Vynl</span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="px-3 space-y-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-6 my-4 border-t border-white/5" />

        {/* Playlists section */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs text-white/30 uppercase tracking-wider font-semibold">Playlists</span>
            <button
              onClick={() => setShowCreate(true)}
              className="text-white/40 hover:text-accent transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Liked Songs shortcut */}
          <NavLink
            to="/liked"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                isActive ? 'bg-accent/15 text-accent' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center flex-shrink-0">
              <Heart size={14} fill="white" className="text-white" />
            </div>
            <span className="truncate">Liked Songs</span>
          </NavLink>

          {/* User playlists */}
          {playlists.map(pl => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive ? 'bg-accent/15 text-accent' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="w-8 h-8 rounded-lg bg-surface3 flex items-center justify-center flex-shrink-0 text-white/40">
                <Music size={14} />
              </div>
              <span className="truncate">{pl.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Now Playing mini */}
        {currentSong && (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <img src={currentSong.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover" />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-end justify-center pb-0.5 gap-0.5 rounded-lg">
                    <div className="eq-bar" style={{ height: '4px' }} />
                    <div className="eq-bar" style={{ height: '4px' }} />
                    <div className="eq-bar" style={{ height: '4px' }} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {showCreate && (
        <CreatePlaylistModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchPlaylists}
        />
      )}
    </>
  )
}
