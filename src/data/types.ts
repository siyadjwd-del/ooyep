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
  moodys: string // Moody's rating, e.g. 'Aaa', 'Aa2', 'A3'
  fitch: string // Fitch rating, e.g. 'AAA', 'AA-', 'A-'
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

// ---------------------------------------------------------------------------
// Performance & benchmarking
// ---------------------------------------------------------------------------

// One monthly observation of index levels (base 100 at inception). The UI
// re-bases these to a "growth of $10,000" figure for the selected range.
export interface PerformancePoint {
  date: string // ISO month
  portfolio: number
  aggBond: number // Bloomberg US Aggregate Bond Index
  sp500: number // S&P 500 Index
}

export interface YearReturn {
  year: number
  returnPct: number
}

export interface PerformanceSummary {
  inceptionDate: string // ISO date
  currentValue: number
  sinceInceptionTotalReturnPct: number
  annualizedReturnPct: number
  bestYear: YearReturn
  worstYear: YearReturn
}

// Trailing annualized returns + volatility for one series.
export interface ReturnStats {
  key: 'portfolio' | 'aggBond' | 'sp500'
  name: string
  color: string
  oneYearPct: number
  threeYearPct: number
  fiveYearPct: number
  sinceInceptionPct: number
  volatilityPct: number
}

// One rating band's share of the portfolio (by either agency).
export interface RatingBucket {
  rating: string // 'Aaa' | 'Aa' | ... (Moody's) or 'AAA' | 'AA' | ... (Fitch)
  marketValue: number
  pct: number
}

export interface CreditQuality {
  moodys: RatingBucket[]
  fitch: RatingBucket[]
  weightedAverageMoodys: string
  weightedAverageFitch: string
}

export interface PerformanceData {
  summary: PerformanceSummary
  history: PerformancePoint[]
  stats: ReturnStats[]
  credit: CreditQuality
}
