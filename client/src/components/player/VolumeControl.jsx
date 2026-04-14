import { Volume2, VolumeX, Volume1 } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore.js'

export default function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore()

  const Icon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
        <Icon size={18} />
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={isMuted ? 0 : volume}
        onChange={e => setVolume(Number(e.target.value))}
        className="w-20 accent-accent"
        style={{
          background: `linear-gradient(to right, #ff3d5a ${isMuted ? 0 : volume}%, #22222f ${isMuted ? 0 : volume}%)`
        }}
      />
    </div>
  )
}
