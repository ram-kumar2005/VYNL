import { create } from 'zustand'

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
  volume: 80,
  currentTime: 0,
  duration: 0,
  playerRef: null,
  isQueueOpen: false,
  isMuted: false,
  previousVolume: 80,

  setPlayerRef: (ref) => set({ playerRef: ref }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setVolume: (v) => {
    set({ volume: v, isMuted: v === 0 })
    get().playerRef?.setVolume(v)
  },
  toggleMute: () => {
    const { isMuted, volume, previousVolume, playerRef } = get()
    if (isMuted) {
      const newVol = previousVolume || 80
      set({ isMuted: false, volume: newVol })
      playerRef?.setVolume(newVol)
    } else {
      set({ isMuted: true, previousVolume: volume, volume: 0 })
      playerRef?.setVolume(0)
    }
  },
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  toggleRepeat: () => set(s => ({
    repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off'
  })),
  toggleQueue: () => set(s => ({ isQueueOpen: !s.isQueueOpen })),

  playSong: (song, newQueue = null) => {
    const queue = newQueue || get().queue
    const index = queue.findIndex(s => s.youtubeId === song.youtubeId)
    set({
      currentSong: song,
      queue: newQueue || get().queue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true
    })
  },

  playNext: () => {
    const { queue, queueIndex, shuffle, repeat, playerRef } = get()
    if (repeat === 'one') {
      playerRef?.seekTo(0)
      return
    }
    let nextIndex
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0
        else { set({ isPlaying: false }); return }
      }
    }
    if (queue[nextIndex]) {
      set({ queueIndex: nextIndex, currentSong: queue[nextIndex], isPlaying: true })
    }
  },

  playPrev: () => {
    const { queue, queueIndex, currentTime, playerRef } = get()
    // If more than 3 seconds in, restart; else go prev
    if (currentTime > 3) {
      playerRef?.seekTo(0)
      return
    }
    const prevIndex = Math.max(0, queueIndex - 1)
    if (queue[prevIndex]) {
      set({ queueIndex: prevIndex, currentSong: queue[prevIndex], isPlaying: true })
    }
  },

  seekTo: (seconds) => {
    get().playerRef?.seekTo(seconds, true)
    set({ currentTime: seconds })
  },

  addToQueue: (song) => set(s => ({ queue: [...s.queue, song] })),
  playNextInsert: (song) => set(s => {
    const q = [...s.queue]
    q.splice(s.queueIndex + 1, 0, song)
    return { queue: q }
  }),
  removeFromQueue: (index) => set(s => {
    const q = s.queue.filter((_, i) => i !== index)
    return { queue: q }
  }),
  clearQueue: () => set({ queue: [], queueIndex: 0 }),
  setQueueIndex: (index) => set(s => ({
    queueIndex: index,
    currentSong: s.queue[index],
    isPlaying: true
  }))
}))
