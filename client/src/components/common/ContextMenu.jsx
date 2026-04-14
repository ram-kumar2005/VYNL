import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContextMenu({ items, position, onClose, song }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const keyHandler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [onClose])

  // Adjust position to stay on screen
  const menuWidth = 200
  const menuHeight = items.length * 40 + 8
  const x = Math.min(position.x, window.innerWidth - menuWidth - 8)
  const y = Math.min(position.y, window.innerHeight - menuHeight - 8)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[100] bg-surface3 border border-white/10 rounded-xl py-1 shadow-2xl"
      style={{ top: y, left: x, width: menuWidth }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose() }}
          className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 
            ${item.variant === 'danger' ? 'text-red-400 hover:text-red-300' : 'text-white/80 hover:text-white'}`}
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  )
}
