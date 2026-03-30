import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CCard, CCardBody, CButton, CFormInput, CAlert, CSpinner } from '@coreui/react'

export default function SetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Exchange the token_hash from the URL for a real session
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const token_hash = params.get('token_hash')
    const type = params.get('type') // 'invite' or 'recovery'

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type })
        .then(({ error }) => {
          if (error) {
            setError('This link has expired or already been used. Please request a new one.')
          } else {
            setSessionReady(true)
            // Clean up the URL hash so it's not reused
            window.history.replaceState(null, '', window.location.pathname)
          }
          setVerifying(false)
        })
    } else {
      // No token in URL — check if we already have a session (e.g. PASSWORD_RECOVERY event)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSessionReady(true)
        else setError('Invalid or missing reset link. Please request a new one.')
        setVerifying(false)
      })
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
    // Give Supabase a moment to update the session, then go to app
    setTimeout(() => { window.location.href = '/' }, 1500)
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
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'url(/splash.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        opacity: 0.15,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/runner-192.png" alt="Running" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 16 }} />
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>Marathon Event Manager</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' }}>
            Adelaide 2026
          </div>
        </div>

        <CCard style={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          <CCardBody style={{ padding: '32px' }}>

            {/* Verifying token */}
            {verifying && (
              <div className="text-center py-3">
                <CSpinner color="primary" className="mb-3" />
                <div className="text-muted">Verifying your link...</div>
              </div>
            )}

            {/* Error state */}
            {!verifying && error && !sessionReady && (
              <>
                <CAlert color="danger">{error}</CAlert>
                <CButton color="secondary" className="w-100 mt-2" onClick={() => window.location.href = '/'}>
                  Back to Sign In
                </CButton>
              </>
            )}

            {/* Success — password set — auto redirect */}
            {done && (
              <div className="text-center">
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h5 className="fw-bold mb-2">Password set!</h5>
                <p className="text-muted mb-4">Taking you to the dashboard...</p>
                <CSpinner color="primary" />
              </div>
            )}

            {/* Set password form */}
            {!verifying && sessionReady && !done && (
              <>
                <h5 className="fw-bold mb-1">Set Your Password</h5>
                <p className="text-muted small mb-4">Choose a password to secure your account.</p>

                {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">New Password</label>
                    <CFormInput
                      type="password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Confirm Password</label>
                    <CFormInput
                      type="password"
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <CButton type="submit" color="primary" className="w-100" disabled={loading} style={{ padding: 10, fontWeight: 600 }}>
                    {loading ? <CSpinner size="sm" className="me-2" /> : null}
                    {loading ? 'Saving...' : 'Set Password & Continue'}
                  </CButton>
                </form>
              </>
            )}

          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}
