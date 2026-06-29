import { useMemo, useState } from 'react'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, Loader, StatCard } from '../components/ui'
import { GrowthChart, type GrowthPoint } from '../components/charts/GrowthChart'
import { CreditRatingChart } from '../components/charts/CreditRatingChart'
import type { PerformancePoint, RatingBucket } from '../data/types'
import { formatCurrency, formatDate, formatPct } from '../utils/format'
import './pages.css'

type Range = '1Y' | '3Y' | '5Y' | 'SI'
const RANGES: { key: Range; label: string; months: number }[] = [
  { key: '1Y', label: '1Y', months: 12 },
  { key: '3Y', label: '3Y', months: 36 },
  { key: '5Y', label: '5Y', months: 60 },
  { key: 'SI', label: 'Since Inception', months: Infinity },
]

// Re-base a slice of the monthly index history to a "growth of $10,000" series.
function toGrowth(history: PerformancePoint[], months: number): GrowthPoint[] {
  const n = history.length
  const startIdx = months === Infinity ? 0 : Math.max(0, n - 1 - months)
  const slice = history.slice(startIdx)
  const base = slice[0]
  return slice.map((pt) => ({
    date: pt.date,
    portfolio: Math.round((10000 * pt.portfolio) / base.portfolio),
    aggBond: Math.round((10000 * pt.aggBond) / base.aggBond),
    sp500: Math.round((10000 * pt.sp500) / base.sp500),
  }))
}

export default function PerformancePage() {
  const { data, loading, error } = useAsync(() => api.getPerformance(), [])
  const [range, setRange] = useState<Range>('SI')

  const months = RANGES.find((r) => r.key === range)!.months
  const growth = useMemo(
    () => (data ? toGrowth(data.history, months) : []),
    [data, months],
  )

  if (loading) return <Loader label="Loading performance…" />
  if (error || !data) return <Card title="Unable to load">{error ?? 'Please try again.'}</Card>

  const { summary, stats, credit } = data

  return (
    <div className="stack">
      {/* Headline cards */}
      <div className="perf-stat-grid">
        <StatCard
          label="Total Return"
          value={formatPct(summary.sinceInceptionTotalReturnPct)}
          hint="since inception"
          accent
        />
        <StatCard
          label="Annualized"
          value={formatPct(summary.annualizedReturnPct)}
          hint={`since ${formatDate(summary.inceptionDate, { month: 'short' })}`}
        />
        <StatCard
          label="Best Year"
          value={formatPct(summary.bestYear.returnPct, true)}
          deltaTone="up"
          hint={String(summary.bestYear.year)}
        />
        <StatCard
          label="Worst Year"
          value={formatPct(summary.worstYear.returnPct, true)}
          deltaTone="down"
          hint={String(summary.worstYear.year)}
        />
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(summary.currentValue)}
          hint="current"
        />
      </div>

      {/* Growth of $10,000 */}
      <Card
        title="Growth of $10,000"
        subtitle={`Hypothetical investment since ${formatDate(summary.inceptionDate)}`}
        action={
          <div className="range-toggle" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.key}
                className={range === r.key ? 'active' : ''}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      >
        <GrowthChart data={growth} />
      </Card>

      {/* Trailing returns comparison */}
      <Card
        pad={false}
        title="Returns &amp; Risk"
        subtitle="Annualized total returns and volatility"
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Index</th>
                <th className="num">1-Year</th>
                <th className="num">3-Year</th>
                <th className="num">5-Year</th>
                <th className="num">Since Inception</th>
                <th className="num">Volatility</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.key}>
                  <td>
                    <span className="legend-dot" style={{ background: s.color }} />
                    <span className="t-strong">{s.name}</span>
                  </td>
                  <td className={`num ${s.oneYearPct >= 0 ? 'pos' : 'neg'}`}>
                    {formatPct(s.oneYearPct, true)}
                  </td>
                  <td className={`num ${s.threeYearPct >= 0 ? 'pos' : 'neg'}`}>
                    {formatPct(s.threeYearPct, true)}
                  </td>
                  <td className={`num ${s.fiveYearPct >= 0 ? 'pos' : 'neg'}`}>
                    {formatPct(s.fiveYearPct, true)}
                  </td>
                  <td className={`num ${s.sinceInceptionPct >= 0 ? 'pos' : 'neg'}`}>
                    {formatPct(s.sinceInceptionPct, true)}
                  </td>
                  <td className="num">{formatPct(s.volatilityPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Credit quality */}
      <Card title="Credit Quality" subtitle="Portfolio holdings by rating agency">
        <div className="credit-avg">
          <span>Weighted-average credit quality</span>
          <strong>
            {credit.weightedAverageMoodys} <em>(Moody&rsquo;s)</em> &nbsp;·&nbsp;{' '}
            {credit.weightedAverageFitch} <em>(Fitch)</em>
          </strong>
        </div>

        <div className="credit-grid">
          <CreditColumn title="Moody&rsquo;s" buckets={credit.moodys} />
          <CreditColumn title="Fitch" buckets={credit.fitch} />
        </div>
      </Card>
    </div>
  )
}

function CreditColumn({ title, buckets }: { title: string; buckets: RatingBucket[] }) {
  return (
    <div className="credit-col">
      <h3 className="credit-col-title">{title}</h3>
      <CreditRatingChart data={buckets} />
      <table className="data-table credit-table">
        <thead>
          <tr>
            <th>Rating</th>
            <th className="num">Market Value</th>
            <th className="num">Weight</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.rating}>
              <td>
                <span className="rating-pill">{b.rating}</span>
              </td>
              <td className="num t-strong">{formatCurrency(b.marketValue)}</td>
              <td className="num">{b.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
