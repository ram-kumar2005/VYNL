import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore.js'
import { usePlayerStore } from '../store/playerStore.js'
import ScrollRow from '../components/common/ScrollRow.jsx'
import LanguageTabs from '../components/common/LanguageTabs.jsx'
import api from '../utils/api.js'
import { getGreeting } from '../utils/formatters.js'

const SECTIONS = [
  { key: 'tamil', query: 'top tamil hits 2024', label: '🎵 Top Tamil Hits' },
  { key: 'telugu', query: 'top telugu hits 2024', label: '🎶 Top Telugu Hits' },
  { key: 'english', query: 'top english hits 2024', label: '🌍 English Charts' },
]

export default function Home() {
  const { user } = useAuthStore()
  const { playSong } = usePlayerStore()
  const [lang, setLang] = useState('all')
  const [trending, setTrending] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [sections, setSections] = useState({})
  const [sectionsLoading, setSectionsLoading] = useState({})

  const firstName = user?.name?.split(' ')[0] || 'there'
  const greeting = getGreeting()

  // Fetch trending on lang change
  useEffect(() => {
    setTrendingLoading(true)
    api.get('/api/search/trending', { params: { lang } })
      .then(r => setTrending(r.data))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false))
  }, [lang])

  // Fetch history & liked on mount
  useEffect(() => {
    api.get('/api/history').then(r => setHistory(r.data.slice(0, 20))).catch(() => {})
    api.get('/api/likes').then(r => {
      const shuffled = [...r.data].sort(() => Math.random() - 0.5).slice(0, 10)
      setLikedSongs(shuffled)
    }).catch(() => {})
  }, [])

  // Fetch fixed sections
  useEffect(() => {
    SECTIONS.forEach(({ key, query }) => {
      setSectionsLoading(prev => ({ ...prev, [key]: true }))
      api.get('/api/search', { params: { q: query } })
        .then(r => setSections(prev => ({ ...prev, [key]: r.data })))
        .catch(() => {})
        .finally(() => setSectionsLoading(prev => ({ ...prev, [key]: false })))
    })
  }, [])

  const handlePlay = (song, queue) => {
    playSong(song, queue)
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-white">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">What are you listening to today?</p>
      </motion.div>

      {/* Language Tabs */}
      <div className="mb-8">
        <LanguageTabs selected={lang} onChange={setLang} />
      </div>

      {/* Trending Now */}
      <ScrollRow
        title={`🔥 Trending Now${lang !== 'all' ? ` — ${lang.charAt(0).toUpperCase() + lang.slice(1)}` : ''}`}
        items={trending}
        isLoading={trendingLoading}
        onPlay={handlePlay}
      />

      {/* Recently Played */}
      {history.length > 0 && (
        <ScrollRow
          title="🕐 Recently Played"
          items={history}
          isLoading={false}
          onPlay={handlePlay}
        />
      )}

      {/* From Your Likes */}
      {likedSongs.length > 0 && (
        <ScrollRow
          title="❤️ From Your Likes"
          items={likedSongs}
          isLoading={false}
          onPlay={handlePlay}
        />
      )}

      {/* Fixed Language Sections */}
      {SECTIONS.map(({ key, label }) => (
        <ScrollRow
          key={key}
          title={label}
          items={sections[key] || []}
          isLoading={sectionsLoading[key]}
          onPlay={handlePlay}
        />
      ))}
    </div>
  )
}
