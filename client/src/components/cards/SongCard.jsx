import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Heart, MoreHorizontal } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore.js'
import ContextMenu from '../common/ContextMenu.jsx'
import { truncate } from '../../utils/formatters.js'

export default function SongCard({ song, onPlay, queue = [], showIndex = null }) {
  const { currentSong, isPlaying, playSong, playNextInsert, addToQueue } = usePlayerStore()
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const isActive = currentSong?.youtubeId === song.youtubeId

  const handleContextMenu = (e) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handlePlay = () => {
    if (onPlay) {
      onPlay(song)
    } else {
      playSong(song, queue.length > 0 ? queue : [song])
    }
  }

  const menuItems = [
    { label: 'Play Now', action: handlePlay },
    { label: 'Play Next', action: () => playNextInsert(song) },
    { label: 'Add to Queue', action: () => addToQueue(song) },
    { label: 'Copy YouTube Link', action: () => {
      navigator.clipboard.writeText(`https://youtube.com/watch?v=${song.youtubeId}`)
    }},
  ]

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="group relative bg-surface2 hover:bg-surface3 rounded-xl p-3 cursor-pointer transition-colors"
        onClick={handlePlay}
        onContextMenu={handleContextMenu}
      >
        {/* Thumbnail */}
        <div className="relative mb-3 aspect-square rounded-lg overflow-hidden">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Play overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive && isPlaying ? { opacity: 1, scale: 1 } : {}}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            {isActive && isPlaying ? (
              <div className="flex items-end gap-0.5 h-8">
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <Play size={18} fill="white" className="text-white ml-0.5" />
              </div>
            )}
          </motion.div>
          {/* Index or active */}
          {showIndex !== null && !isActive && (
            <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 rounded text-xs text-white/70 flex items-center justify-center font-medium">
              {showIndex + 1}
            </div>
          )}
          {isActive && (
            <div className="absolute top-2 left-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div>
          <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-accent' : 'text-white'}`}>
            {truncate(song.title, 30)}
          </p>
          <p className="text-xs text-white/50 truncate mt-0.5">{song.artist}</p>
          <p className="text-xs text-white/30 mt-1">{song.duration}</p>
        </div>
      </motion.div>

      {showMenu && (
        <ContextMenu
          items={menuItems}
          position={menuPos}
          onClose={() => setShowMenu(false)}
          song={song}
        />
      )}
    </>
  )
}
