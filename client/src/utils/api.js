import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true
})

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
