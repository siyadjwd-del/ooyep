import type { ReactNode } from 'react'
import './ui.css'

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  pad = true,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={pad ? 'card-body' : 'card-body card-body--flush'}>{children}</div>
    </section>
  )
}

export function StatCard({
  label,
  value,
  delta,
  deltaTone,
  hint,
  accent = false,
}: {
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down'
  hint?: string
  accent?: boolean
}) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <div className="stat-foot">
        {delta && <span className={`tag ${deltaTone ?? ''}`}>{delta}</span>}
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  )
}

export function Loader({ label = 'Loading your portfolio…' }: { label?: string }) {
  return (
    <div className="loader">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>
}
