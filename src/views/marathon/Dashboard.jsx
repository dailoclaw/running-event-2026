import {
  CCard, CCardBody, CCardHeader,
  CCol, CRow, CButton, CBadge, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople, cilEnvelopeLetter, cilEnvelopeOpen,
  cilMap, cilCloudUpload,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useContacts } from '../../hooks/useContacts'
import { useSegments } from '../../hooks/useSegments'
import { useDropRuns } from '../../hooks/useDropRuns'
import { useSettings } from '../../context/SettingsContext'

function ProgressBar({ value, color = '#0d6efd' }) {
  return (
    <div style={{ background: '#e9ecef', borderRadius: 6, height: 10, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        height: '100%', background: color, borderRadius: 6,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

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
  const { settings } = useSettings()
  const { contacts, loading: cLoading, getStats } = useContacts()
  const { segments, loading: sLoading } = useSegments()
  const { dropRuns, loading: dLoading } = useDropRuns()

  const loading = cLoading || sLoading || dLoading
  const stats = getStats()

  const safeSegments = Array.isArray(segments) ? segments : []
  const safeDropRuns = Array.isArray(dropRuns) ? dropRuns : []

  const totalProps = safeSegments.reduce((a, s) => a + s.total, 0)
  const completedProps = safeSegments.filter((s) => s.status === 'complete').reduce((a, s) => a + s.total, 0)
  const completedSegments = safeSegments.filter((s) => s.status === 'complete').length
  const completedRuns = safeDropRuns.filter((r) => r.status === 'complete').length

  const emailedPct = stats.total ? Math.round((stats.emailed / stats.total) * 100) : 0
  const respondedPct = stats.emailed ? Math.round((stats.responded / stats.emailed) * 100) : 0
  const failedPct = stats.total ? Math.round((stats.failed / stats.total) * 100) : 0
  const propsPct = totalProps ? Math.round((completedProps / totalProps) * 100) : 0
  const segPct = safeSegments.length ? Math.round((completedSegments / safeSegments.length) * 100) : 0
  const runsPct = safeDropRuns.length ? Math.round((completedRuns / safeDropRuns.length) * 100) : 0

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" className="mb-3" />
        <div className="text-muted">Loading data...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Dashboard</h4>
        <span className="text-muted small">{settings.eventName} — Community Outreach Overview</span>
      </div>

      <CRow className="g-3 mb-4">
        <CCol sm={6} xl={3}>
          <StatCard label="Total Contacts" value={stats.total.toLocaleString()} sub="all sheets" color="primary" icon={cilPeople} to="/contacts" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard label="Churches" value={stats.churches} sub="denominations" color="info" icon={cilPeople} to="/contacts?sheet=Churches" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard label="Businesses" value={stats.businesses} sub="along route" color="warning" icon={cilPeople} to="/contacts?sheet=Businesses" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard label="Properties" value={totalProps.toLocaleString()} sub={`${safeSegments.length} street segments`} color="success" icon={cilEnvelopeLetter} to="/letterbox" />
        </CCol>
      </CRow>

      <CRow className="g-3 mb-4">
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
                <ProgressBar value={emailedPct} color="#0d6efd" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Responses Received</span>
                  <strong className="text-success">{stats.responded} ({respondedPct}%)</strong>
                </div>
                <ProgressBar value={respondedPct} color="#198754" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-danger">Failed / Bounced</span>
                  <strong className="text-danger">{stats.failed} ({failedPct}%)</strong>
                </div>
                <ProgressBar value={failedPct} color="#dc3545" />
              </div>
              <div className="d-flex gap-2 mt-3">
                <CBadge color="secondary">{stats.noEmail} no email — letterbox only</CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="stat-card h-100">
            <CCardHeader className="fw-semibold d-flex justify-content-between align-items-center">
              <span><CIcon icon={cilEnvelopeLetter} className="me-2 text-success" />Letterbox Drop Progress</span>
              <CButton size="sm" color="success" variant="ghost" onClick={() => navigate('/letterbox')}>Plan →</CButton>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Properties Covered</span>
                  <strong className="text-success">{completedProps.toLocaleString()} / {totalProps.toLocaleString()} ({propsPct}%)</strong>
                </div>
                <ProgressBar value={propsPct} color="#198754" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Segments Complete</span>
                  <strong>{completedSegments} / {safeSegments.length} ({segPct}%)</strong>
                </div>
                <ProgressBar value={segPct} color="#FF4D4D" />
              </div>
              <div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Drop Runs Complete</span>
                  <strong>{completedRuns} / {safeDropRuns.length} ({runsPct}%)</strong>
                </div>
                <ProgressBar value={runsPct} color="#0dcaf0" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

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
