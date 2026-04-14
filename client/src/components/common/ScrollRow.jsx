import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SongCard from '../cards/SongCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'

export default function ScrollRow({ title, items = [], isLoading = false, onPlay }) {
  const rowRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const scroll = (dir) => {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = rowRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 0)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  if (!isLoading && items.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {items.length > 5 && (
          <button className="text-xs text-white/40 hover:text-accent transition-colors font-medium">
            See all
          </button>
        )}
      </div>

      <div className="relative group/row">
        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-surface3 border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {/* Right arrow */}
        {showRight && items.length > 4 && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-surface3 border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44">
                <SkeletonCard />
              </div>
            ))
            : items.map((song, i) => (
              <div key={song.youtubeId || i} className="flex-shrink-0 w-44">
                <SongCard
                  song={song}
                  queue={items}
                  onPlay={onPlay ? () => onPlay(song, items) : undefined}
                />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
