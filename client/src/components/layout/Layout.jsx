import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import MobileNav from './MobileNav.jsx'
import PlayerBar from '../player/PlayerBar.jsx'
import QueueDrawer from '../player/QueueDrawer.jsx'
import YoutubePlayer from '../player/YoutubePlayer.jsx'
import { usePlayerStore } from '../../store/playerStore.js'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

export default function Layout() {
  const location = useLocation()
  const { currentSong } = usePlayerStore()
  const playerHeight = currentSong ? 'pb-24' : 'pb-4'

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className={`flex-1 overflow-y-auto ${playerHeight} md:pb-24`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hidden YouTube IFrame */}
      <YoutubePlayer />

      {/* Player bar */}
      <PlayerBar />

      {/* Queue drawer */}
      <QueueDrawer />

      {/* Mobile nav */}
      <MobileNav />
    </div>
  )
}
