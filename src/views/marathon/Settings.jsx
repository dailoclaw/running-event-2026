import { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader,
  CFormInput, CFormTextarea, CButton, CAlert, CRow, CCol,
} from '@coreui/react'

const DEFAULTS = {
  eventName: '2026 Adelaide Marathon',
  eventDate: '2026-09-06',
  startTime: '07:00',
  startVenue: 'Victoria Square, Adelaide CBD SA 5000',
  finishVenue: 'Glenelg Jetty, Glenelg SA 5045',
  distance: '42.2km (Full Marathon)',
  organiserName: '',
  organiserEmail: '',
  website: 'www.adelaidemarathon.com.au',
  phone: '',
  description: 'The Adelaide Marathon runs from Victoria Square in the city through Anzac Highway to the Glenelg Jetty. The event affects residential and commercial properties along the route.',
}

export default function Settings() {
  const [s, setS] = useState(() => {
    try { return JSON.parse(localStorage.getItem('marathon-settings') || 'null') || DEFAULTS }
    catch { return DEFAULTS }
  })
  const [saved, setSaved] = useState(false)

  const upd = (k, v) => setS((prev) => ({ ...prev, [k]: v }))

  const save = () => {
    localStorage.setItem('marathon-settings', JSON.stringify(s))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fields = [
    { key: 'eventName', label: 'Event Name' },
    { key: 'eventDate', label: 'Event Date', type: 'date' },
    { key: 'startTime', label: 'Start Time', type: 'time' },
    { key: 'distance', label: 'Distance / Category' },
    { key: 'startVenue', label: 'Start Venue / Address' },
    { key: 'finishVenue', label: 'Finish Venue / Address' },
    { key: 'organiserName', label: 'Organiser Name' },
    { key: 'organiserEmail', label: 'Organiser Email', type: 'email' },
    { key: 'website', label: 'Website URL', type: 'url' },
    { key: 'phone', label: 'Contact Phone' },
  ]

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Settings</h4>
        <span className="text-muted small">Event details used in email templates and print sheets</span>
      </div>

      {saved && <CAlert color="success" className="mb-3">✅ Settings saved.</CAlert>}

      <CCard className="stat-card">
        <CCardHeader className="fw-semibold">Event Details</CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            {fields.map(({ key, label, type = 'text' }) => (
              <CCol md={6} key={key}>
                <label className="form-label fw-semibold">{label}</label>
                <CFormInput
                  type={type}
                  value={s[key]}
                  onChange={(e) => upd(key, e.target.value)}
                />
              </CCol>
            ))}
            <CCol xs={12}>
              <label className="form-label fw-semibold">Event Description</label>
              <CFormTextarea
                rows={4}
                value={s.description}
                onChange={(e) => upd('description', e.target.value)}
              />
            </CCol>
          </CRow>
          <CButton color="primary" className="mt-4" onClick={save}>Save Settings</CButton>
        </CCardBody>
      </CCard>
    </>
  )
}
