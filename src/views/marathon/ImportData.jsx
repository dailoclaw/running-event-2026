import { useState, useCallback } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton,
  CAlert, CSpinner, CTable, CTableHead,
  CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { importCleanExcel } from '../../utils/importExcel'
import { useMarathonStore } from '../../store/useMarathonStore'

export default function ImportData() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setContacts, setSegments, contacts } = useMarathonStore()

  const handleFile = useCallback(async (file) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      setError('Please upload an Excel file (.xlsx or .xls)')
      return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const { contacts: c, segments: s } = await importCleanExcel(file)
      setContacts(c)
      setSegments(s)
      setResult({ contacts: c.length, segments: s.length })
    } catch (e) {
      setError(`Import failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }, [setContacts, setSegments])

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Import Data</h4>
        <span className="text-muted small">Upload the cleaned Excel spreadsheet to populate all sections</span>
      </div>

      {contacts.length > 0 && (
        <CAlert color="info" className="mb-4">
          <strong>{contacts.length.toLocaleString()} contacts</strong> are currently loaded.
          Uploading a new file will replace all data.
        </CAlert>
      )}

      <CCard className="stat-card mb-4">
        <CCardHeader className="fw-semibold">Upload Spreadsheet</CCardHeader>
        <CCardBody>
          <div
            className={`drop-zone${dragging ? ' active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('xlsxInput')?.click()}
          >
            <input id="xlsxInput" type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {loading ? (
              <div>
                <CSpinner color="primary" className="mb-3" />
                <div className="fw-semibold">Reading spreadsheet...</div>
              </div>
            ) : (
              <div>
                <CIcon icon={cilCloudUpload} size="3xl" className="text-primary mb-3" />
                <div className="fw-semibold fs-5">Drop your Excel file here</div>
                <div className="text-muted mt-1">or click to browse</div>
                <div className="text-muted small mt-3">
                  Expected file: <code>Running_Event_2026_Contacts_CLEAN.xlsx</code>
                </div>
              </div>
            )}
          </div>

          {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

          {result && (
            <CAlert color="success" className="mt-3">
              <strong>Import successful!</strong><br />
              ✅ {result.contacts.toLocaleString()} contacts loaded<br />
              ✅ {result.segments} street segments loaded
              <div className="d-flex gap-2 mt-3">
                <CButton color="primary" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</CButton>
                <CButton color="success" size="sm" onClick={() => navigate('/contacts')}>View Contacts</CButton>
                <CButton color="warning" size="sm" onClick={() => navigate('/letterbox')}>Plan Drops</CButton>
              </div>
            </CAlert>
          )}
        </CCardBody>
      </CCard>

      <CCard className="stat-card">
        <CCardHeader className="fw-semibold">Expected Sheet Structure</CCardHeader>
        <CCardBody>
          <p className="text-muted mb-3">
            The app reads <code>Running_Event_2026_Contacts_CLEAN.xlsx</code> — the cleaned version of the original spreadsheet.
          </p>
          <CTable bordered small responsive>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Sheet Name</CTableHeaderCell>
                <CTableHeaderCell>Key Columns</CTableHeaderCell>
                <CTableHeaderCell>Purpose</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {[
                ['Master Contact List', 'Organisation, Email, Street, Suburb, Category, Date Sent, Response, Email Failed', 'All orgs, businesses, residents — de-duplicated'],
                ['Churches', 'Church Name, Denomination, Email, Street, Suburb, Method', 'All denominations along the route'],
                ['Businesses', 'Business Name, Area/Centre, Email, Street, Suburb', 'Glenelg & Kurralta Park businesses'],
                ['Route Street Counts', 'Route Segment, Main Rd - Houses, Main Rd - Apts, Side St - Houses...', 'Property counts for letterbox drop planning'],
              ].map(([sheet, cols, purpose]) => (
                <CTableRow key={sheet}>
                  <CTableDataCell><strong>{sheet}</strong></CTableDataCell>
                  <CTableDataCell><code style={{ fontSize: '0.75rem' }}>{cols}</code></CTableDataCell>
                  <CTableDataCell className="text-muted small">{purpose}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}
