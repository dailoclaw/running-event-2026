import { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader,
  CFormInput, CFormTextarea, CButton, CAlert, CRow, CCol, CSpinner,
} from '@coreui/react'
import { useSettings } from '../../context/SettingsContext'

export default function Settings() {
  const { settings, saving, error, updateSettings } = useSettings()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  // Sync form if settings load async
  useEffect(() => { setForm({ ...settings }) }, [settings])

  const upd = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const save = async () => {
    const { error } = await updateSettings(form)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const fields = [
    { key: 'eventName',      label: 'Event Name' },
    { key: 'eventDate',      label: 'Event Date',   type: 'date' },
    { key: 'startTime',      label: 'Start Time',   type: 'time' },
    { key: 'distance',       label: 'Distance / Category' },
    { key: 'startVenue',     label: 'Start Venue / Address' },
    { key: 'finishVenue',    label: 'Finish Venue / Address' },
    { key: 'organiserName',  label: 'Organiser Name' },
    { key: 'organiserEmail', label: 'Organiser Email', type: 'email' },
    { key: 'website',        label: 'Website URL' },
    { key: 'phone',          label: 'Contact Phone' },
  ]

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Settings</h4>
        <span className="text-muted small">Event details — shared across all users</span>
      </div>

      {saved && <CAlert color="success" className="mb-3">✅ Settings saved and synced for all users.</CAlert>}
      {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}

      <CCard className="stat-card">
        <CCardHeader className="fw-semibold">Event Details</CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            {fields.map(({ key, label, type = 'text' }) => (
              <CCol md={6} key={key}>
                <label className="form-label fw-semibold">{label}</label>
                <CFormInput
                  type={type}
                  value={form[key] || ''}
                  onChange={(e) => upd(key, e.target.value)}
                />
              </CCol>
            ))}
            <CCol xs={12}>
              <label className="form-label fw-semibold">Event Description</label>
              <CFormTextarea
                rows={4}
                value={form.description || ''}
                onChange={(e) => upd('description', e.target.value)}
              />
            </CCol>
          </CRow>
          <CButton color="primary" className="mt-4" onClick={save} disabled={saving}>
            {saving ? <CSpinner size="sm" className="me-2" /> : null}
            {saving ? 'Saving...' : 'Save Settings'}
          </CButton>
        </CCardBody>
      </CCard>
    </>
  )
}
