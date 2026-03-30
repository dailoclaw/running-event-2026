import { useState, useEffect, useCallback } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CFormSelect,
  CBadge, CAlert, CSpinner, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CFormInput,
  CTable, CTableHead, CTableBody, CTableRow,
  CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'
import { supabase } from '../../lib/supabase'

function Avatar({ url, name, size = 36 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  if (url) {
    return (
      <img src={url} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FF4D4D', flexShrink: 0 }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: '#FF4D4D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
    }}>
      {initials !== '?' ? initials : <CIcon icon={cilUser} style={{ width: size * 0.5, height: size * 0.5 }} />}
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(null)
  const [success, setSuccess] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('id, email, role, full_name, avatar_url, created_at').order('created_at')
    if (error) setError(error.message)
    else setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const updateRole = async (userId, newRole) => {
    setSaving(userId)
    setSuccess('')
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    if (error) setError(error.message)
    else {
      setUsers((u) => u.map((x) => x.id === userId ? { ...x, role: newRole } : x))
      setSuccess('Role updated.')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(null)
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true); setInviteMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email: inviteEmail.trim(),
      options: { shouldCreateUser: true }
    })
    if (error) {
      setInviteMsg(`Error: ${error.message}`)
    } else {
      setInviteMsg(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
    }
    setInviting(false)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">User Management</h4>
          <span className="text-muted small">Manage team access and roles</span>
        </div>
        <CButton color="primary" onClick={() => { setShowInvite(true); setInviteMsg('') }}>
          + Invite User
        </CButton>
      </div>

      {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
      {success && <CAlert color="success" className="mb-3">{success}</CAlert>}

      <CCard className="stat-card">
        <CCardHeader className="fw-semibold">
          Team Members ({users.length})
        </CCardHeader>
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CTable hover responsive className="mb-0">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Member Since</CTableHeaderCell>
                  <CTableHeaderCell>Change Role</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map((u) => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-3">
                        <Avatar url={u.avatar_url} name={u.full_name} />
                        <div>
                          <div className="fw-semibold">{u.full_name || <span className="text-muted fst-italic">No name set</span>}</div>
                          <div className="small text-muted">{u.email}</div>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={u.role === 'admin' ? 'danger' : 'secondary'}>
                        {u.role || 'member'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-muted small">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-AU') : '—'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-2">
                        <CFormSelect
                          size="sm"
                          style={{ maxWidth: 130 }}
                          value={u.role || 'member'}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          disabled={saving === u.id}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </CFormSelect>
                        {saving === u.id && <CSpinner size="sm" color="primary" />}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CCard className="stat-card mt-4">
        <CCardHeader className="fw-semibold">Role Permissions</CCardHeader>
        <CCardBody className="p-0">
          <CTable small bordered className="mb-0">
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Feature</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Member</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Admin</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {[
                ['Dashboard', true, true],
                ['View Contacts', true, true],
                ['Edit Contacts', true, true],
                ['Letterbox Drops', true, true],
                ['Email Campaigns', true, true],
                ['Route Map', true, true],
                ['Profile', true, true],
                ['Import Data', false, true],
                ['Settings', false, true],
                ['User Management', false, true],
              ].map(([feature, member, admin]) => (
                <CTableRow key={feature}>
                  <CTableDataCell>{feature}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    {member ? '✅' : '—'}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {admin ? '✅' : '—'}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Invite Modal */}
      <CModal visible={showInvite} onClose={() => setShowInvite(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Invite New User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {inviteMsg && (
            <CAlert color={inviteMsg.startsWith('Error') ? 'danger' : 'success'} className="mb-3">
              {inviteMsg}
            </CAlert>
          )}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <CFormInput
              type="email"
              placeholder="team@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Role</label>
            <CFormSelect value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="member">Member — can view and edit data</option>
              <option value="admin">Admin — full access including settings</option>
            </CFormSelect>
          </div>
          <div className="alert alert-info small mb-0">
            They'll receive an email to set their password. You can change their role anytime from this page.
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
            {inviting ? <CSpinner size="sm" className="me-2" /> : null}
            {inviting ? 'Sending...' : 'Send Invite'}
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => setShowInvite(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
