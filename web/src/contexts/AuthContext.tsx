import type { AuthUser } from '@/types/auth'
import { ApiError } from '@/lib/api'
import { authApi } from '@/lib/auth.api'
import { authStore } from '@/store/auth.store'
import { createContext, useContext, useEffect, useState } from 'react'

export type { AuthUser }

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      setIsLoading(false)
      return
    }

    authApi
      .getProfile()
      .then((profile) => setUser(profile))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          authStore.clearToken()
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  function logout() {
    authStore.clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
