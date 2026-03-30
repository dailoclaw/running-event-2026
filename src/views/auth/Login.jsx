import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  CCard, CCardBody, CButton, CFormInput, CAlert, CSpinner,
} from '@coreui/react'

export default function Login() {
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'reset'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Hard redirect — most reliable way to ensure app loads after auth
      window.location.href = '/'
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await resetPassword(email)
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1F3864',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background splash subtle overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'url(/splash.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        opacity: 0.15,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        {/* Logo / brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/runner-192.png" alt="Running" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 16 }} />
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: 0.5 }}>
            Marathon Event Manager
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' }}>
            Adelaide 2026
          </div>
        </div>

        <CCard style={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <CCardBody style={{ padding: '32px' }}>
            {mode === 'login' ? (
              <>
                <h5 className="fw-bold mb-1">Sign In</h5>
                <p className="text-muted small mb-4">Enter your credentials to access the dashboard</p>

                {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <CFormInput
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label fw-semibold mb-0">Password</label>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        style={{ fontSize: 12 }}
                        onClick={() => { setMode('reset'); setError('') }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <CFormInput
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <CButton
                    type="submit"
                    color="primary"
                    className="w-100"
                    disabled={loading}
                    style={{ padding: '10px', fontWeight: 600 }}
                  >
                    {loading ? <CSpinner size="sm" className="me-2" /> : null}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </CButton>
                </form>
              </>
            ) : (
              <>
                <h5 className="fw-bold mb-1">Reset Password</h5>
                <p className="text-muted small mb-4">We'll send a reset link to your email</p>

                {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
                {resetSent && (
                  <CAlert color="success" className="mb-3">
                    Reset link sent! Check your email.
                  </CAlert>
                )}

                {!resetSent && (
                  <form onSubmit={handleReset}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Email</label>
                      <CFormInput
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                      {loading ? <CSpinner size="sm" className="me-2" /> : null}
                      Send Reset Link
                    </CButton>
                  </form>
                )}

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link btn-sm"
                    onClick={() => { setMode('login'); setError(''); setResetSent(false) }}
                  >
                    ← Back to sign in
                  </button>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 20 }}>
          Access restricted to authorised team members only
        </div>
      </div>
    </div>
  )
}
