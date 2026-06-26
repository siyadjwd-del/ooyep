import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, Loader, StatCard } from '../components/ui'
import { formatCurrency } from '../utils/format'
import './pages.css'

type Range = '1Y' | '3Y' | '5Y' | 'SI'
const RANGES: Range[] = ['1Y', '3Y', '5Y', 'SI']

const COLORS = {
  portfolio: '#0b2545',
  bondIndex: '#c9a227',
  sp500: '#2d5a8c',
}

const MOODY_COLORS: Record<string, string> = {
  Aaa: '#0b2545', Aa1: '#1d4373', Aa2: '#2d5a8c', Aa3: '#3d6fa5',
  A1: '#c9a227', A2: '#d4b04c', A3: '#dfc070', Baa: '#9fb3c8', Cash: '#dce8f5',
}
const FITCH_COLORS: Record<string, string> = {
  AAA: '#0b2545', 'AA+': '#1d4373', AA: '#2d5a8c', 'AA-': '#3d6fa5',
  'A+': '#c9a227', A: '#d4b04c', 'A-': '#dfc070', BBB: '#9fb3c8', Cash: '#dce8f5',
}

/** Subtract months from a date string (YYYY-MM-01) */
function subtractMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() - months)
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export default function PerformancePage() {
  const { data, loading, error } = useAsync(() => api.getPerformance(), [])
  const [range, setRange] = useState<Range>('SI')

  const chartData = useMemo(() => {
    if (!data) return []
    const history = data.benchmarkHistory
    if (range === 'SI') return history

    const months = range === '1Y' ? 12 : range === '3Y' ? 36 : 60
    const lastDate = history[history.length - 1]?.date ?? ''
    const cutoff = subtractMonths(lastDate, months)

    const slice = history.filter((p) => p.date >= cutoff)
    if (slice.length === 0) return history

    // Re-base to $10,000 at the start of the slice
    const base = slice[0]
    return slice.map((p) => ({
      date: p.date,
      portfolio: Math.round((p.portfolio / base.portfolio) * 10_000),
      bondIndex: Math.round((p.bondIndex / base.bondIndex) * 10_000),
      sp500: Math.round((p.sp500 / base.sp500) * 10_000),
    }))
  }, [data, range])

  if (loading) return <Loader label="Loading performance data…" />
  if (error || !data) return <Card title="Unable to load">{error ?? 'Please try again.'}</Card>

  const { summary, returnTable, creditQuality } = data

  return (
    <div className="stack">
      {/* ── Headline Cards ── */}
      <div className="stat-grid">
        <StatCard
          label="Since-Inception Total Return"
          value={`${summary.sinceInceptionTotalReturnPct.toFixed(2)}%`}
          hint={`from ${new Date(summary.inceptionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          accent
        />
        <StatCard
          label="Annualised Return"
          value={`${summary.annualisedReturnPct.toFixed(2)}%`}
          hint="since inception"
        />
        <StatCard
          label="Best Year"
          value={`${summary.bestYear} · +${summary.bestYearReturnPct.toFixed(2)}%`}
          hint="calendar year"
        />
        <StatCard
          label="Worst Year"
          value={`${summary.worstYear} · ${summary.worstYearReturnPct.toFixed(2)}%`}
          hint="calendar year"
        />
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(summary.currentValue)}
          hint="current"
          accent
        />
      </div>

      {/* ── Growth Chart ── */}
      <Card
        title="Growth of $10,000"
        subtitle="Hypothetical growth since inception vs benchmarks"
      >
        <div className="perf-range-toggle">
          {RANGES.map((r) => (
            <button
              key={r}
              className={`chip-filter ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r === 'SI' ? 'Since Inception' : r}
            </button>
          ))}
        </div>
        <div style={{ height: 360, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5ecf2" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                }}
                minTickGap={40}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                width={60}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'portfolio'
                    ? 'Sit Invest Portfolio'
                    : name === 'bondIndex'
                    ? 'Bloomberg US Agg'
                    : 'S&P 500',
                ]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              />
              <Legend
                formatter={(value) =>
                  value === 'portfolio'
                    ? 'Sit Invest Portfolio'
                    : value === 'bondIndex'
                    ? 'Bloomberg US Agg Bond'
                    : 'S&P 500'
                }
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke={COLORS.portfolio}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="bondIndex"
                stroke={COLORS.bondIndex}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 3"
              />
              <Line
                type="monotone"
                dataKey="sp500"
                stroke={COLORS.sp500}
                strokeWidth={2}
                dot={false}
                strokeDasharray="2 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Return Comparison Table ── */}
      <Card title="Return Comparison" subtitle="Annualised returns and volatility">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Series</th>
                <th className="num">1-Year</th>
                <th className="num">3-Year</th>
                <th className="num">5-Year</th>
                <th className="num">Since Inception</th>
                <th className="num">Volatility</th>
              </tr>
            </thead>
            <tbody>
              {returnTable.map((row) => (
                <tr key={row.name}>
                  <td className="t-strong">{row.name}</td>
                  <td className={`num ${row.ret1Y != null && row.ret1Y < 0 ? 'neg' : 'pos'}`}>
                    {row.ret1Y != null ? `${row.ret1Y > 0 ? '+' : ''}${row.ret1Y.toFixed(2)}%` : '—'}
                  </td>
                  <td className={`num ${row.ret3Y != null && row.ret3Y < 0 ? 'neg' : 'pos'}`}>
                    {row.ret3Y != null ? `${row.ret3Y > 0 ? '+' : ''}${row.ret3Y.toFixed(2)}%` : '—'}
                  </td>
                  <td className={`num ${row.ret5Y != null && row.ret5Y < 0 ? 'neg' : 'pos'}`}>
                    {row.ret5Y != null ? `${row.ret5Y > 0 ? '+' : ''}${row.ret5Y.toFixed(2)}%` : '—'}
                  </td>
                  <td className={`num ${row.retSI < 0 ? 'neg' : 'pos'}`}>
                    {row.retSI > 0 ? '+' : ''}{row.retSI.toFixed(2)}%
                  </td>
                  <td className="num t-muted">{row.vol.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Credit Quality ── */}
      <div className="grid-2-even">
        {/* Moody's */}
        <Card
          title="Credit Quality — Moody's"
          subtitle={`Weighted avg: ${creditQuality.weightedAvgMoody}`}
        >
          <div style={{ height: 200, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={creditQuality.moody}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="rating" type="category" width={36} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Weight']} />
                <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                  {creditQuality.moody.map((entry) => (
                    <Cell key={entry.rating} fill={MOODY_COLORS[entry.rating] ?? '#9fb3c8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rating</th>
                <th className="num">Market Value</th>
                <th className="num">Weight</th>
              </tr>
            </thead>
            <tbody>
              {creditQuality.moody.map((b) => (
                <tr key={b.rating}>
                  <td><span className="rating-pill">{b.rating}</span></td>
                  <td className="num">{formatCurrency(b.marketValue)}</td>
                  <td className="num">{b.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Fitch */}
        <Card
          title="Credit Quality — Fitch"
          subtitle={`Weighted avg: ${creditQuality.weightedAvgFitch}`}
        >
          <div style={{ height: 200, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={creditQuality.fitch}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="rating" type="category" width={36} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Weight']} />
                <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                  {creditQuality.fitch.map((entry) => (
                    <Cell key={entry.rating} fill={FITCH_COLORS[entry.rating] ?? '#9fb3c8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rating</th>
                <th className="num">Market Value</th>
                <th className="num">Weight</th>
              </tr>
            </thead>
            <tbody>
              {creditQuality.fitch.map((b) => (
                <tr key={b.rating}>
                  <td><span className="rating-pill">{b.rating}</span></td>
                  <td className="num">{formatCurrency(b.marketValue)}</td>
                  <td className="num">{b.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
                  }
