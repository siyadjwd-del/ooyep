import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ValuePoint } from '../../data/types'
import { formatCompact, formatCurrency, formatMonth } from '../../utils/format'

export function PortfolioValueChart({ data }: { data: ValuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4373" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#1d4373" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf1" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatMonth}
          tick={{ fontSize: 12, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis
          tickFormatter={(v) => `$${formatCompact(v)}`}
          tick={{ fontSize: 12, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
          width={60}
          domain={['dataMin - 20000', 'dataMax + 20000']}
        />
        <Tooltip
          formatter={(v: number) => [formatCurrency(v), 'Portfolio value']}
          labelFormatter={(l) => formatMonth(l as string)}
          contentStyle={tooltipStyle}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#0b2545"
          strokeWidth={2.5}
          fill="url(#valueFill)"
          dot={false}
          activeDot={{ r: 5, fill: '#c9a227', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid #e4eaf1',
  boxShadow: '0 8px 24px rgba(8,27,52,0.12)',
  fontSize: 13,
}
