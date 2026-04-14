import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../store/playerStore.js'
import api from '../../utils/api.js'
import { useAuthStore } from '../../store/authStore.js'

export default function YoutubePlayer() {
  const ytRef = useRef(null)
  const intervalRef = useRef(null)
  const { currentSong, isPlaying, volume, setPlayerRef, setCurrentTime,
    setDuration, setIsPlaying, playNext } = usePlayerStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Load YT IFrame API once
    if (window.YT) {
      initPlayer()
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = initPlayer
    return () => { window.onYouTubeIframeAPIReady = null }
  }, [])

  function initPlayer() {
    if (ytRef.current) return
    ytRef.current = new window.YT.Player('yt-player', {
      height: '1', width: '1',
      playerVars: { autoplay: 1, controls: 0, rel: 0 },
      events: {
        onReady: (e) => {
          setPlayerRef(e.target)
          e.target.setVolume(usePlayerStore.getState().volume)
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.ENDED) playNext()
          if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true)
          if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false)
        }
      }
    })
  }

  // Load new video when song changes
  useEffect(() => {
    if (!ytRef.current?.loadVideoById || !currentSong) return
    ytRef.current.loadVideoById(currentSong.youtubeId)
    // Log to history (fire and forget)
    if (user) {
      api.post('/api/history', {
        youtubeId: currentSong.youtubeId,
        title: currentSong.title,
        artist: currentSong.artist,
        thumbnail: currentSong.thumbnail
      }).catch(() => {})
    }
  }, [currentSong?.youtubeId])

  // Play / pause
  useEffect(() => {
    if (!ytRef.current?.playVideo) return
    if (isPlaying) {
      ytRef.current.playVideo()
    } else {
      ytRef.current.pauseVideo()
    }
  }, [isPlaying])

  // Volume
  useEffect(() => {
    if (!ytRef.current?.setVolume) return
    ytRef.current.setVolume(volume)
  }, [volume])

  // Time progress interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!ytRef.current?.getCurrentTime) return
      const t = ytRef.current.getCurrentTime() || 0
      const d = ytRef.current.getDuration() || 0
      setCurrentTime(t)
      setDuration(d)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div
      id="yt-player"
      style={{ position: 'fixed', bottom: '-10px', left: '-10px', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
    />
  )
}
