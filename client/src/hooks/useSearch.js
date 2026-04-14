import { useState, useEffect, useRef } from 'react'
import api from '../utils/api.js'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [lang, setLang] = useState('all')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/api/search', { params: { q: query, lang } })
        setResults(res.data)
        setError(null)
      } catch (err) {
        setError('Search failed. Check your API key.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query, lang])

  const searchGenre = async (genreQuery, genreLang = 'all') => {
    setQuery(genreQuery)
    setLang(genreLang)
  }

  return { query, setQuery, lang, setLang, results, isLoading, error, searchGenre }
}
