import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const nextUser = await authApi.me()
      setUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      return null
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refreshUser)
  }, [refreshUser])

  const login = useCallback(async credentials => {
    const result = await authApi.login(credentials)
    setUser(result?.user || null)
    await authApi.mergeGuestCart().catch(() => null)
    return result
  }, [])

  const register = useCallback(async details => {
    const result = await authApi.register(details)
    setUser(result?.user || null)
    await authApi.mergeGuestCart().catch(() => null)
    return result
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null)
    setUser(null)
  }, [])

  const isAdmin = user?.roles?.some(role => ['admin', 'super_admin'].includes(role)) || false

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      isAuthLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isAdmin, isAuthLoading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
