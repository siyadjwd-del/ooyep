import type {
  Client,
  CouponPayment,
  Holding,
  Message,
  PerformanceData,
  PortfolioSummary,
  Statement,
  AllocationSlice,
  MaturityBucket,
  ValuePoint,
} from '../data/types'
import * as mock from '../data/mockData'

// ===========================================================================
// API SERVICE LAYER  —  the single seam between the UI and the data source.
//
// Today this returns mock data with a small simulated network delay, so the
// portal is fully clickable as a prototype.
//
// TO CONNECT YOUR SQL SERVER DATABASE:
//   1. Stand up the backend in /server (Express + the `mssql` driver). It
//      exposes REST endpoints like GET /api/portfolio/summary that run
//      parameterised T-SQL queries against your database.
//   2. Set VITE_API_BASE_URL in a .env file (e.g. http://localhost:4000/api).
//   3. Set USE_MOCK = false below. Every function will then call the real API
//      instead of the mock — no UI changes required, because the shapes match
//      the types in src/data/types.ts.
// ===========================================================================

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// Simulate latency so loading states are visible in the prototype.
function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('sit_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`)
  }
  return res.json() as Promise<T>
}

export interface DashboardData {
  client: Client
  summary: PortfolioSummary
  valueHistory: ValuePoint[]
  allocation: AllocationSlice[]
  maturityLadder: MaturityBucket[]
  holdings: Holding[]
  couponCalendar: CouponPayment[]
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; client: Client }> {
    if (USE_MOCK) {
      // Demo auth: accept the demo account or any non-empty credentials.
      const ok = password.length > 0
      if (!ok) throw new Error('Please enter your password.')
      const matchesDemo = email.trim().toLowerCase() === mock.client.email
      const client = matchesDemo ? mock.client : { ...mock.client, email: email.trim() }
      return delay({ token: 'demo-token', client }, 600)
    }
    return http('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async getDashboard(): Promise<DashboardData> {
    if (USE_MOCK) {
      return delay({
        client: mock.client,
        summary: mock.summary,
        valueHistory: mock.valueHistory,
        allocation: mock.allocation,
        maturityLadder: mock.maturityLadder,
        holdings: mock.holdings,
        couponCalendar: mock.couponCalendar,
      })
    }
    return http('/dashboard')
  },

  async getPerformance(): Promise<PerformanceData> {
    if (USE_MOCK) {
      return delay({
        summary: mock.performanceSummary,
        history: mock.performanceHistory,
        stats: mock.performanceStats,
        credit: mock.creditQuality,
      })
    }
    return http('/performance')
  },

  async getStatements(): Promise<Statement[]> {
    if (USE_MOCK) return delay(mock.statements)
    return http('/statements')
  },

  async getMessages(): Promise<Message[]> {
    if (USE_MOCK) return delay(mock.messages, 350)
    return http('/messages')
  },

  async sendMessage(body: string): Promise<Message> {
    if (USE_MOCK) {
      return delay(
        {
          id: `m_${Math.round(performance.now())}`,
          from: 'client',
          author: mock.client.name,
          body,
          sentAt: new Date().toISOString(),
        },
        300,
      )
    }
    return http('/messages', { method: 'POST', body: JSON.stringify({ body }) })
  },
}
