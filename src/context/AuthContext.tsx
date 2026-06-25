import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Client } from '../data/types'
import { api } from '../services/api'

interface AuthState {
  client: Client | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

const STORAGE_KEY = 'sit_client'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore session from a previous visit.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setClient(JSON.parse(stored) as Client)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  async function login(email: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const { token, client } = await api.login(email, password)
      localStorage.setItem('sit_token', token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(client))
      setClient(client)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to sign in.'
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('sit_token')
    localStorage.removeItem(STORAGE_KEY)
    setClient(null)
  }

  const value = useMemo<AuthState>(
    () => ({ client, loading, error, login, logout }),
    [client, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
