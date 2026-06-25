import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, Loader, StatCard } from '../components/ui'
import { PortfolioValueChart } from '../components/charts/PortfolioValueChart'
import { AllocationPie } from '../components/charts/AllocationPie'
import { MaturityLadderChart } from '../components/charts/MaturityLadderChart'
import { formatCurrency, formatDate, formatPct } from '../utils/format'
import './pages.css'

export default function DashboardPage() {
  const { data, loading, error } = useAsync(() => api.getDashboard(), [])

  if (loading) return <Loader />
  if (error || !data)
    return <Card title="Unable to load">{error ?? 'Please try again.'}</Card>

  const { client, summary, valueHistory, allocation, maturityLadder, couponCalendar } = data
  const gain = summary.totalValue - summary.totalCostBasis
  const gainPct = (gain / summary.totalCostBasis) * 100
  const nextCoupon = couponCalendar
    .filter((c) => c.status === 'scheduled')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0]

  return (
    <div className="stack">
      <div className="banner">
        <span style={{ fontSize: 20 }}>👋</span>
        <span>
          Welcome back, <strong>{client.name.split(' ')[0]}</strong>. Your portfolio is up{' '}
          <strong>{formatPct(summary.ytdReturnPct, true)}</strong> year-to-date. Values as of{' '}
          {formatDate(summary.asOf)}.
        </span>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(summary.totalValue)}
          delta={formatPct(gainPct, true)}
          deltaTone="up"
          hint="all-time"
          accent
        />
        <StatCard
          label="YTD Return"
          value={formatPct(summary.ytdReturnPct)}
          delta={formatCurrency(gain, { signDisplay: 'always' })}
          deltaTone="up"
          hint="vs cost basis"
        />
        <StatCard
          label="Est. Annual Income"
          value={formatCurrency(summary.estAnnualIncome)}
          hint={`${formatPct(summary.avgYieldPct)} avg yield`}
        />
        <StatCard
          label="Avg. Credit Quality"
          value={summary.avgRating}
          hint={`${formatCurrency(summary.cashBalance)} cash`}
        />
      </div>

      <div className="grid-2">
        <Card
          title="Portfolio Value"
          subtitle="Trailing 12 months"
          action={<span className="tag up">{formatPct(summary.ytdReturnPct, true)} YTD</span>}
        >
          <PortfolioValueChart data={valueHistory} />
        </Card>

        <Card title="Asset Allocation" subtitle="By sector">
          <AllocationPie data={allocation} />
        </Card>
      </div>

      <div className="grid-2">
        <Card
          title="Maturity Ladder"
          subtitle="Market value maturing by year"
          action={
            <Link to="/holdings" className="tag">
              View holdings →
            </Link>
          }
        >
          <MaturityLadderChart data={maturityLadder} />
        </Card>

        <Card
          title="Next Payment"
          subtitle="Upcoming coupon"
          action={
            <Link to="/income" className="tag">
              Income →
            </Link>
          }
        >
          {nextCoupon && (
            <div style={{ paddingBottom: 4 }}>
              <p style={{ margin: '4px 0 18px', fontSize: 14, color: 'var(--ink-soft)' }}>
                Your next coupon is scheduled for{' '}
                <strong>{formatDate(nextCoupon.date)}</strong>.
              </p>
              <div className="stat-value" style={{ fontSize: 34, color: 'var(--green)' }}>
                {formatCurrency(nextCoupon.amount)}
              </div>
              <p className="t-muted" style={{ marginTop: 4 }}>
                from {nextCoupon.issuer}
              </p>
            </div>
          )}
          <ul className="mini-list" style={{ marginTop: 14 }}>
            <li className="mini-row">
              <span className="k">Cost basis</span>
              <span className="v">{formatCurrency(summary.totalCostBasis)}</span>
            </li>
            <li className="mini-row">
              <span className="k">Unrealized gain</span>
              <span className="v" style={{ color: 'var(--green)' }}>
                {formatCurrency(gain, { signDisplay: 'always' })}
              </span>
            </li>
            <li className="mini-row">
              <span className="k">Member since</span>
              <span className="v">{formatDate(client.memberSince, { month: 'long' })}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
