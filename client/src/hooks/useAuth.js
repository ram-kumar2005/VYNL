import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore.js'

export function useAuth() {
  const { user, isLoading, fetchUser, logout } = useAuthStore()

  useEffect(() => {
    if (!user) fetchUser()
  }, [])

  return { user, isLoading, logout, fetchUser }
}
