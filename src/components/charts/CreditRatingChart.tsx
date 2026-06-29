import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RatingBucket } from '../../data/types'
import { formatCompact, formatCurrency } from '../../utils/format'

// Color ramp from highest credit quality (navy) to lower (gold), by position.
const RAMP = ['#0b2545', '#1d4373', '#2d5a8c', '#c9a227', '#d8b54a', '#9fb3c8']

export function CreditRatingChart({ data }: { data: RatingBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf1" vertical={false} />
        <XAxis
          dataKey="rating"
          tick={{ fontSize: 12, fill: '#51606e', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${formatCompact(v)}`}
          tick={{ fontSize: 11, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          cursor={{ fill: 'rgba(29,67,115,0.06)' }}
          formatter={(v: number, _n, item) => [
            `${formatCurrency(v)} · ${(item?.payload as RatingBucket).pct}%`,
            'Market value',
          ]}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #e4eaf1',
            boxShadow: '0 8px 24px rgba(8,27,52,0.12)',
            fontSize: 13,
          }}
        />
        <Bar dataKey="marketValue" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={RAMP[i % RAMP.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
