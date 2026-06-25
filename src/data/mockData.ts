import type {
  AllocationSlice,
  Client,
  CouponPayment,
  Holding,
  MaturityBucket,
  Message,
  PortfolioSummary,
  Statement,
  ValuePoint,
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
