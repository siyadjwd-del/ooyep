import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, Loader, StatCard } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'
import './pages.css'

export default function IncomePage() {
  const { data, loading, error } = useAsync(() => api.getDashboard(), [])

  if (loading) return <Loader label="Loading income schedule…" />
  if (error || !data) return <Card title="Unable to load">{error ?? 'Please try again.'}</Card>

  const { couponCalendar, summary } = data
  const upcoming = couponCalendar
    .filter((c) => c.status === 'scheduled')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  const paid = couponCalendar
    .filter((c) => c.status === 'paid')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const scheduledTotal = upcoming.reduce((s, c) => s + c.amount, 0)
  const paidThisYear = paid.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="stack">
      <div className="stat-grid">
        <StatCard label="Est. Annual Income" value={formatCurrency(summary.estAnnualIncome)} hint="projected" accent />
        <StatCard label="Avg. Yield" value={`${summary.avgYieldPct.toFixed(2)}%`} hint="portfolio weighted" />
        <StatCard label="Upcoming (scheduled)" value={formatCurrency(scheduledTotal)} hint={`${upcoming.length} payments`} />
        <StatCard label="Received recently" value={formatCurrency(paidThisYear)} hint="last payments" />
      </div>

      <div className="grid-2">
        <Card title="Upcoming Coupons" subtitle="Scheduled payments to your account">
          <ul className="coupon-list">
            {upcoming.map((c) => (
              <li key={c.id} className="coupon-row">
                <div className="coupon-date">
                  <span className="d">{new Date(c.date).getDate()}</span>
                  <span className="m">
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="coupon-main">
                  <div className="coupon-issuer">{c.issuer}</div>
                  <div className="coupon-meta">{formatDate(c.date, { weekday: 'long' })}</div>
                </div>
                <div className="coupon-amt">+{formatCurrency(c.amount)}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recently Paid" subtitle="Coupons deposited">
          <ul className="coupon-list">
            {paid.map((c) => (
              <li key={c.id} className="coupon-row">
                <div className="coupon-date">
                  <span className="d">{new Date(c.date).getDate()}</span>
                  <span className="m">
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="coupon-main">
                  <div className="coupon-issuer">{c.issuer}</div>
                  <div className="coupon-meta">
                    <span className="tag up" style={{ padding: '1px 8px' }}>
                      Paid
                    </span>
                  </div>
                </div>
                <div className="coupon-amt" style={{ color: 'var(--ink-soft)' }}>
                  {formatCurrency(c.amount)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
