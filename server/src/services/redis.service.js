import { createClient } from 'redis'

let client = null
let isConnected = false
let isDisabled = false

async function getClient() {
  if (isDisabled) return null

  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: () => false
      }
    })
    client.on('error', err => console.log('Redis Client Error:', err))
    client.on('connect', () => {
      isConnected = true
      console.log('Redis connected ✅')
    })
    client.on('disconnect', () => {
      isConnected = false
    })
    try {
      await client.connect()
    } catch (err) {
      console.log('Redis connection failed — running without cache:', err.message)
      isConnected = false
      isDisabled = true
      try {
        await client.quit()
      } catch {}
      client = null
    }
  }
  return client
}

// Initialize on startup (non-blocking)
getClient().catch(() => {})

export async function getCache(key) {
  try {
    if (!isConnected || isDisabled) return null
    const c = await getClient()
    if (!c) return null
    const data = await c.get(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export async function setCache(key, value, ttlSeconds = 3600) {
  try {
    if (!isConnected || isDisabled) return
    const c = await getClient()
    if (!c) return
    await c.setEx(key, ttlSeconds, JSON.stringify(value))
  } catch {}
}

export async function deleteCache(key) {
  try {
    if (!isConnected || isDisabled) return
    const c = await getClient()
    if (!c) return
    await c.del(key)
  } catch {}
}
