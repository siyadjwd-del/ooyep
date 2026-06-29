import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompact, formatCurrency, formatMonth } from '../../utils/format'

export interface GrowthPoint {
  date: string
  portfolio: number
  aggBond: number
  sp500: number
}

const SERIES = [
  { key: 'portfolio', name: 'Sit Invest Portfolio', color: '#0b2545', width: 2.6 },
  { key: 'aggBond', name: 'Bloomberg US Agg Bond', color: '#c9a227', width: 2 },
  { key: 'sp500', name: 'S&P 500 Index', color: '#1f8a5b', width: 2 },
] as const

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 6, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4eaf1" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatMonth}
          tick={{ fontSize: 12, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(v) => `$${formatCompact(v)}`}
          tick={{ fontSize: 12, fill: '#8a97a3' }}
          axisLine={false}
          tickLine={false}
          width={64}
          domain={['dataMin - 500', 'dataMax + 500']}
        />
        <Tooltip
          formatter={(v: number, name) => [formatCurrency(v), name as string]}
          labelFormatter={(l) => formatMonth(l as string)}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #e4eaf1',
            boxShadow: '0 8px 24px rgba(8,27,52,0.12)',
            fontSize: 13,
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="plainline"
          wrapperStyle={{ fontSize: 13 }}
        />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={s.width}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
