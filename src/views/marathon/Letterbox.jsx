import { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CFormInput, CFormSelect, CBadge,
  CRow, CCol, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CAlert,
} from '@coreui/react'

function ProgressBar({ value, color = '#198754' }) {
  return (
    <div style={{ background: '#e9ecef', borderRadius: 6, height: 8, overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        height: '100%',
        background: color,
        borderRadius: 6,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}
import { useMarathonStore } from '../../store/useMarathonStore'

const uid = () => Math.random().toString(36).slice(2, 10)

const STATUS_COLOR = { pending: 'warning', 'in-progress': 'info', complete: 'success' }

// Cycle through statuses on click
const NEXT_STATUS = { pending: 'in-progress', 'in-progress': 'complete', complete: 'pending' }

export default function Letterbox() {
  const { segments, dropRuns, updateSegment, addDropRun, updateDropRun, deleteDropRun } = useMarathonStore()

  const safeSegments = Array.isArray(segments) ? segments : []
  const safeDropRuns = Array.isArray(dropRuns) ? dropRuns : []

  const [showNew, setShowNew] = useState(false)
  const [runName, setRunName] = useState('')
  const [volunteer, setVolunteer] = useState('')
  const [date, setDate] = useState('')
  const [selectedSegs, setSelectedSegs] = useState([])
  const [segFilter, setSegFilter] = useState('')
  const [validationMsg, setValidationMsg] = useState('')
  const [saved, setSaved] = useState(false)

  const totalProps = safeSegments.reduce((a, s) => a + s.total, 0)
  const completedProps = safeSegments.filter((s) => s.status === 'complete').reduce((a, s) => a + s.total, 0)
  const completedPct = totalProps ? Math.round((completedProps / totalProps) * 100) : 0

  const filteredSegs = segFilter ? safeSegments.filter((s) => s.status === segFilter) : safeSegments

  const toggle = (id) =>
    setSelectedSegs((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const resetForm = () => {
    setRunName(''); setVolunteer(''); setDate(''); setSelectedSegs([]); setValidationMsg('')
  }

  const createRun = () => {
    if (!runName.trim()) { setValidationMsg('Run name is required.'); return }
    if (selectedSegs.length === 0) { setValidationMsg('Select at least one street segment.'); return }
    setValidationMsg('')
    const run = {
      id: uid(),
      name: runName.trim(),
      volunteer: volunteer.trim(),
      segments: [...selectedSegs],
      date,
      status: 'pending',
      notes: '',
      createdAt: new Date().toISOString(),
    }
    addDropRun(run)
    selectedSegs.forEach((id) => updateSegment(id, { assignedTo: volunteer.trim(), status: 'in-progress' }))
    setShowNew(false)
    resetForm()
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  const cycleSegStatus = (seg) => {
    updateSegment(seg.id, { status: NEXT_STATUS[seg.status] || 'pending' })
  }

  const cycleRunStatus = (run) => {
    const next = NEXT_STATUS[run.status] || 'pending'
    updateDropRun(run.id, { status: next })
    if (next === 'complete') {
      run.segments.forEach((sid) => updateSegment(sid, { status: 'complete' }))
    }
    if (next === 'pending') {
      run.segments.forEach((sid) => updateSegment(sid, { status: 'pending', assignedTo: '' }))
    }
  }

  const printRun = (run) => {
    const runSegs = safeSegments.filter((s) => run.segments.includes(s.id))
    const total = runSegs.reduce((a, s) => a + s.total, 0)
    const html = `<html><head><title>${run.name}</title><style>
      body{font-family:Arial,sans-serif;padding:20px;color:#1F3864}
      h1{color:#FF4D4D;margin-bottom:4px}.sub{color:#666;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{background:#1F3864;color:#fff;padding:10px;text-align:left}
      td{padding:8px;border-bottom:1px solid #eee}
      tr:nth-child(even){background:#f8f8f8}
      .total{background:#fff0f0!important;font-weight:bold}
      .footer{color:#888;font-size:11px;margin-top:24px}
    </style></head><body>
      <h1>Adelaide Marathon 2026 — Letterbox Drop Sheet</h1>
      <div class="sub">
        Run: <strong>${run.name}</strong> &nbsp;|&nbsp;
        Volunteer: <strong>${run.volunteer || 'TBD'}</strong> &nbsp;|&nbsp;
        Date: <strong>${run.date || 'TBD'}</strong>
      </div>
      <table>
        <thead><tr><th>Street Segment</th><th>Houses</th><th>Apts</th><th>Business</th><th>Total</th></tr></thead>
        <tbody>
          ${runSegs.map((s) => `<tr>
            <td>${s.name}</td>
            <td>${s.mainHouses + s.sideHouses}</td>
            <td>${s.mainApts + s.sideApts}</td>
            <td>${s.mainBusiness + s.sideBusiness}</td>
            <td><strong>${s.total}</strong></td>
          </tr>`).join('')}
          <tr class="total">
            <td>TOTAL</td>
            <td>${runSegs.reduce((a,s)=>a+s.mainHouses+s.sideHouses,0)}</td>
            <td>${runSegs.reduce((a,s)=>a+s.mainApts+s.sideApts,0)}</td>
            <td>${runSegs.reduce((a,s)=>a+s.mainBusiness+s.sideBusiness,0)}</td>
            <td>${total}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">Generated ${new Date().toLocaleString()} — Adelaide Marathon 2026</div>
    </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500) }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Letterbox Drop Planner</h4>
          <span className="text-muted small">Organise and track community letterbox drops along the marathon route</span>
        </div>
        <CButton color="primary" onClick={() => { resetForm(); setShowNew(true) }}>+ New Drop Run</CButton>
      </div>

      {saved && <CAlert color="success" className="mb-3">Drop run created successfully!</CAlert>}

      {/* Summary */}
      <CRow className="g-3 mb-4">
        <CCol sm={4}>
          <CCard className="stat-card">
            <CCardBody>
              <div className="small text-muted text-uppercase fw-semibold">Total Properties</div>
              <div className="fs-3 fw-bold text-primary">{totalProps.toLocaleString()}</div>
              <div className="small text-muted">{safeSegments.length} street segments</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="stat-card">
            <CCardBody>
              <div className="small text-muted text-uppercase fw-semibold">Overall Progress</div>
              <div className="fs-3 fw-bold text-success">{completedPct}%</div>
              <ProgressBar value={completedPct} color="#198754" />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="stat-card">
            <CCardBody>
              <div className="small text-muted text-uppercase fw-semibold">Drop Runs</div>
              <div className="fs-3 fw-bold text-info">
                {safeDropRuns.filter(r => r.status === 'complete').length} / {safeDropRuns.length}
              </div>
              <div className="small text-muted">complete</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Drop Runs table */}
      {safeDropRuns.length > 0 && (
        <CCard className="stat-card mb-4">
          <CCardHeader className="fw-semibold">Drop Runs — click status to cycle (pending → in-progress → complete → pending)</CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Run Name</CTableHeaderCell>
                  <CTableHeaderCell>Volunteer</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Segments</CTableHeaderCell>
                  <CTableHeaderCell>Properties</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {safeDropRuns.map((run) => {
                  const runSegs = safeSegments.filter((s) => run.segments.includes(s.id))
                  const props = runSegs.reduce((a, s) => a + s.total, 0)
                  return (
                    <CTableRow key={run.id}>
                      <CTableDataCell className="fw-semibold">{run.name}</CTableDataCell>
                      <CTableDataCell>{run.volunteer || '—'}</CTableDataCell>
                      <CTableDataCell>{run.date || '—'}</CTableDataCell>
                      <CTableDataCell>{runSegs.length}</CTableDataCell>
                      <CTableDataCell>{props.toLocaleString()}</CTableDataCell>
                      <CTableDataCell style={{ cursor: 'pointer' }} onClick={() => cycleRunStatus(run)}>
                        <CBadge color={STATUS_COLOR[run.status] || 'secondary'} title="Click to change status">
                          {run.status} ↻
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-1">
                          <CButton size="sm" color="info" variant="outline" onClick={() => printRun(run)}>Print</CButton>
                          <CButton size="sm" color="danger" variant="ghost"
                            onClick={() => { if (confirm('Delete run?')) deleteDropRun(run.id) }}>✕</CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {/* Segments table */}
      <CCard className="stat-card">
        <CCardHeader className="d-flex justify-content-between align-items-center fw-semibold">
          <span>Street Segments ({filteredSegs.length}) — click status badge to cycle</span>
          <CFormSelect value={segFilter} onChange={(e) => setSegFilter(e.target.value)} style={{ maxWidth: 180 }} size="sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </CFormSelect>
        </CCardHeader>
        <CCardBody className="p-0">
          <CTable hover responsive small className="mb-0">
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Segment</CTableHeaderCell>
                <CTableHeaderCell>Houses</CTableHeaderCell>
                <CTableHeaderCell>Apts</CTableHeaderCell>
                <CTableHeaderCell>Business</CTableHeaderCell>
                <CTableHeaderCell>Total</CTableHeaderCell>
                <CTableHeaderCell>Assigned To</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredSegs.map((seg) => (
                <CTableRow key={seg.id}>
                  <CTableDataCell className="fw-semibold small">{seg.name}</CTableDataCell>
                  <CTableDataCell>{(seg.mainHouses + seg.sideHouses).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>{(seg.mainApts + seg.sideApts).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>{(seg.mainBusiness + seg.sideBusiness).toLocaleString()}</CTableDataCell>
                  <CTableDataCell className="fw-bold">{seg.total.toLocaleString()}</CTableDataCell>
                  <CTableDataCell className="text-muted small">{seg.assignedTo || '—'}</CTableDataCell>
                  <CTableDataCell style={{ cursor: 'pointer' }} onClick={() => cycleSegStatus(seg)}>
                    <CBadge color={STATUS_COLOR[seg.status] || 'secondary'} title="Click to cycle status">
                      {seg.status} ↻
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* New Run Modal */}
      <CModal visible={showNew} onClose={() => setShowNew(false)} size="xl" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Create New Drop Run</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {validationMsg && <CAlert color="danger" className="mb-3">{validationMsg}</CAlert>}

          <CRow className="g-3 mb-3">
            <CCol md={4}>
              <label className="form-label fw-semibold">Run Name *</label>
              <CFormInput
                placeholder="e.g. Glenelg North — Run 1"
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <label className="form-label fw-semibold">Volunteer</label>
              <CFormInput
                placeholder="Volunteer name"
                value={volunteer}
                onChange={(e) => setVolunteer(e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <label className="form-label fw-semibold">Date</label>
              <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </CCol>
          </CRow>

          <div className="fw-semibold mb-2">
            Select Segments *
            {selectedSegs.length > 0 && (
              <span className="text-muted ms-2 fw-normal small">
                ({selectedSegs.length} selected —{' '}
                {safeSegments.filter((s) => selectedSegs.includes(s.id)).reduce((a, s) => a + s.total, 0).toLocaleString()} properties)
              </span>
            )}
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: 8 }}>
            <CTable small hover className="mb-0">
              <CTableHead color="dark" style={{ position: 'sticky', top: 0 }}>
                <CTableRow>
                  <CTableHeaderCell style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selectedSegs.length === safeSegments.filter(s => s.status !== 'complete').length && safeSegments.filter(s => s.status !== 'complete').length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSegs(safeSegments.filter(s => s.status !== 'complete').map(s => s.id))
                        else setSelectedSegs([])
                      }}
                      title="Select all"
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell>Segment</CTableHeaderCell>
                  <CTableHeaderCell>Properties</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {safeSegments.filter((s) => s.status !== 'complete').map((seg) => (
                  <CTableRow key={seg.id} style={{ cursor: 'pointer' }} onClick={() => toggle(seg.id)}>
                    <CTableDataCell>
                      <input
                        type="checkbox"
                        checked={selectedSegs.includes(seg.id)}
                        onChange={() => toggle(seg.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </CTableDataCell>
                    <CTableDataCell className="small">{seg.name}</CTableDataCell>
                    <CTableDataCell>{seg.total.toLocaleString()}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={STATUS_COLOR[seg.status] || 'secondary'}>{seg.status}</CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {safeSegments.filter(s => s.status !== 'complete').length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center text-muted py-3">
                      All segments are marked complete.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={createRun}>
            Create Run
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => { setShowNew(false); resetForm() }}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
