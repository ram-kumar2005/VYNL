import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore.js'
import { useSearch } from '../hooks/useSearch.js'
import SongCard from '../components/cards/SongCard.jsx'
import SkeletonCard from '../components/common/SkeletonCard.jsx'
import LanguageTabs from '../components/common/LanguageTabs.jsx'

const GENRES = [
  { label: '🎵 Tamil Hits', query: 'tamil hits 2024', lang: 'tamil' },
  { label: '🎬 Tollywood', query: 'tollywood hits 2024', lang: 'telugu' },
  { label: '🎶 Bollywood', query: 'bollywood hits 2024', lang: 'hindi' },
  { label: '🌊 Lo-fi', query: 'lofi chill music', lang: 'all' },
  { label: '🎤 Hip-Hop', query: 'hip hop hits 2024', lang: 'all' },
  { label: '⚡ Pop', query: 'pop hits 2024', lang: 'english' },
  { label: '🎸 Rock', query: 'rock hits 2024', lang: 'english' },
  { label: '🌙 Night Drive', query: 'night drive music', lang: 'all' },
]

export default function Search() {
  const { query, setQuery, lang, setLang, results, isLoading, error, searchGenre } = useSearch()
  const { playSong } = usePlayerStore()

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white mb-6">Search</h1>

      {/* Search Input */}
      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any song, artist, album..."
          autoFocus
          className="w-full bg-surface2 border border-white/10 rounded-2xl pl-11 pr-10 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Language filter */}
      <div className="mb-6">
        <LanguageTabs selected={lang} onChange={setLang} />
      </div>

      {/* Genre shortcuts — shown when no query */}
      {!query && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {GENRES.map((genre, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => searchGenre(genre.query, genre.lang)}
                className="relative overflow-hidden rounded-2xl p-5 text-left font-semibold text-white text-sm shadow-lg"
                style={{
                  background: `hsl(${(i * 45) % 360}, 60%, 25%)`
                }}
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(i * 45) % 360}, 70%, 40%), hsl(${(i * 45 + 60) % 360}, 60%, 20%))`
                  }}
                />
                <span className="relative z-10">{genre.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Results grid */}
      {(isLoading || results.length > 0) && query && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {results.map(song => (
                <SongCard
                  key={song.youtubeId}
                  song={song}
                  queue={results}
                  onPlay={(s) => playSong(s, results)}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* No results */}
      {!isLoading && query && results.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <SearchIcon size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">No results for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term or language</p>
        </div>
      )}
    </div>
  )
}
