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
import type { MaturityBucket } from '../../data/types'
import { formatCompact, formatCurrency } from '../../utils/format'

export function MaturityLadderChart({ data }: { data: MaturityBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf1" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `$${formatCompact(v)}`}
          tick={{ fontSize: 12, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: 'rgba(29,67,115,0.06)' }}
          formatter={(v: number) => [formatCurrency(v), 'Maturing']}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #e4eaf1',
            boxShadow: '0 8px 24px rgba(8,27,52,0.12)',
            fontSize: 13,
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? '#1d4373' : '#2d5a8c'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
