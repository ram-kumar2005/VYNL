import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore.js'
import { usePlayerStore } from './store/playerStore.js'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Library from './pages/Library.jsx'
import PlaylistPage from './pages/PlaylistPage.jsx'
import LikedSongs from './pages/LikedSongs.jsx'
import Profile from './pages/Profile.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'

function AppRoutes() {
  const { fetchUser } = useAuthStore()
  const { currentSong, isPlaying, setIsPlaying, setVolume, volume, toggleMute,
          toggleShuffle, toggleQueue, seekTo, currentTime, duration } = usePlayerStore()

  // Fetch user on mount
  useEffect(() => {
    fetchUser()
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (currentSong) setIsPlaying(!isPlaying)
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentSong) seekTo(Math.max(0, currentTime - 10))
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentSong) seekTo(Math.min(duration, currentTime + 10))
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(100, volume + 10))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 10))
          break
        case 'm':
        case 'M':
          toggleMute()
          break
        case 's':
        case 'S':
          toggleShuffle()
          break
        case 'q':
        case 'Q':
          toggleQueue()
          break
        case 'Escape':
          // Handled by individual modals
          break
        default: break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentSong, isPlaying, currentTime, duration, volume])

  try {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a24',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#ff3d5a', secondary: '#fff' } }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="playlist/:id" element={<PlaylistPage />} />
            <Route path="liked" element={<LikedSongs />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-[#ff3d5a] p-6">
        <h2 className="text-xl font-bold mb-2">Application Error</h2>
        <pre className="text-sm whitespace-pre-wrap">{String(error)}</pre>
      </div>
    )
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
