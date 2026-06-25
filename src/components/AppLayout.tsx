import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'
import { initials } from '../utils/format'
import './AppLayout.css'

const NAV = [
  { to: '/', label: 'Overview', exact: true, icon: IconGrid },
  { to: '/holdings', label: 'Holdings', icon: IconList },
  { to: '/income', label: 'Income', icon: IconCalendar },
  { to: '/documents', label: 'Documents', icon: IconFolder },
  { to: '/messages', label: 'Messages', icon: IconChat },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Portfolio Overview',
  '/holdings': 'Holdings',
  '/income': 'Income & Coupons',
  '/documents': 'Documents Vault',
  '/messages': 'Messages',
}

export function AppLayout() {
  const { client, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = PAGE_TITLES[location.pathname] ?? 'Sit Invest'

  return (
    <div className="layout">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Logo size={30} light />
        </div>

        <nav className="sidebar-nav" onClick={() => setMobileOpen(false)}>
          {NAV.map(({ to, label, exact, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-advisor">
          <p className="sidebar-advisor-label">Your advisor</p>
          <p className="sidebar-advisor-name">{client?.advisorName}</p>
          <a className="sidebar-advisor-link" href={`mailto:${client?.advisorEmail}`}>
            Contact
          </a>
        </div>
      </aside>

      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button
            className="hamburger"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <div>
            <p className="topbar-eyebrow">Client Portal</p>
            <h1 className="topbar-title">{title}</h1>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="avatar">{client ? initials(client.name) : '–'}</div>
              <div className="user-meta">
                <span className="user-name">{client?.name}</span>
                <span className="user-acct">{client?.accountNumber}</span>
              </div>
            </div>
            <button className="btn btn-ghost" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/* ---------- inline icons (no dependency) ---------- */
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
function IconList() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  )
}
function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.3-4A8 8 0 1 1 21 12Z" />
    </svg>
  )
}
