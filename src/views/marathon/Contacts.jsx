import { useState, useMemo } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton,
  CFormInput, CFormSelect, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
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

export default function Contacts() {
  const { contacts, updateContact, deleteContact } = useMarathonStore()
  const [search, setSearch] = useState('')
  const [sheetFilter, setSheetFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const sheets = useMemo(() => [...new Set(contacts.map((c) => c.sheet))].sort(), [contacts])

  const filtered = useMemo(() => {
    let out = contacts
    if (search) {
      const q = search.toLowerCase()
      out = out.filter((c) =>
        c.organisation.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.suburb.toLowerCase().includes(q) ||
        c.street.toLowerCase().includes(q)
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

  const exportCSV = () => {
    const headers = ['Organisation','Contact Person','Email','Phone','Street','Suburb','Category','Sheet','Date Sent','Response','Email Failed','Drop Status','Notes']
    const rows = filtered.map((c) => [c.organisation,c.contactPerson,c.email,c.phone,c.street,c.suburb,c.category,c.sheet,c.dateSent,c.response,c.emailFailed,c.dropStatus,c.notes])
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
            placeholder="Search name, email, suburb..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ maxWidth: 280 }}
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
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Suburb</CTableHeaderCell>
                <CTableHeaderCell>Category</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Drop</CTableHeaderCell>
                <CTableHeaderCell></CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paged.map((c) => (
                <CTableRow key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                  <CTableDataCell className="fw-semibold">{c.organisation || '—'}</CTableDataCell>
                  <CTableDataCell className="text-muted small">{c.email || '—'}</CTableDataCell>
                  <CTableDataCell className="small">{c.suburb || '—'}</CTableDataCell>
                  <CTableDataCell><CBadge color="secondary" className="small">{c.category || c.sheet}</CBadge></CTableDataCell>
                  <CTableDataCell>{emailBadge(c)}</CTableDataCell>
                  <CTableDataCell>{dropBadge(c.dropStatus)}</CTableDataCell>
                  <CTableDataCell onClick={(e) => e.stopPropagation()}>
                    <CButton color="danger" variant="ghost" size="sm"
                      onClick={() => { if (confirm('Delete this contact?')) deleteContact(c.id) }}>✕</CButton>
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

      {/* Detail modal */}
      {selected && (
        <CModal visible onClose={() => setSelected(null)} size="lg">
          <CModalHeader><CModalTitle>{selected.organisation}</CModalTitle></CModalHeader>
          <CModalBody>
            <CTable small bordered>
              <CTableBody>
                {[
                  ['Contact Person', selected.contactPerson],
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['Street', selected.street],
                  ['Suburb', selected.suburb],
                  ['Category', selected.category],
                  ['Sheet', selected.sheet],
                  ['Date Sent', selected.dateSent],
                  ['Response', selected.response],
                  ['Email Failed', selected.emailFailed],
                  ['Drop Status', selected.dropStatus],
                  ['Drop Volunteer', selected.dropVolunteer],
                  ['Notes', selected.notes],
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
            <CButton
              color={selected.dropStatus === 'dropped' ? 'secondary' : 'success'}
              onClick={() => {
                const next = selected.dropStatus === 'dropped' ? 'pending' : 'dropped'
                updateContact(selected.id, { dropStatus: next })
                setSelected({ ...selected, dropStatus: next })
              }}
            >
              {selected.dropStatus === 'dropped' ? 'Undo Drop' : 'Mark Dropped'}
            </CButton>
            <CButton color="secondary" onClick={() => setSelected(null)}>Close</CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}
