import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, Loader } from '../components/ui'
import { formatCurrency, formatDate, formatPct } from '../utils/format'
import './pages.css'

export default function HoldingsPage() {
  const { data, loading, error } = useAsync(() => api.getDashboard(), [])

  if (loading) return <Loader label="Loading holdings…" />
  if (error || !data) return <Card title="Unable to load">{error ?? 'Please try again.'}</Card>

  const { holdings } = data
  const totalValue = holdings.reduce((s, h) => s + h.marketValue, 0)
  const totalFace = holdings.reduce((s, h) => s + h.faceValue, 0)

  return (
    <div className="stack">
      <div className="page-intro">
        <div>
          <h2>{holdings.length} fixed income positions</h2>
          <p>
            Every bond in your portfolio with its coupon, yield, credit rating and maturity.
            Market values update daily.
          </p>
        </div>
      </div>

      <Card pad={false} title="Holdings" subtitle={`Total market value ${formatCurrency(totalValue)}`}>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Issuer</th>
                <th>Type</th>
                <th>Rating</th>
                <th className="num">Coupon</th>
                <th className="num">Yield</th>
                <th>Maturity</th>
                <th className="num">Face</th>
                <th className="num">Market Value</th>
                <th className="num">Gain</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id}>
                  <td>
                    <div className="t-strong">{h.issuer}</div>
                    <div className="t-muted">{h.cusip}</div>
                  </td>
                  <td>
                    <span className="type-pill">{h.type}</span>
                  </td>
                  <td>
                    <span className="rating-pill">{h.rating}</span>
                  </td>
                  <td className="num">{formatPct(h.couponPct)}</td>
                  <td className="num">{formatPct(h.yieldPct)}</td>
                  <td>{formatDate(h.maturity)}</td>
                  <td className="num">{formatCurrency(h.faceValue)}</td>
                  <td className="num t-strong">{formatCurrency(h.marketValue)}</td>
                  <td className={`num ${h.gainPct >= 0 ? 'pos' : 'neg'}`}>
                    {formatPct(h.gainPct, true)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="t-strong">
                  Total
                </td>
                <td className="num t-strong">{formatCurrency(totalFace)}</td>
                <td className="num t-strong">{formatCurrency(totalValue)}</td>
                <td className="num pos">
                  {formatPct(((totalValue - totalFace) / totalFace) * 100, true)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
