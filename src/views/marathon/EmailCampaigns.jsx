import { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CFormInput, CFormTextarea, CFormSelect,
  CBadge, CRow, CCol, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import { useMarathonStore } from '../../store/useMarathonStore'

const uid = () => Math.random().toString(36).slice(2, 10)

const TMPL_CLOSURE = `Dear {Organisation},

We are writing to advise that the 2026 Adelaide Marathon will take place on Sunday, 6 September 2026.

As part of this event, there will be temporary road closures along Anzac Highway and surrounding streets. We apologise for any inconvenience this may cause and appreciate your patience and support of our community event.

Road closures will be in effect from approximately 6:00am to 12:00pm on the day.

For full course details and a road closure map, please visit www.adelaidemarathon.com.au or contact us at info@adelaidemarathon.com.au.

Thank you for your understanding.

Kind regards,
Adelaide Marathon 2026 Organisation Committee`

const TMPL_LETTERBOX = `Dear Resident/Occupant,

The 2026 Adelaide Marathon is coming to your neighbourhood!

Join us on Sunday, 6 September 2026 as thousands of runners pass through your area on their way from Adelaide CBD to Glenelg.

Temporary road closures will be in effect from approximately 6:00am to 12:00pm along Anzac Highway and nearby streets. We encourage you to come out and cheer on the runners — it's a fantastic community event!

Full details including the course map are available at www.adelaidemarathon.com.au.

Adelaide Marathon 2026 Team`

export default function EmailCampaigns() {
  const { contacts, campaigns, addCampaign, updateCampaign, deleteCampaign } = useMarathonStore()
  const [showNew, setShowNew] = useState(false)
  const [campName, setCampName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sheetFilter, setSheetFilter] = useState('')
  const [onlyFailed, setOnlyFailed] = useState(false)
  const [onlyNotSent, setOnlyNotSent] = useState(false)

  const sheets = [...new Set(contacts.map((c) => c.sheet))].sort()

  const recipients = contacts.filter((c) => {
    if (!c.email) return false
    if (sheetFilter && c.sheet !== sheetFilter) return false
    if (onlyFailed && c.emailFailed !== 'Yes') return false
    if (onlyNotSent && c.dateSent) return false
    return true
  })

  const save = () => {
    if (!campName || !subject || !body) return
    addCampaign({ id: uid(), name: campName, subject, body, recipients: recipients.map((c) => c.id), sentAt: '', status: 'draft' })
    setShowNew(false); setCampName(''); setSubject(''); setBody('')
  }

  const exportCSV = (campaign) => {
    const recs = contacts.filter((c) => campaign.recipients.includes(c.id))
    const rows = [['Email','Organisation','Contact Person','Suburb'], ...recs.map((c) => [c.email,c.organisation,c.contactPerson,c.suburb])]
    const csv = rows.map((r) => r.map((v) => `"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${campaign.name.replace(/\s+/g,'_')}_recipients.csv`; a.click()
  }

  const withEmail = contacts.filter((c) => c.email).length
  const failed = contacts.filter((c) => c.emailFailed === 'Yes').length
  const noEmail = contacts.filter((c) => !c.email).length

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Email Campaigns</h4>
          <span className="text-muted small">Build campaigns and export recipient lists for mail-merge</span>
        </div>
        <CButton color="primary" onClick={() => setShowNew(true)}>+ New Campaign</CButton>
      </div>

      <CRow className="g-3 mb-4">
        <CCol sm={4}>
          <CCard className="stat-card">
            <CCardBody>
              <div className="small text-muted text-uppercase fw-semibold">Contacts with Email</div>
              <div className="fs-3 fw-bold text-primary">{withEmail.toLocaleString()}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="stat-card">
            <CCardBody>
              <div className="small text-muted text-uppercase fw-semibold">Failed / Bounced</div>
              <div className="fs-3 fw-bold text-danger">{failed}</div>
              <div className="small text-muted">need re-sending</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="stat-card">
            <CCardBody>
              <div className="small text-muted text-uppercase fw-semibold">Letterbox Only</div>
              <div className="fs-3 fw-bold text-secondary">{noEmail}</div>
              <div className="small text-muted">no email address</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {campaigns.length > 0 ? (
        <CCard className="stat-card mb-4">
          <CCardHeader className="fw-semibold">Campaigns</CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Subject</CTableHeaderCell>
                  <CTableHeaderCell>Recipients</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {campaigns.map((c) => (
                  <CTableRow key={c.id}>
                    <CTableDataCell className="fw-semibold">{c.name}</CTableDataCell>
                    <CTableDataCell className="text-muted small">{c.subject}</CTableDataCell>
                    <CTableDataCell>{c.recipients.length.toLocaleString()}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={c.status === 'sent' ? 'success' : 'warning'}>{c.status}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-1">
                        <CButton size="sm" color="primary" variant="outline" onClick={() => exportCSV(c)}>Export CSV</CButton>
                        {c.status === 'draft' && (
                          <CButton size="sm" color="success" variant="outline"
                            onClick={() => updateCampaign(c.id, { status: 'sent', sentAt: new Date().toISOString() })}>
                            Mark Sent
                          </CButton>
                        )}
                        <CButton size="sm" color="danger" variant="ghost"
                          onClick={() => { if (confirm('Delete?')) deleteCampaign(c.id) }}>✕</CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      ) : (
        <CCard className="stat-card mb-4">
          <CCardBody className="text-center text-muted py-5">No campaigns yet. Create one to get started.</CCardBody>
        </CCard>
      )}

      {/* New Campaign Modal */}
      <CModal visible={showNew} onClose={() => setShowNew(false)} size="xl">
        <CModalHeader><CModalTitle>New Email Campaign</CModalTitle></CModalHeader>
        <CModalBody>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <label className="form-label fw-semibold">Campaign Name *</label>
              <CFormInput placeholder="e.g. Road Closure Notice — Sept 2026" value={campName} onChange={(e) => setCampName(e.target.value)} />
            </CCol>
            <CCol md={6}>
              <label className="form-label fw-semibold">Email Subject *</label>
              <CFormInput placeholder="e.g. 2026 Adelaide Marathon — Road Closure Notice" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </CCol>
          </CRow>

          <div className="mb-3">
            <label className="form-label fw-semibold">Message</label>
            <div className="d-flex gap-2 mb-2">
              <CButton size="sm" color="secondary" variant="outline" onClick={() => setBody(TMPL_CLOSURE)}>Road Closure Template</CButton>
              <CButton size="sm" color="secondary" variant="outline" onClick={() => setBody(TMPL_LETTERBOX)}>Letterbox Notice Template</CButton>
              <CButton size="sm" color="secondary" variant="ghost" onClick={() => setBody('')}>Clear</CButton>
            </div>
            <CFormTextarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message or pick a template above..." />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Filter Recipients</label>
            <CRow className="g-2 align-items-center">
              <CCol md={4}>
                <CFormSelect value={sheetFilter} onChange={(e) => setSheetFilter(e.target.value)}>
                  <option value="">All sheets</option>
                  {sheets.map((s) => <option key={s} value={s}>{s}</option>)}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <label className="d-flex align-items-center gap-2 mb-0">
                  <input type="checkbox" checked={onlyFailed} onChange={(e) => setOnlyFailed(e.target.checked)} />
                  Failed emails only
                </label>
              </CCol>
              <CCol md={4}>
                <label className="d-flex align-items-center gap-2 mb-0">
                  <input type="checkbox" checked={onlyNotSent} onChange={(e) => setOnlyNotSent(e.target.checked)} />
                  Not yet sent
                </label>
              </CCol>
            </CRow>
          </div>

          <div className="alert alert-info mb-0">
            <strong>{recipients.length.toLocaleString()} recipients</strong> match current filters.
            Exporting gives you a CSV ready for any mail-merge or bulk email tool.
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={save} disabled={!campName || !subject || !body}>Save Campaign</CButton>
          <CButton color="secondary" onClick={() => setShowNew(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
