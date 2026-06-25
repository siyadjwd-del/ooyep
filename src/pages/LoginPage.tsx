import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'
import './LoginPage.css'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@sitinvest.com')
  const [password, setPassword] = useState('demo1234')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch {
      /* error surfaced via context */
    }
  }

  return (
    <div className="login">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="login-brand-top">
          <Logo size={34} light />
        </div>
        <div className="login-brand-mid">
          <h1>
            Your fixed income,
            <br />
            <span>in clear focus.</span>
          </h1>
          <p>
            Track your portfolio, review monthly statements, and stay in step with your
            advisor — all in one secure place.
          </p>
          <ul className="login-points">
            <li>Live portfolio value &amp; allocation</li>
            <li>Coupon &amp; income schedule</li>
            <li>Secure statement vault</li>
          </ul>
        </div>
        <p className="login-brand-foot">
          © {new Date().getFullYear()} Sit Invest. Member SIPC. For illustration only.
        </p>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <div className="login-card-brand">
            <Logo size={30} />
          </div>
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to your client portal.</p>

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-gold login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in securely'}
          </button>

          <div className="login-demo">
            <strong>Demo access</strong>
            <span>Use the pre-filled credentials, or any email/password to explore.</span>
          </div>

          <a className="login-help" href="mailto:support@sitinvest.com">
            Need help signing in?
          </a>
        </form>
      </div>
    </div>
  )
}
