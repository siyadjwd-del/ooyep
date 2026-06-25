import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { query } from './db.js'

// ---------------------------------------------------------------------------
// Sit Invest portal API.
//
// Each route returns JSON in exactly the shape the frontend expects (see
// src/data/types.ts). The SQL below is illustrative — adjust the table and
// column names to match YOUR schema in SSMS. Search for "TODO: schema".
// ---------------------------------------------------------------------------

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// ---- Auth middleware ------------------------------------------------------
function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    req.client = jwt.verify(token, JWT_SECRET) // { clientId, ... }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Small wrapper so a thrown error becomes a clean 500 instead of crashing.
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err)
    res.status(500).json({ error: 'Server error', detail: err.message })
  })

// ---- Health ---------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ---- Login ----------------------------------------------------------------
// POST /api/auth/login  { email, password }  ->  { token, client }
app.post(
  '/api/auth/login',
  wrap(async (req, res) => {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // TODO: schema — look the client up and verify the password hash.
    // NEVER store plain passwords; compare against a hash (e.g. bcrypt).
    const rows = await query(
      `SELECT TOP 1 ClientId AS id, FullName AS name, Email AS email,
              AdvisorName AS advisorName, AdvisorEmail AS advisorEmail,
              AccountNumber AS accountNumber, MemberSince AS memberSince,
              PasswordHash AS passwordHash
       FROM dbo.Clients WHERE Email = @email`,
      { email },
    )
    const row = rows[0]
    // const ok = row && (await bcrypt.compare(password, row.passwordHash))
    const ok = Boolean(row) // TODO: replace with real password verification
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    const { passwordHash, ...client } = row
    const token = jwt.sign({ clientId: client.id }, JWT_SECRET, { expiresIn: '12h' })
    res.json({ token, client })
  }),
)

// ---- Dashboard (everything the overview needs in one call) ---------------
app.get(
  '/api/dashboard',
  auth,
  wrap(async (req, res) => {
    const clientId = req.client.clientId

    // TODO: schema — adapt these queries to your tables.
    const [client] = await query(
      `SELECT ClientId AS id, FullName AS name, Email AS email,
              AdvisorName AS advisorName, AdvisorEmail AS advisorEmail,
              AccountNumber AS accountNumber, MemberSince AS memberSince
       FROM dbo.Clients WHERE ClientId = @clientId`,
      { clientId },
    )

    const [summary] = await query(
      `SELECT TotalValue AS totalValue, CostBasis AS totalCostBasis,
              YtdReturnPct AS ytdReturnPct, EstAnnualIncome AS estAnnualIncome,
              AvgYieldPct AS avgYieldPct, AvgRating AS avgRating,
              CashBalance AS cashBalance, AsOf AS asOf
       FROM dbo.PortfolioSummary WHERE ClientId = @clientId`,
      { clientId },
    )

    const valueHistory = await query(
      `SELECT CONVERT(varchar(10), AsOfDate, 23) AS date, MarketValue AS value
       FROM dbo.PortfolioValueHistory
       WHERE ClientId = @clientId ORDER BY AsOfDate`,
      { clientId },
    )

    const allocation = await query(
      `SELECT SectorName AS name, MarketValue AS value, ColorHex AS color
       FROM dbo.AllocationBySector WHERE ClientId = @clientId`,
      { clientId },
    )

    const maturityLadder = await query(
      `SELECT MaturityYear AS label, SUM(MarketValue) AS value
       FROM dbo.Holdings WHERE ClientId = @clientId
       GROUP BY MaturityYear ORDER BY MaturityYear`,
      { clientId },
    )

    const holdings = await query(
      `SELECT HoldingId AS id, Issuer AS issuer, BondType AS type, Cusip AS cusip,
              CouponPct AS couponPct, YieldPct AS yieldPct, Rating AS rating,
              Maturity AS maturity, FaceValue AS faceValue,
              MarketValue AS marketValue, GainPct AS gainPct
       FROM dbo.Holdings WHERE ClientId = @clientId ORDER BY MarketValue DESC`,
      { clientId },
    )

    const couponCalendar = await query(
      `SELECT PaymentId AS id, Issuer AS issuer, PayDate AS date,
              Amount AS amount, Status AS status
       FROM dbo.CouponPayments WHERE ClientId = @clientId ORDER BY PayDate`,
      { clientId },
    )

    res.json({ client, summary, valueHistory, allocation, maturityLadder, holdings, couponCalendar })
  }),
)

// ---- Statements -----------------------------------------------------------
app.get(
  '/api/statements',
  auth,
  wrap(async (req, res) => {
    const rows = await query(
      `SELECT DocumentId AS id, Period AS period, IssuedDate AS date,
              DocType AS type, SizeKb AS sizeKb
       FROM dbo.Documents WHERE ClientId = @clientId ORDER BY IssuedDate DESC`,
      { clientId: req.client.clientId },
    )
    res.json(rows)
  }),
)

// ---- Messages -------------------------------------------------------------
app.get(
  '/api/messages',
  auth,
  wrap(async (req, res) => {
    const rows = await query(
      `SELECT MessageId AS id, Sender AS [from], Author AS author,
              Body AS body, SentAt AS sentAt
       FROM dbo.Messages WHERE ClientId = @clientId ORDER BY SentAt`,
      { clientId: req.client.clientId },
    )
    res.json(rows)
  }),
)

app.post(
  '/api/messages',
  auth,
  wrap(async (req, res) => {
    const { body } = req.body ?? {}
    if (!body) return res.status(400).json({ error: 'Message body required' })
    const [row] = await query(
      `INSERT INTO dbo.Messages (ClientId, Sender, Author, Body, SentAt)
       OUTPUT INSERTED.MessageId AS id, INSERTED.Sender AS [from],
              INSERTED.Author AS author, INSERTED.Body AS body, INSERTED.SentAt AS sentAt
       VALUES (@clientId, 'client', @author, @body, SYSUTCDATETIME())`,
      { clientId: req.client.clientId, author: req.client.name || 'Client', body },
    )
    res.status(201).json(row)
  }),
)

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => console.log(`[api] Sit Invest portal API on http://localhost:${PORT}`))
