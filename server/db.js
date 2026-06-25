import sql from 'mssql'
import 'dotenv/config'

// ---------------------------------------------------------------------------
// Microsoft SQL Server connection pool.
// One shared pool is created lazily and reused across requests.
// ---------------------------------------------------------------------------

const config = {
  server: process.env.SQL_SERVER || 'localhost',
  port: Number(process.env.SQL_PORT || 1433),
  database: process.env.SQL_DATABASE || 'SitInvest',
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: process.env.SQL_ENCRYPT !== 'false',
    trustServerCertificate: process.env.SQL_TRUST_CERT === 'true',
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
}

let poolPromise = null

export function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log('[db] connected to SQL Server:', config.server, '/', config.database)
        return pool
      })
      .catch((err) => {
        poolPromise = null
        console.error('[db] connection failed:', err.message)
        throw err
      })
  }
  return poolPromise
}

// Helper: run a parameterised query safely (avoids SQL injection).
// Usage: await query('SELECT * FROM Holdings WHERE ClientId=@clientId', { clientId })
export async function query(text, params = {}) {
  const pool = await getPool()
  const request = pool.request()
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value)
  }
  const result = await request.query(text)
  return result.recordset
}

export { sql }
