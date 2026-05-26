import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth'
import { AuthContext } from './authContext'
import { useToast } from './toastContext'
import { toUserMessage } from '../utils/apiMessages'

export function AuthProvider({ children }) {
  const toast = useToast()
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
    try {
      const result = await authApi.login(credentials)
      setUser(result?.user || null)
      await authApi.mergeGuestCart().catch(() => null)
      toast.success('Signed in successfully.')
      return result
    } catch (error) {
      toast.error(toUserMessage(error, 'Sign in failed. Please check your details.'))
      throw error
    }
  }, [toast])

  const register = useCallback(async details => {
    try {
      const result = await authApi.register(details)
      setUser(result?.user || null)
      await authApi.mergeGuestCart().catch(() => null)
      toast.success('Account created successfully.')
      return result
    } catch (error) {
      toast.error(toUserMessage(error, 'Account creation failed. Please try again.'))
      throw error
    }
  }, [toast])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null)
    setUser(null)
    toast.info('You have been signed out.')
  }, [toast])

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
