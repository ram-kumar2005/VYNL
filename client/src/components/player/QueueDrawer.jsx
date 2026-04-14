import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical, Music } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore.js'
import { truncate } from '../../utils/formatters.js'

export default function QueueDrawer() {
  const { isQueueOpen, toggleQueue, queue, queueIndex, setQueueIndex, removeFromQueue, currentSong } = usePlayerStore()

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={toggleQueue}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-24 z-50 w-80 bg-surface border-l border-white/5 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-bold text-white">Queue</h3>
              <button onClick={toggleQueue} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {currentSong && (
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Now Playing</p>
                <div className="flex items-center gap-3">
                  <img src={currentSong.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-accent truncate">{currentSong.title}</p>
                    <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2">
              <p className="text-xs text-white/40 px-2 py-2 uppercase tracking-wider">Up Next</p>
              {queue.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-white/30">
                  <Music size={32} className="mb-2" />
                  <p className="text-sm">Queue is empty</p>
                </div>
              )}
              {queue.map((song, i) => (
                <div
                  key={`${song.youtubeId}-${i}`}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group hover:bg-white/5 transition-colors ${i === queueIndex ? 'bg-accent/10' : ''}`}
                  onClick={() => setQueueIndex(i)}
                >
                  <img src={song.thumbnail} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${i === queueIndex ? 'text-accent font-medium' : 'text-white'}`}>
                      {truncate(song.title, 28)}
                    </p>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(i) }}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
