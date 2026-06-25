import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AllocationSlice } from '../../data/types'
import { formatCurrency } from '../../utils/format'

export function AllocationPie({ data }: { data: AllocationSlice[] }) {
  const total = data.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="alloc-wrap">
      <div className="alloc-chart">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, name) => [
                `${formatCurrency(v)} · ${((v / total) * 100).toFixed(1)}%`,
                name as string,
              ]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e4eaf1',
                boxShadow: '0 8px 24px rgba(8,27,52,0.12)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="alloc-center">
          <span className="alloc-center-label">Total</span>
          <span className="alloc-center-value">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="alloc-legend">
        {data.map((slice) => (
          <li key={slice.name}>
            <span className="alloc-dot" style={{ background: slice.color }} />
            <span className="alloc-name">{slice.name}</span>
            <span className="alloc-pct">{((slice.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
