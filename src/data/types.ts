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
  rating: string          // composite label e.g. "AAA"
  moodyRating: string     // e.g. "Aaa", "Aa1", "Baa2"
  fitchRating: string     // e.g. "AAA", "AA+", "BBB"
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
// Performance-specific types
// ---------------------------------------------------------------------------

/** Monthly benchmark/portfolio value series starting from inception (Jan 2019) */
export interface BenchmarkPoint {
  date: string  // ISO month "YYYY-MM-01"
  portfolio: number    // growth of $10,000 in Sit Invest portfolio
  bondIndex: number   // growth of $10,000 in Bloomberg US Agg Bond Index
  sp500: number       // growth of $10,000 in S&P 500
}

/** Annualised return & volatility row for the comparison table */
export interface ReturnRow {
  name: string
  ret1Y: number | null
  ret3Y: number | null
  ret5Y: number | null
  retSI: number   // Since inception annualised
  vol: number     // Annualised standard deviation (%)
}

/** Summary headline metrics shown at the top of the Performance page */
export interface PerformanceSummary {
  sinceInceptionTotalReturnPct: number
  annualisedReturnPct: number
  bestYear: number            // calendar year e.g. 2023
  bestYearReturnPct: number
  worstYear: number           // calendar year e.g. 2022
  worstYearReturnPct: number
  currentValue: number        // current portfolio market value
  inceptionDate: string       // ISO date
}

/** Breakdown of holdings by credit rating agency */
export interface CreditBucket {
  rating: string   // e.g. "Aaa", "AAA", "Aa1", "AA+"
  marketValue: number
  pct: number      // % of total portfolio
}

export interface CreditQuality {
  moody: CreditBucket[]
  fitch: CreditBucket[]
  weightedAvgMoody: string
  weightedAvgFitch: string
}
