import { useState, useMemo } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton,
  CFormInput, CFormSelect, CFormTextarea, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CRow, CCol, CNav, CNavItem, CNavLink, CTabContent, CTabPane,
} from '@coreui/react'
import { useMarathonStore } from '../../store/useMarathonStore'

const PER_PAGE = 50

function emailBadge(c) {
  if (c.emailFailed === 'Yes') return <CBadge color="danger">Failed</CBadge>
  if (c.response === 'Yes') return <CBadge color="success">Responded</CBadge>
  if (c.dateSent) return <CBadge color="primary">Sent</CBadge>
  return <CBadge color="secondary">Pending</CBadge>
}

function dropBadge(status) {
  const map = {
    pending: <CBadge style={{ background: '#ffc107', color: '#000' }}>Pending</CBadge>,
    assigned: <CBadge color="info">Assigned</CBadge>,
    dropped: <CBadge color="success">Dropped</CBadge>,
    'n/a': <CBadge color="secondary">N/A</CBadge>,
  }
  return map[status] || null
}

// Edit modal — full form for all fields
function EditModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState({ ...contact })
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <CModal visible onClose={onClose} size="xl" backdrop="static">
      <CModalHeader>
        <CModalTitle>Edit — {contact.organisation || 'Contact'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CNav variant="underline" className="mb-3">
          <CNavItem><span className="nav-link active fw-semibold">Contact Details</span></CNavItem>
        </CNav>

        <CRow className="g-3">
          <CCol md={6}>
            <label className="form-label fw-semibold">Organisation / Name</label>
            <CFormInput value={form.organisation} onChange={(e) => upd('organisation', e.target.value)} />
          </CCol>
          <CCol md={6}>
            <label className="form-label fw-semibold">Contact Person</label>
            <CFormInput value={form.contactPerson} onChange={(e) => upd('contactPerson', e.target.value)} placeholder="e.g. John Smith" />
          </CCol>
          <CCol md={6}>
            <label className="form-label fw-semibold">Email</label>
            <CFormInput type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} />
          </CCol>
          <CCol md={6}>
            <label className="form-label fw-semibold">Phone</label>
            <CFormInput value={form.phone} onChange={(e) => upd('phone', e.target.value)} />
          </CCol>
          <CCol md={8}>
            <label className="form-label fw-semibold">Street</label>
            <CFormInput value={form.street} onChange={(e) => upd('street', e.target.value)} />
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Suburb</label>
            <CFormInput value={form.suburb} onChange={(e) => upd('suburb', e.target.value)} />
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Category</label>
            <CFormInput value={form.category} onChange={(e) => upd('category', e.target.value)} />
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Sheet / Source</label>
            <CFormSelect value={form.sheet} onChange={(e) => upd('sheet', e.target.value)}>
              <option value="Master">Master</option>
              <option value="Churches">Churches</option>
              <option value="Businesses">Businesses</option>
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Drop Status</label>
            <CFormSelect value={form.dropStatus} onChange={(e) => upd('dropStatus', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="dropped">Dropped</option>
              <option value="n/a">N/A</option>
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Drop Volunteer</label>
            <CFormInput value={form.dropVolunteer} onChange={(e) => upd('dropVolunteer', e.target.value)} placeholder="Volunteer name" />
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Drop Date</label>
            <CFormInput type="date" value={form.dropDate} onChange={(e) => upd('dropDate', e.target.value)} />
          </CCol>
        </CRow>

        <hr className="my-3" />
        <p className="fw-semibold mb-2">Email Status</p>
        <CRow className="g-3">
          <CCol md={4}>
            <label className="form-label fw-semibold">Date Sent</label>
            <CFormInput value={form.dateSent} onChange={(e) => upd('dateSent', e.target.value)} placeholder="e.g. 06/09/2025 or EMA" />
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Response Received</label>
            <CFormSelect value={form.response} onChange={(e) => upd('response', e.target.value)}>
              <option value="">No</option>
              <option value="Yes">Yes</option>
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <label className="form-label fw-semibold">Email Failed / Bounced</label>
            <CFormSelect value={form.emailFailed} onChange={(e) => upd('emailFailed', e.target.value)}>
              <option value="">No</option>
              <option value="Yes">Yes</option>
            </CFormSelect>
          </CCol>
          <CCol xs={12}>
            <label className="form-label fw-semibold">Notes</label>
            <CFormTextarea rows={3} value={form.notes} onChange={(e) => upd('notes', e.target.value)} placeholder="Any notes about this contact..." />
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={() => onSave(form)}>Save Changes</CButton>
        <CButton color="secondary" variant="outline" onClick={onClose}>Cancel</CButton>
      </CModalFooter>
    </CModal>
  )
}

export default function Contacts() {
  const { contacts, updateContact, deleteContact } = useMarathonStore()
  const [search, setSearch] = useState('')
  const [sheetFilter, setSheetFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)   // detail view
  const [editing, setEditing] = useState(null)   // edit form

  const sheets = useMemo(() => [...new Set(contacts.map((c) => c.sheet))].sort(), [contacts])

  const filtered = useMemo(() => {
    let out = contacts
    if (search) {
      const q = search.toLowerCase()
      out = out.filter((c) =>
        c.organisation.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.suburb.toLowerCase().includes(q) ||
        c.street.toLowerCase().includes(q) ||
        (c.contactPerson || '').toLowerCase().includes(q)
      )
    }
    if (sheetFilter) out = out.filter((c) => c.sheet === sheetFilter)
    if (statusFilter === 'sent') out = out.filter((c) => c.dateSent && c.emailFailed !== 'Yes')
    if (statusFilter === 'failed') out = out.filter((c) => c.emailFailed === 'Yes')
    if (statusFilter === 'responded') out = out.filter((c) => c.response === 'Yes')
    if (statusFilter === 'pending') out = out.filter((c) => !c.dateSent)
    if (statusFilter === 'dropped') out = out.filter((c) => c.dropStatus === 'dropped')
    return out
  }, [contacts, search, sheetFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleSave = (updated) => {
    updateContact(updated.id, updated)
    setEditing(null)
    setViewing(null)
  }

  const exportCSV = () => {
    const headers = ['Organisation','Contact Person','Email','Phone','Street','Suburb','Category','Sheet','Date Sent','Response','Email Failed','Drop Status','Drop Volunteer','Notes']
    const rows = filtered.map((c) => [c.organisation,c.contactPerson,c.email,c.phone,c.street,c.suburb,c.category,c.sheet,c.dateSent,c.response,c.emailFailed,c.dropStatus,c.dropVolunteer,c.notes])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'contacts_export.csv'; a.click()
  }

  if (contacts.length === 0) {
    return <div className="text-center py-5 text-muted">No contacts loaded. <a href="/import">Import your spreadsheet</a>.</div>
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">All Contacts</h4>
          <span className="text-muted small">{filtered.length.toLocaleString()} of {contacts.length.toLocaleString()} contacts</span>
        </div>
        <CButton color="success" size="sm" onClick={exportCSV}>Export CSV</CButton>
      </div>

      {/* Filters */}
      <CCard className="stat-card mb-3">
        <CCardBody className="d-flex gap-2 flex-wrap align-items-center">
          <CFormInput
            placeholder="Search name, email, suburb, person..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ maxWidth: 300 }}
          />
          <CFormSelect value={sheetFilter} onChange={(e) => { setSheetFilter(e.target.value); setPage(1) }} style={{ maxWidth: 180 }}>
            <option value="">All sheets</option>
            {sheets.map((s) => <option key={s} value={s}>{s}</option>)}
          </CFormSelect>
          <CFormSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} style={{ maxWidth: 180 }}>
            <option value="">All statuses</option>
            <option value="sent">Email Sent</option>
            <option value="failed">Email Failed</option>
            <option value="responded">Responded</option>
            <option value="pending">Not Yet Sent</option>
            <option value="dropped">Drop Complete</option>
          </CFormSelect>
          {(search || sheetFilter || statusFilter) && (
            <CButton color="secondary" variant="outline" size="sm"
              onClick={() => { setSearch(''); setSheetFilter(''); setStatusFilter(''); setPage(1) }}>
              Clear
            </CButton>
          )}
        </CCardBody>
      </CCard>

      {/* Table */}
      <CCard className="stat-card">
        <CCardBody className="p-0">
          <CTable hover responsive className="mb-0">
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Organisation</CTableHeaderCell>
                <CTableHeaderCell>Contact Person</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Suburb</CTableHeaderCell>
                <CTableHeaderCell>Email Status</CTableHeaderCell>
                <CTableHeaderCell>Drop</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paged.map((c) => (
                <CTableRow key={c.id} style={{ cursor: 'pointer' }} onClick={() => setViewing(c)}>
                  <CTableDataCell className="fw-semibold">{c.organisation || '—'}</CTableDataCell>
                  <CTableDataCell className="small text-muted">{c.contactPerson || '—'}</CTableDataCell>
                  <CTableDataCell className="small">{c.email || '—'}</CTableDataCell>
                  <CTableDataCell className="small">{c.suburb || '—'}</CTableDataCell>
                  <CTableDataCell>{emailBadge(c)}</CTableDataCell>
                  <CTableDataCell>{dropBadge(c.dropStatus)}</CTableDataCell>
                  <CTableDataCell onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex gap-1">
                      <CButton color="primary" variant="outline" size="sm"
                        onClick={() => setEditing(c)}>
                        Edit
                      </CButton>
                      <CButton color="danger" variant="ghost" size="sm"
                        onClick={() => { if (confirm('Delete this contact?')) deleteContact(c.id) }}>
                        ✕
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <CButton color="secondary" variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</CButton>
          <span className="small text-muted">Page {page} of {totalPages}</span>
          <CButton color="secondary" variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</CButton>
        </div>
      )}

      {/* View Detail Modal */}
      {viewing && !editing && (
        <CModal visible onClose={() => setViewing(null)} size="lg">
          <CModalHeader>
            <CModalTitle>{viewing.organisation}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CTable small bordered>
              <CTableBody>
                {[
                  ['Organisation', viewing.organisation],
                  ['Contact Person', viewing.contactPerson],
                  ['Email', viewing.email],
                  ['Phone', viewing.phone],
                  ['Street', viewing.street],
                  ['Suburb', viewing.suburb],
                  ['Category', viewing.category],
                  ['Sheet', viewing.sheet],
                  ['Date Sent', viewing.dateSent],
                  ['Response', viewing.response],
                  ['Email Failed', viewing.emailFailed],
                  ['Drop Status', viewing.dropStatus],
                  ['Drop Volunteer', viewing.dropVolunteer],
                  ['Drop Date', viewing.dropDate],
                  ['Notes', viewing.notes],
                ].map(([k, v]) => (
                  <CTableRow key={k}>
                    <CTableDataCell className="fw-semibold text-muted" style={{ width: 160 }}>{k}</CTableDataCell>
                    <CTableDataCell>{v || '—'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CModalBody>
          <CModalFooter>
            <CButton color="primary" onClick={() => setEditing(viewing)}>
              Edit Contact
            </CButton>
            <CButton
              color={viewing.dropStatus === 'dropped' ? 'secondary' : 'success'}
              onClick={() => {
                const next = viewing.dropStatus === 'dropped' ? 'pending' : 'dropped'
                updateContact(viewing.id, { dropStatus: next })
                setViewing({ ...viewing, dropStatus: next })
              }}
            >
              {viewing.dropStatus === 'dropped' ? 'Undo Drop' : 'Mark Dropped'}
            </CButton>
            <CButton color="secondary" variant="outline" onClick={() => setViewing(null)}>Close</CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Edit Modal */}
      {editing && (
        <EditModal
          contact={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
