import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, Play } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore.js'

const GRADIENTS = [
  'from-purple-600 to-pink-600',
  'from-blue-600 to-cyan-600',
  'from-green-600 to-teal-600',
  'from-orange-600 to-red-600',
  'from-indigo-600 to-purple-600',
]

export default function PlaylistCard({ playlist, index = 0 }) {
  const navigate = useNavigate()
  const gradient = GRADIENTS[index % GRADIENTS.length]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group bg-surface2 hover:bg-surface3 rounded-xl p-3 cursor-pointer transition-colors"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className={`relative mb-3 aspect-square rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
        ) : (
          <Music size={32} className="text-white/70" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <Play size={18} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-sm font-semibold text-white truncate">{playlist.name}</p>
      <p className="text-xs text-white/40 mt-0.5">{playlist.songCount || 0} songs</p>
    </motion.div>
  )
}
