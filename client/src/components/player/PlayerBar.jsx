import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, ListMusic, Heart, ExternalLink
} from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore.js'
import { useAuthStore } from '../../store/authStore.js'
import ProgressBar from './ProgressBar.jsx'
import VolumeControl from './VolumeControl.jsx'
import api from '../../utils/api.js'
import toast from 'react-hot-toast'

export default function PlayerBar() {
  const {
    currentSong, isPlaying, shuffle, repeat,
    setIsPlaying, toggleShuffle, toggleRepeat, toggleQueue,
    playNext, playPrev
  } = usePlayerStore()
  const { user } = useAuthStore()
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    if (!currentSong || !user) return
    api.get(`/api/likes/check/${currentSong.youtubeId}`)
      .then(r => setLiked(r.data.liked))
      .catch(() => {})
  }, [currentSong?.youtubeId, user])

  const handleLike = async () => {
    if (!user || !currentSong || likeLoading) return
    setLikeLoading(true)
    try {
      const res = await api.post(`/api/likes/${currentSong.youtubeId}`, {
        title: currentSong.title,
        artist: currentSong.artist,
        thumbnail: currentSong.thumbnail,
        duration: currentSong.duration
      })
      setLiked(res.data.liked)
      toast.success(res.data.liked ? '❤️ Added to Liked Songs' : 'Removed from Liked Songs')
    } catch {
      toast.error('Failed to update like')
    } finally {
      setLikeLoading(false)
    }
  }

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  if (!currentSong) return null

  const titleLong = currentSong.title.length > 30

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/5 px-4 py-2"
      style={{ height: '80px' }}
    >
      <div className="flex items-center h-full gap-4 max-w-screen-2xl mx-auto">

        {/* LEFT — Song info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className={`w-12 h-12 rounded-lg object-cover ${isPlaying ? 'ring-2 ring-accent' : ''}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1">
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {titleLong ? (
              <div className="marquee">
                <span className="text-sm font-semibold text-white">
                  {currentSong.title}&nbsp;&nbsp;&nbsp;&nbsp;{currentSong.title}&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
            )}
            <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              disabled={!user || likeLoading}
              className={`p-1.5 rounded-full transition-colors ${liked ? 'text-accent' : 'text-white/40 hover:text-white'}`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <a
              href={`https://youtube.com/watch?v=${currentSong.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-white/30 hover:text-white/70 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* CENTER — Controls + Progress */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${shuffle ? 'text-accent' : 'text-white/40 hover:text-white'}`}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={playPrev} className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-bg hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying
                ? <Pause size={18} fill="currentColor" />
                : <Play size={18} fill="currentColor" className="ml-0.5" />
              }
            </button>
            <button onClick={playNext} className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-colors ${repeat !== 'off' ? 'text-accent' : 'text-white/40 hover:text-white'}`}
            >
              <RepeatIcon size={16} />
            </button>
          </div>
          <ProgressBar />
        </div>

        {/* RIGHT — Volume + Queue */}
        <div className="flex items-center gap-3 w-48 justify-end">
          <VolumeControl />
          <button
            onClick={toggleQueue}
            className="text-white/40 hover:text-accent transition-colors"
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
