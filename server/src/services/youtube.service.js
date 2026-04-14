import axios from 'axios'
import yts from 'yt-search'
import { getCache, setCache } from './redis.service.js'

const YT_BASE = 'https://www.googleapis.com/youtube/v3'
const API_KEY = process.env.YOUTUBE_API_KEY

const LANGUAGE_KEYWORDS = {
  tamil: 'tamil song',
  telugu: 'telugu song',
  hindi: 'hindi song',
  english: 'english song',
  kannada: 'kannada song',
  malayalam: 'malayalam song',
  all: 'song'
}

export async function searchSongs(query, lang = 'all', maxResults = 20) {
  const langKey = LANGUAGE_KEYWORDS[lang] || 'song'
  const fullQuery = lang !== 'all' ? `${query} ${langKey}` : query
  const cacheKey = `search:${fullQuery}:${maxResults}`

  const cached = await getCache(cacheKey)
  if (cached) return cached

  let results = []
  try {
    if (!API_KEY) throw new Error('YOUTUBE_API_KEY missing')
    const searchRes = await axios.get(`${YT_BASE}/search`, {
      params: {
        part: 'snippet',
        q: fullQuery,
        type: 'video',
        videoCategoryId: '10',
        maxResults,
        key: API_KEY
      }
    })

    const items = searchRes.data.items.filter(i => i.id?.videoId)
    if (!items.length) return []

    const ids = items.map(i => i.id.videoId).join(',')
    const detailRes = await axios.get(`${YT_BASE}/videos`, {
      params: { part: 'contentDetails,statistics', id: ids, key: API_KEY }
    })

    const detailMap = {}
    detailRes.data.items.forEach(item => {
      detailMap[item.id] = item.contentDetails.duration
    })

    results = items.map(item => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: formatDuration(detailMap[item.id.videoId] || 'PT3M30S'),
      language: lang
    }))
  } catch (err) {
    // Fallback when YouTube Data API key is invalid/restricted/quota-exceeded.
    const fallback = await yts.search({ query: fullQuery, pages: 1 })
    results = (fallback?.videos || [])
      .slice(0, maxResults)
      .map(item => ({
        youtubeId: item.videoId,
        title: item.title,
        artist: item.author?.name || 'Unknown artist',
        thumbnail: item.thumbnail,
        duration: item.timestamp || formatSeconds(item.seconds || 0),
        language: lang
      }))
  }

  await setCache(cacheKey, results, 3600)
  return results
}

export async function getTrending(lang = 'tamil') {
  const cacheKey = `trending:${lang}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const keyword = LANGUAGE_KEYWORDS[lang] || 'tamil song'
  const results = await searchSongs(`trending ${keyword} 2024`, 'all', 20)
  await setCache(cacheKey, results, 1800)
  return results
}

export async function getRelated(youtubeId) {
  const cacheKey = `related:${youtubeId}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  // relatedToVideoId is deprecated in v3 free tier, use search as fallback
  try {
    const res = await axios.get(`${YT_BASE}/search`, {
      params: {
        part: 'snippet',
        relatedToVideoId: youtubeId,
        type: 'video',
        videoCategoryId: '10',
        maxResults: 10,
        key: API_KEY
      }
    })

    const results = res.data.items
      .filter(i => i.snippet && i.id?.videoId)
      .map(item => ({
        youtubeId: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        duration: '3:30'
      }))

    await setCache(cacheKey, results, 3600)
    return results
  } catch {
    return await searchSongs('trending music 2024', 'all', 10)
  }
}

function formatDuration(iso) {
  if (!iso) return '0:00'
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatSeconds(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
