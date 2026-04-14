import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api.js'

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  isLoading: true,

  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user, isLoading: false })
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    set({ user: null })
    window.location.href = '/login'
  },

  setUser: (user) => set({ user, isLoading: false })
}), {
  name: 'vynl-auth',
  partialize: (state) => ({ user: state.user })
}))
