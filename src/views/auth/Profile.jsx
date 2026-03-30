import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import {
  CCard, CCardBody, CCardHeader,
  CButton, CFormInput, CAlert, CSpinner, CRow, CCol,
} from '@coreui/react'

export default function Profile() {
  const { user } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPw.length < 8) { setError('New password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return }
    setLoading(true); setError(''); setSuccess('')

    // Re-authenticate first with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    })
    if (signInError) { setError('Current password is incorrect.'); setLoading(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) setError(error.message)
    else {
      setSuccess('Password changed successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
    setLoading(false)
  }

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Profile</h4>
        <span className="text-muted small">Your account details</span>
      </div>

      <CRow className="g-3">
        <CCol md={6}>
          <CCard className="stat-card">
            <CCardHeader className="fw-semibold">Account Info</CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">Email</label>
                <div className="fw-semibold">{user?.email}</div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">User ID</label>
                <div className="text-muted small font-monospace">{user?.id}</div>
              </div>
              <div>
                <label className="form-label fw-semibold text-muted small">Role</label>
                <div>
                  {user?.user_metadata?.role === 'admin'
                    ? <span className="badge bg-danger">Admin</span>
                    : <span className="badge bg-secondary">Member</span>}
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="stat-card">
            <CCardHeader className="fw-semibold">Change Password</CCardHeader>
            <CCardBody>
              {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
              {success && <CAlert color="success" className="mb-3">{success}</CAlert>}
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Current Password</label>
                  <CFormInput type="password" value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <CFormInput type="password" placeholder="Min. 8 characters" value={newPw}
                    onChange={(e) => setNewPw(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <CFormInput type="password" value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)} required />
                </div>
                <CButton type="submit" color="primary" disabled={loading}>
                  {loading ? <CSpinner size="sm" className="me-2" /> : null}
                  {loading ? 'Saving...' : 'Change Password'}
                </CButton>
              </form>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
