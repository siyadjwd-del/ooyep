// Shared domain types for the Sit Invest client portal.
// These mirror the shape the backend API is expected to return,
// so swapping the mock api (src/services/api.ts) for the real
// SQL Server-backed API requires no changes to the UI.

export interface Client {
  id: string
  name: string
  email: string
  advisorName: string
  advisorEmail: string
  accountNumber: string
  memberSince: string // ISO date
}

export interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  ytdReturnPct: number
  estAnnualIncome: number
  avgYieldPct: number
  avgRating: string
  cashBalance: number
  asOf: string // ISO date
}

export interface ValuePoint {
  date: string // ISO date (month)
  value: number
}

export interface AllocationSlice {
  name: string
  value: number // market value
  color: string
}

export interface MaturityBucket {
  label: string // e.g. "2026"
  value: number // market value maturing in this year
}

export interface Holding {
  id: string
  issuer: string
  type: string
  cusip: string
  couponPct: number
  yieldPct: number
  rating: string
  maturity: string // ISO date
  faceValue: number
  marketValue: number
  gainPct: number
}

export interface CouponPayment {
  id: string
  issuer: string
  date: string // ISO date
  amount: number
  status: 'scheduled' | 'paid'
}

export interface Statement {
  id: string
  period: string // e.g. "May 2026"
  date: string // ISO date issued
  type: 'Monthly Statement' | 'Tax Document' | 'Trade Confirmation'
  sizeKb: number
}

export interface Message {
  id: string
  from: 'client' | 'advisor'
  author: string
  body: string
  sentAt: string // ISO datetime
}
