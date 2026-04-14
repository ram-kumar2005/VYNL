import axios from 'axios'

const TOKEN_KEY = 'vynl_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true
})

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common.Authorization
  }
}

const storedToken = localStorage.getItem(TOKEN_KEY)
if (storedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedToken}`
}

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Don't redirect on /auth/me check — let the app handle it
    }
    return Promise.reject(err)
  }
)

export default api
