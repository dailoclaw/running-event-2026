import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'
import {
  CCard, CCardBody, CCardHeader, CButton, CFormInput,
  CAlert, CSpinner, CRow, CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilCamera } from '@coreui/icons'

export default function Profile() {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile()
  const fileRef = useRef()

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [saving, setSaving] = useState(false)

  // Sync local form state if context updates (e.g. on re-mount after navigation)
  useEffect(() => {
    setFullName(profile.full_name || '')
  }, [profile.full_name])
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  // Keep local name in sync if context updates
  const avatarUrl = profile.avatar_url || ''

  const flash = (setFn, msg) => { setFn(msg); setTimeout(() => setFn(''), 3000) }

  const saveProfile = async () => {
    setSaving(true); setError('')
    const { error } = await updateProfile({ full_name: fullName })
    if (error) setError(error.message)
    else flash(setSuccess, 'Profile saved.')
    setSaving(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return }
    setUploading(true); setError('')

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`

    const { error: updateError } = await updateProfile({ avatar_url: url })
    if (updateError) setError(updateError.message)
    else flash(setSuccess, 'Photo updated.')
    setUploading(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPw.length < 8) { setPwError('Min. 8 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwLoading(true); setPwError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email, password: currentPw,
    })
    if (signInError) { setPwError('Current password is incorrect.'); setPwLoading(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) setPwError(error.message)
    else {
      flash(setPwSuccess, 'Password changed.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
    setPwLoading(false)
  }

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Profile</h4>
        <span className="text-muted small">Manage your name, photo and password</span>
      </div>

      {success && <CAlert color="success" className="mb-3">{success}</CAlert>}
      {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}

      <CRow className="g-3">
        <CCol md={5}>
          <CCard className="stat-card">
            <CCardHeader className="fw-semibold">Your Profile</CCardHeader>
            <CCardBody>
              {/* Avatar */}
              <div className="d-flex flex-column align-items-center mb-4">
                <div style={{ position: 'relative', width: 96, height: 96 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{
                      width: 96, height: 96, borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid #FF4D4D',
                    }} />
                  ) : (
                    <div style={{
                      width: 96, height: 96, borderRadius: '50%',
                      background: '#FF4D4D', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CIcon icon={cilUser} style={{ width: 40, height: 40, color: '#fff' }} />
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#1F3864', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                    }}
                  >
                    {uploading
                      ? <CSpinner size="sm" style={{ width: 12, height: 12 }} />
                      : <CIcon icon={cilCamera} style={{ width: 14, height: 14 }} />
                    }
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  style={{ display: 'none' }} onChange={handleAvatarUpload} />
                <div className="text-muted small mt-2">Click camera to change photo</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Max 2MB · JPG or PNG</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <CFormInput
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <CFormInput value={user?.email || ''} disabled />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Role</label>
                <div className="mt-1">
                  <span className={`badge ${profile.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                    {profile.role || 'member'}
                  </span>
                </div>
              </div>

              <CButton color="primary" onClick={saveProfile} disabled={saving}>
                {saving ? <CSpinner size="sm" className="me-2" /> : null}
                {saving ? 'Saving...' : 'Save Profile'}
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={7}>
          <CCard className="stat-card">
            <CCardHeader className="fw-semibold">Change Password</CCardHeader>
            <CCardBody>
              {pwError && <CAlert color="danger" className="mb-3">{pwError}</CAlert>}
              {pwSuccess && <CAlert color="success" className="mb-3">{pwSuccess}</CAlert>}
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Current Password</label>
                  <CFormInput type="password" value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <CFormInput type="password" placeholder="Min. 8 characters"
                    value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <CFormInput type="password" value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)} required />
                </div>
                <CButton type="submit" color="primary" disabled={pwLoading}>
                  {pwLoading ? <CSpinner size="sm" className="me-2" /> : null}
                  {pwLoading ? 'Saving...' : 'Change Password'}
                </CButton>
              </form>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
