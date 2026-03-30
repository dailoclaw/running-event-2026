import {
  CCard, CCardBody, CCardHeader,
  CCol, CRow, CButton, CProgress, CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople, cilEnvelopeLetter, cilEnvelopeOpen,
  cilMap, cilCloudUpload, cilCheckCircle,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useMarathonStore } from '../../store/useMarathonStore'

function StatCard({ label, value, sub, color, icon, to }) {
  const navigate = useNavigate()
  return (
    <CCard className="stat-card h-100" style={{ cursor: to ? 'pointer' : 'default' }} onClick={() => to && navigate(to)}>
      <CCardBody className="d-flex align-items-center gap-3">
        <div className={`p-3 rounded-3 bg-${color} bg-opacity-10`}>
          <CIcon icon={icon} size="xl" className={`text-${color}`} />
        </div>
        <div>
          <div className="small text-muted text-uppercase fw-semibold">{label}</div>
          <div className={`fs-3 fw-bold text-${color}`}>{value}</div>
          {sub && <div className="small text-muted">{sub}</div>}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { contacts, segments, dropRuns, getStats } = useMarathonStore()
  const stats = getStats()

  const totalProps = segments.reduce((a, s) => a + s.total, 0)
  const completedRuns = dropRuns.filter((r) => r.status === 'complete').length
  const emailedPct = stats.total ? Math.round((stats.emailed / stats.total) * 100) : 0
  const respondedPct = stats.emailed ? Math.round((stats.responded / stats.emailed) * 100) : 0
  const failedPct = stats.total ? Math.round((stats.failed / stats.total) * 100) : 0
  const droppedPct = stats.total ? Math.round((stats.dropped / stats.total) * 100) : 0

  if (contacts.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 72 }}>🏃</div>
        <h2 className="fw-bold mt-3 mb-2">2026 Adelaide Marathon Event Manager</h2>
        <p className="text-muted mb-4">
          Import your cleaned contact spreadsheet to get started.<br />
          Plan letterbox drops, manage email campaigns, and track outreach — all in one place.
        </p>
        <CButton color="primary" size="lg" onClick={() => navigate('/import')}>
          <CIcon icon={cilCloudUpload} className="me-2" />
          Import Spreadsheet
        </CButton>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Dashboard</h4>
        <span className="text-muted small">2026 Adelaide Marathon — Community Outreach Overview</span>
      </div>

      {/* Stat cards */}
      <CRow className="g-3 mb-4">
        <CCol sm={6} xl={3}>
          <StatCard label="Total Contacts" value={stats.total.toLocaleString()} sub="all sheets" color="primary" icon={cilPeople} to="/contacts" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard label="Churches" value={stats.churches} sub="denominations" color="info" icon={cilPeople} to="/contacts" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard label="Businesses" value={stats.businesses} sub="along route" color="warning" icon={cilPeople} to="/contacts" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard label="Properties" value={totalProps.toLocaleString()} sub={`${segments.length} street segments`} color="success" icon={cilEnvelopeLetter} to="/letterbox" />
        </CCol>
      </CRow>

      <CRow className="g-3 mb-4">
        {/* Email progress */}
        <CCol md={6}>
          <CCard className="stat-card h-100">
            <CCardHeader className="fw-semibold d-flex justify-content-between align-items-center">
              <span><CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />Email Campaign Progress</span>
              <CButton size="sm" color="primary" variant="ghost" onClick={() => navigate('/email')}>Manage →</CButton>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Emails Sent</span>
                  <strong>{stats.emailed.toLocaleString()} / {stats.total.toLocaleString()} ({emailedPct}%)</strong>
                </div>
                <CProgress value={emailedPct} color="primary" style={{ height: 10, borderRadius: 6 }} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Responses Received</span>
                  <strong className="text-success">{stats.responded} ({respondedPct}%)</strong>
                </div>
                <CProgress value={respondedPct} color="success" style={{ height: 10, borderRadius: 6 }} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-danger">Failed / Bounced</span>
                  <strong className="text-danger">{stats.failed} ({failedPct}%)</strong>
                </div>
                <CProgress value={failedPct} color="danger" style={{ height: 10, borderRadius: 6 }} />
              </div>
              <div className="d-flex gap-2 mt-3">
                <CBadge color="secondary">{stats.noEmail} no email — letterbox only</CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Letterbox progress */}
        <CCol md={6}>
          <CCard className="stat-card h-100">
            <CCardHeader className="fw-semibold d-flex justify-content-between align-items-center">
              <span><CIcon icon={cilEnvelopeLetter} className="me-2 text-success" />Letterbox Drop Progress</span>
              <CButton size="sm" color="success" variant="ghost" onClick={() => navigate('/letterbox')}>Plan →</CButton>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Drops Complete</span>
                  <strong className="text-success">{stats.dropped} / {stats.total} ({droppedPct}%)</strong>
                </div>
                <CProgress value={droppedPct} color="success" style={{ height: 10, borderRadius: 6 }} />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Drop Runs</span>
                  <strong>{completedRuns} / {dropRuns.length} complete</strong>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Street Segments</span>
                  <strong>{segments.length} segments · {totalProps.toLocaleString()} properties</strong>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Quick actions */}
      <CCard className="stat-card">
        <CCardHeader className="fw-semibold">Quick Actions</CCardHeader>
        <CCardBody className="d-flex gap-2 flex-wrap">
          <CButton color="primary" onClick={() => navigate('/contacts')}>
            <CIcon icon={cilPeople} className="me-2" />View Contacts
          </CButton>
          <CButton color="success" onClick={() => navigate('/letterbox')}>
            <CIcon icon={cilEnvelopeLetter} className="me-2" />Plan Letterbox Drop
          </CButton>
          <CButton color="info" onClick={() => navigate('/email')}>
            <CIcon icon={cilEnvelopeOpen} className="me-2" />Compose Campaign
          </CButton>
          <CButton color="warning" onClick={() => navigate('/map')}>
            <CIcon icon={cilMap} className="me-2" />View Route Map
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => navigate('/import')}>
            <CIcon icon={cilCloudUpload} className="me-2" />Import Data
          </CButton>
        </CCardBody>
      </CCard>
    </>
  )
}
