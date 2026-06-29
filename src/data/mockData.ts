import type {
  AllocationSlice,
  Client,
  CouponPayment,
  CreditQuality,
  Holding,
  MaturityBucket,
  Message,
  PerformancePoint,
  PerformanceSummary,
  PortfolioSummary,
  RatingBucket,
  ReturnStats,
  Statement,
  ValuePoint,
  YearReturn,
} from './types'

// ---------------------------------------------------------------------------
// Sample dataset for the prototype. In production this is replaced by data
// fetched from the SQL Server-backed API (see server/ and src/services/api.ts).
// Numbers are illustrative of a conservative fixed income portfolio.
// ---------------------------------------------------------------------------

export const client: Client = {
  id: 'cl_10293',
  name: 'Eleanor Whitfield',
  email: 'demo@sitinvest.com',
  advisorName: 'Marcus Reed, CFA',
  advisorEmail: 'marcus.reed@sitinvest.com',
  accountNumber: 'SIT-4471-0093',
  memberSince: '2019-03-12',
}

export const summary: PortfolioSummary = {
  totalValue: 1_284_650,
  totalCostBasis: 1_201_000,
  ytdReturnPct: 4.18,
  estAnnualIncome: 58_940,
  avgYieldPct: 4.59,
  avgRating: 'AA-',
  cashBalance: 32_410,
  asOf: '2026-06-24',
}

export const valueHistory: ValuePoint[] = [
  { date: '2025-07-01', value: 1_198_400 },
  { date: '2025-08-01', value: 1_205_900 },
  { date: '2025-09-01', value: 1_212_300 },
  { date: '2025-10-01', value: 1_209_750 },
  { date: '2025-11-01', value: 1_221_100 },
  { date: '2025-12-01', value: 1_234_800 },
  { date: '2026-01-01', value: 1_241_500 },
  { date: '2026-02-01', value: 1_248_900 },
  { date: '2026-03-01', value: 1_256_200 },
  { date: '2026-04-01', value: 1_263_700 },
  { date: '2026-05-01', value: 1_274_050 },
  { date: '2026-06-01', value: 1_284_650 },
]

export const allocation: AllocationSlice[] = [
  { name: 'U.S. Treasuries', value: 411_088, color: '#0b2545' },
  { name: 'Investment-Grade Corp', value: 372_549, color: '#1d4373' },
  { name: 'Municipal Bonds', value: 256_930, color: '#2d5a8c' },
  { name: 'Agency / MBS', value: 154_158, color: '#c9a227' },
  { name: 'Cash & Equivalents', value: 89_925, color: '#9fb3c8' },
]

export const maturityLadder: MaturityBucket[] = [
  { label: '2026', value: 96_300 },
  { label: '2027', value: 142_800 },
  { label: '2028', value: 178_400 },
  { label: '2029', value: 205_600 },
  { label: '2030', value: 188_900 },
  { label: '2031', value: 164_200 },
  { label: '2032+', value: 308_450 },
]

export const holdings: Holding[] = [
  {
    id: 'h1',
    issuer: 'U.S. Treasury Note',
    type: 'Treasury',
    cusip: '91282CJL6',
    couponPct: 4.25,
    yieldPct: 4.31,
    rating: 'AAA',
    moodys: 'Aaa',
    fitch: 'AAA',
    maturity: '2029-11-15',
    faceValue: 200_000,
    marketValue: 203_120,
    gainPct: 1.56,
  },
  {
    id: 'h2',
    issuer: 'Microsoft Corp',
    type: 'Corporate',
    cusip: '594918BP8',
    couponPct: 4.45,
    yieldPct: 4.38,
    rating: 'AAA',
    moodys: 'Aaa',
    fitch: 'AAA',
    maturity: '2030-06-01',
    faceValue: 150_000,
    marketValue: 151_980,
    gainPct: 1.32,
  },
  {
    id: 'h3',
    issuer: 'State of California GO',
    type: 'Municipal',
    cusip: '13063DAC4',
    couponPct: 3.80,
    yieldPct: 4.05,
    rating: 'AA-',
    moodys: 'Aa3',
    fitch: 'AA-',
    maturity: '2031-08-01',
    faceValue: 125_000,
    marketValue: 121_440,
    gainPct: -2.85,
  },
  {
    id: 'h4',
    issuer: 'JPMorgan Chase & Co',
    type: 'Corporate',
    cusip: '46647PCH7',
    couponPct: 4.85,
    yieldPct: 4.72,
    rating: 'A-',
    moodys: 'A3',
    fitch: 'A-',
    maturity: '2028-02-15',
    faceValue: 120_000,
    marketValue: 122_640,
    gainPct: 2.20,
  },
  {
    id: 'h5',
    issuer: 'FNMA Pool MA4521',
    type: 'Agency / MBS',
    cusip: '31418DT59',
    couponPct: 4.00,
    yieldPct: 4.50,
    rating: 'AA+',
    moodys: 'Aaa',
    fitch: 'AA+',
    maturity: '2032-05-01',
    faceValue: 110_000,
    marketValue: 106_810,
    gainPct: -2.90,
  },
  {
    id: 'h6',
    issuer: 'U.S. Treasury Bond',
    type: 'Treasury',
    cusip: '912810TM0',
    couponPct: 4.50,
    yieldPct: 4.55,
    rating: 'AAA',
    moodys: 'Aaa',
    fitch: 'AAA',
    maturity: '2034-05-15',
    faceValue: 200_000,
    marketValue: 207_968,
    gainPct: 3.98,
  },
  {
    id: 'h7',
    issuer: 'New York City Water Auth',
    type: 'Municipal',
    cusip: '64972GFL0',
    couponPct: 3.95,
    yieldPct: 4.10,
    rating: 'AA',
    moodys: 'Aa2',
    fitch: 'AA',
    maturity: '2033-06-15',
    faceValue: 140_000,
    marketValue: 135_490,
    gainPct: -3.22,
  },
  {
    id: 'h8',
    issuer: 'Apple Inc',
    type: 'Corporate',
    cusip: '037833EK8',
    couponPct: 4.30,
    yieldPct: 4.25,
    rating: 'AA+',
    moodys: 'Aa1',
    fitch: 'AA+',
    maturity: '2029-08-01',
    faceValue: 100_000,
    marketValue: 101_180,
    gainPct: 1.18,
  },
]

export const couponCalendar: CouponPayment[] = [
  { id: 'c1', issuer: 'U.S. Treasury Note', date: '2026-06-30', amount: 4_250, status: 'scheduled' },
  { id: 'c2', issuer: 'JPMorgan Chase & Co', date: '2026-07-08', amount: 2_910, status: 'scheduled' },
  { id: 'c3', issuer: 'State of California GO', date: '2026-07-15', amount: 2_375, status: 'scheduled' },
  { id: 'c4', issuer: 'Microsoft Corp', date: '2026-07-22', amount: 3_338, status: 'scheduled' },
  { id: 'c5', issuer: 'Apple Inc', date: '2026-08-01', amount: 2_150, status: 'scheduled' },
  { id: 'c6', issuer: 'FNMA Pool MA4521', date: '2026-08-12', amount: 2_200, status: 'scheduled' },
  { id: 'c7', issuer: 'NYC Water Auth', date: '2026-06-15', amount: 2_765, status: 'paid' },
  { id: 'c8', issuer: 'U.S. Treasury Bond', date: '2026-05-15', amount: 4_500, status: 'paid' },
]

export const statements: Statement[] = [
  { id: 's1', period: 'May 2026', date: '2026-06-03', type: 'Monthly Statement', sizeKb: 412 },
  { id: 's2', period: 'April 2026', date: '2026-05-02', type: 'Monthly Statement', sizeKb: 398 },
  { id: 's3', period: 'March 2026', date: '2026-04-03', type: 'Monthly Statement', sizeKb: 405 },
  { id: 's4', period: 'Q1 2026', date: '2026-04-08', type: 'Trade Confirmation', sizeKb: 188 },
  { id: 's5', period: 'February 2026', date: '2026-03-04', type: 'Monthly Statement', sizeKb: 389 },
  { id: 's6', period: 'January 2026', date: '2026-02-03', type: 'Monthly Statement', sizeKb: 401 },
  { id: 's7', period: 'Tax Year 2025', date: '2026-02-14', type: 'Tax Document', sizeKb: 256 },
  { id: 's8', period: 'December 2025', date: '2026-01-05', type: 'Monthly Statement', sizeKb: 396 },
]

export const messages: Message[] = [
  {
    id: 'm1',
    from: 'advisor',
    author: 'Marcus Reed, CFA',
    body: "Good morning Eleanor — your May statement is now available in the Documents vault. Your portfolio crossed $1.28M this month, with the Treasury ladder performing well. Happy to walk through reinvesting the June 30th coupon whenever suits you.",
    sentAt: '2026-06-23T13:40:00Z',
  },
  {
    id: 'm2',
    from: 'client',
    author: 'Eleanor Whitfield',
    body: 'Thanks Marcus! Could we look at extending duration slightly given where rates are? A call next week would be great.',
    sentAt: '2026-06-23T15:12:00Z',
  },
  {
    id: 'm3',
    from: 'advisor',
    author: 'Marcus Reed, CFA',
    body: "Absolutely. I'll send over a couple of 2034 maturity ideas before our call. Does Tuesday at 10am ET work?",
    sentAt: '2026-06-24T09:05:00Z',
  },
]

// ===========================================================================
// PERFORMANCE & CREDIT QUALITY
//
// A deterministic monthly history from the Jan-2019 inception through the
// present, plus benchmark series, trailing-return stats, and a credit-quality
// breakdown derived from the holdings above. Generated with a seeded RNG so
// the charts have a stable, realistic shape across reloads/builds.
// ===========================================================================

const INCEPTION = '2019-01-01'

const round2 = (n: number) => Math.round(n * 100) / 100

// Small seeded PRNG (mulberry32) — keeps the generated history reproducible.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Months from Jan 2019 through June 2026 (inclusive).
function buildMonths(): string[] {
  const out: string[] = []
  let y = 2019
  let m = 1
  while (y < 2026 || (y === 2026 && m <= 6)) {
    out.push(`${y}-${String(m).padStart(2, '0')}-01`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return out
}

// Approximate real macro episodes layered onto the random walk:
// the Feb–Mar 2020 COVID crash + recovery, and the 2022 bond/equity bear.
const OVERLAYS: Record<string, { p?: number; a?: number; s?: number }> = {
  '2020-02': { p: -0.012, a: 0.006, s: -0.082 },
  '2020-03': { p: -0.04, a: -0.006, s: -0.125 },
  '2020-04': { p: 0.03, a: 0.012, s: 0.127 },
  '2022-01': { p: -0.008, a: -0.022, s: -0.052 },
  '2022-04': { p: -0.012, a: -0.038, s: -0.088 },
  '2022-06': { p: -0.01, a: -0.016, s: -0.083 },
  '2022-09': { p: -0.014, a: -0.043, s: -0.093 },
  '2022-12': { p: -0.004, a: -0.005, s: -0.059 },
  '2023-11': { p: 0.02, a: 0.046, s: 0.089 },
}

function buildPerformanceHistory(): PerformancePoint[] {
  const months = buildMonths()
  const rand = mulberry32(20190117)
  const cfg = {
    portfolio: { drift: 0.0044, noise: 0.006 },
    aggBond: { drift: 0.0018, noise: 0.0075 },
    sp500: { drift: 0.0098, noise: 0.032 },
  }
  let p = 100
  let a = 100
  let s = 100
  const out: PerformancePoint[] = []
  months.forEach((date, i) => {
    if (i > 0) {
      const ov = OVERLAYS[date.slice(0, 7)] ?? {}
      const rp = cfg.portfolio.drift + (rand() - 0.5) * 2 * cfg.portfolio.noise + (ov.p ?? 0)
      const ra = cfg.aggBond.drift + (rand() - 0.5) * 2 * cfg.aggBond.noise + (ov.a ?? 0)
      const rs = cfg.sp500.drift + (rand() - 0.5) * 2 * cfg.sp500.noise + (ov.s ?? 0)
      p *= 1 + rp
      a *= 1 + ra
      s *= 1 + rs
    }
    out.push({ date, portfolio: round2(p), aggBond: round2(a), sp500: round2(s) })
  })
  return out
}

export const performanceHistory: PerformancePoint[] = buildPerformanceHistory()

type SeriesKey = 'portfolio' | 'aggBond' | 'sp500'

const seriesLevels = (key: SeriesKey) => performanceHistory.map((pt) => pt[key])

// Annualized return over the trailing `months` observations.
function annualizedOver(levels: number[], months: number): number {
  const n = levels.length
  const span = Math.min(months, n - 1)
  const start = levels[n - 1 - span]
  const end = levels[n - 1]
  return (Math.pow(end / start, 12 / span) - 1) * 100
}

// Annualized volatility (std-dev of monthly returns × √12).
function annualizedVol(levels: number[]): number {
  const rets: number[] = []
  for (let i = 1; i < levels.length; i += 1) rets.push(levels[i] / levels[i - 1] - 1)
  const mean = rets.reduce((x, y) => x + y, 0) / rets.length
  const variance = rets.reduce((x, y) => x + (y - mean) ** 2, 0) / rets.length
  return Math.sqrt(variance) * Math.sqrt(12) * 100
}

function statsFor(key: SeriesKey, name: string, color: string): ReturnStats {
  const levels = seriesLevels(key)
  return {
    key,
    name,
    color,
    oneYearPct: round2(annualizedOver(levels, 12)),
    threeYearPct: round2(annualizedOver(levels, 36)),
    fiveYearPct: round2(annualizedOver(levels, 60)),
    sinceInceptionPct: round2(annualizedOver(levels, levels.length - 1)),
    volatilityPct: round2(annualizedVol(levels)),
  }
}

export const performanceStats: ReturnStats[] = [
  statsFor('portfolio', 'Sit Invest Portfolio', '#0b2545'),
  statsFor('aggBond', 'Bloomberg US Agg Bond', '#c9a227'),
  statsFor('sp500', 'S&P 500 Index', '#1f8a5b'),
]

const levelAt = (date: string) =>
  performanceHistory.find((pt) => pt.date === date)?.portfolio ?? null

function calendarYearReturns(): YearReturn[] {
  const out: YearReturn[] = []
  for (let y = 2019; y <= 2025; y += 1) {
    const dec = levelAt(`${y}-12-01`)
    const prevDec = y === 2019 ? performanceHistory[0].portfolio : levelAt(`${y - 1}-12-01`)
    if (dec != null && prevDec != null) {
      out.push({ year: y, returnPct: round2((dec / prevDec - 1) * 100) })
    }
  }
  return out
}

const yearReturns = calendarYearReturns()
const bestYear = yearReturns.reduce((a, b) => (b.returnPct > a.returnPct ? b : a))
const worstYear = yearReturns.reduce((a, b) => (b.returnPct < a.returnPct ? b : a))
const portfolioLevels = seriesLevels('portfolio')

export const performanceSummary: PerformanceSummary = {
  inceptionDate: INCEPTION,
  currentValue: summary.totalValue,
  sinceInceptionTotalReturnPct: round2(
    (portfolioLevels[portfolioLevels.length - 1] / portfolioLevels[0] - 1) * 100,
  ),
  annualizedReturnPct: round2(annualizedOver(portfolioLevels, portfolioLevels.length - 1)),
  bestYear,
  worstYear,
}

// ---- Credit quality (derived from the holdings' Moody's / Fitch ratings) ----

const MOODY_SCALE = ['Aaa', 'Aa1', 'Aa2', 'Aa3', 'A1', 'A2', 'A3', 'Baa1', 'Baa2', 'Baa3']
const FITCH_SCALE = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-']
const MOODY_ORDER = ['Aaa', 'Aa', 'A', 'Baa', 'Ba', 'B']
const FITCH_ORDER = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B']

function moodyBand(r: string): string {
  if (r.startsWith('Aaa')) return 'Aaa'
  if (r.startsWith('Aa')) return 'Aa'
  if (r.startsWith('Baa')) return 'Baa'
  if (r.startsWith('Ba')) return 'Ba'
  if (r.startsWith('A')) return 'A'
  return 'B'
}
function fitchBand(r: string): string {
  if (r.startsWith('AAA')) return 'AAA'
  if (r.startsWith('AA')) return 'AA'
  if (r.startsWith('BBB')) return 'BBB'
  if (r.startsWith('BB')) return 'BB'
  if (r.startsWith('A')) return 'A'
  return 'B'
}

const holdingsTotal = holdings.reduce((s, h) => s + h.marketValue, 0)

function rollup(getBand: (h: Holding) => string, order: string[]): RatingBucket[] {
  const map = new Map<string, number>()
  for (const h of holdings) {
    const band = getBand(h)
    map.set(band, (map.get(band) ?? 0) + h.marketValue)
  }
  return order
    .filter((b) => map.has(b))
    .map((b) => ({
      rating: b,
      marketValue: map.get(b) as number,
      pct: round2(((map.get(b) as number) / holdingsTotal) * 100),
    }))
}

function weightedAverage(scale: string[], getRating: (h: Holding) => string): string {
  let acc = 0
  for (const h of holdings) {
    const idx = scale.indexOf(getRating(h))
    acc += (idx < 0 ? 0 : idx) * h.marketValue
  }
  const avgIdx = Math.round(acc / holdingsTotal)
  return scale[Math.min(avgIdx, scale.length - 1)]
}

export const creditQuality: CreditQuality = {
  moodys: rollup((h) => moodyBand(h.moodys), MOODY_ORDER),
  fitch: rollup((h) => fitchBand(h.fitch), FITCH_ORDER),
  weightedAverageMoodys: weightedAverage(MOODY_SCALE, (h) => h.moodys),
  weightedAverageFitch: weightedAverage(FITCH_SCALE, (h) => h.fitch),
}
