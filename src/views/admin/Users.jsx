import { useState, useEffect, useCallback } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CFormSelect,
  CBadge, CAlert, CSpinner, CModal, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CFormInput,
  CTable, CTableHead, CTableBody, CTableRow,
  CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import { supabase } from '../../lib/supabase'

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
    const { data, error } = await supabase.from('profiles').select('*').order('created_at')
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
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Member Since</CTableHeaderCell>
                  <CTableHeaderCell>Change Role</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {users.map((u) => (
                  <CTableRow key={u.id}>
                    <CTableDataCell className="fw-semibold">{u.email}</CTableDataCell>
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
