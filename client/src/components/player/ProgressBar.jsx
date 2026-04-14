import { usePlayerStore } from '../../store/playerStore.js'
import { formatTime } from '../../utils/formatters.js'

export default function ProgressBar() {
  const { currentTime, duration, seekTo } = usePlayerStore()
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    seekTo(pct * duration)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-white/40 w-9 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>
      <div
        className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
        onClick={handleClick}
      >
        <div
          className="h-full bg-white rounded-full group-hover:bg-accent transition-colors relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <span className="text-xs text-white/40 w-9 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  )
}
