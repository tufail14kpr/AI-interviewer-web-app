import { createContext, useContext, useState } from 'react'
import { authApi } from '../lib/api'

const STORAGE_KEY = 'axis-interview-auth'

const AuthContext = createContext(null)

const readStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { token: '', user: null }
  } catch (_error) {
    return { token: '', user: null }
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession)

  const persistSession = (nextSession) => {
    setSession(nextSession)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
  }

  const clearSession = () => {
    setSession({ token: '', user: null })
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const signup = async (payload) => {
    const result = await authApi.signup(payload)
    persistSession(result)
    return result
  }

  const login = async (payload) => {
    const result = await authApi.login(payload)
    persistSession(result)
    return result
  }

  const value = {
    token: session.token,
    user: session.user,
    isAuthenticated: Boolean(session.token),
    login,
    signup,
    logout: clearSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}
