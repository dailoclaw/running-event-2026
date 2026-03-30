import { useState, useRef, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  CCard, CCardBody, CCardHeader, CBadge, CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormInput, CFormSelect, CRow, CCol,
} from '@coreui/react'

// Fix Leaflet default marker icons broken by Vite asset hashing
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const TYPE_CONFIG = {
  Start:       { color: '#198754', badge: 'success', size: 20 },
  Finish:      { color: '#FF4D4D', badge: 'danger',  size: 20 },
  'Aid Station': { color: '#0dcaf0', badge: 'info',  size: 14 },
  Water:       { color: '#6f42c1', badge: 'primary', size: 14 },
  Medical:     { color: '#dc3545', badge: 'danger',  size: 14 },
  Spectator:   { color: '#fd7e14', badge: 'warning', size: 14 },
  Other:       { color: '#6c757d', badge: 'secondary', size: 14 },
}

const DEFAULT_POINTS = [
  { id: 1, pos: [-34.9285, 138.6007], label: 'START — Victoria Square', type: 'Start' },
  { id: 2, pos: [-34.9350, 138.5960], label: 'Aid Station 1 — Anzac Hwy / Greenhill Rd', type: 'Aid Station' },
  { id: 3, pos: [-34.9460, 138.5800], label: 'Aid Station 2 — Ashford Hospital Area', type: 'Aid Station' },
  { id: 4, pos: [-34.9560, 138.5655], label: 'Water Point — Kurralta Park', type: 'Water' },
  { id: 5, pos: [-34.9660, 138.5510], label: 'Aid Station 3 — Mid Glenelg Road', type: 'Aid Station' },
  { id: 6, pos: [-34.9760, 138.5380], label: 'Water Point — Glenelg North', type: 'Water' },
  { id: 7, pos: [-34.9849, 138.5157], label: 'FINISH — Glenelg Jetty', type: 'Finish' },
]

const COURSE_LINE = [
  [-34.9285, 138.6007],
  [-34.9305, 138.5990],
  [-34.9340, 138.5960],
  [-34.9400, 138.5880],
  [-34.9460, 138.5800],
  [-34.9510, 138.5730],
  [-34.9560, 138.5655],
  [-34.9610, 138.5580],
  [-34.9660, 138.5510],
  [-34.9710, 138.5440],
  [-34.9760, 138.5380],
  [-34.9810, 138.5300],
  [-34.9849, 138.5157],
]

function dotIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.45)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  })
}

// Helper component — flies map to a point and opens its popup
function FlyToPoint({ target, markerRefs }) {
  const map = useMap()
  if (target) {
    map.flyTo(target.pos, 16, { duration: 0.8 })
    setTimeout(() => {
      const ref = markerRefs.current[target.id]
      if (ref) ref.openPopup()
    }, 850)
  }
  return null
}

function uid() { return Date.now() + Math.random() }

export default function RouteMap() {
  const [points, setPoints] = useState(() => {
    try {
      const saved = localStorage.getItem('marathon-route-points')
      return saved ? JSON.parse(saved) : DEFAULT_POINTS
    } catch { return DEFAULT_POINTS }
  })

  const [flyTarget, setFlyTarget] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editPoint, setEditPoint] = useState(null)
  const markerRefs = useRef({})

  // New/edit form state
  const [form, setForm] = useState({ label: '', type: 'Aid Station', lat: '', lng: '' })
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const savePoints = (updated) => {
    setPoints(updated)
    localStorage.setItem('marathon-route-points', JSON.stringify(updated))
  }

  const openAdd = () => {
    setForm({ label: '', type: 'Aid Station', lat: '', lng: '' })
    setEditPoint(null)
    setShowAdd(true)
  }

  const openEdit = (pt) => {
    setForm({ label: pt.label, type: pt.type, lat: pt.pos[0], lng: pt.pos[1] })
    setEditPoint(pt)
    setShowAdd(true)
  }

  const handleSave = () => {
    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (!form.label || isNaN(lat) || isNaN(lng)) return

    if (editPoint) {
      savePoints(points.map((p) => p.id === editPoint.id
        ? { ...p, label: form.label, type: form.type, pos: [lat, lng] }
        : p
      ))
    } else {
      savePoints([...points, { id: uid(), pos: [lat, lng], label: form.label, type: form.type }])
    }
    setShowAdd(false)
  }

  const deletePoint = (id) => {
    if (confirm('Delete this course point?')) {
      savePoints(points.filter((p) => p.id !== id))
    }
  }

  const resetToDefault = () => {
    if (confirm('Reset all course points to default?')) {
      savePoints(DEFAULT_POINTS)
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Route Map</h4>
          <span className="text-muted small">2026 Adelaide Marathon — Victoria Square to Glenelg Jetty via Anzac Highway</span>
        </div>
        <div className="d-flex gap-2">
          <CButton color="primary" size="sm" onClick={openAdd}>+ Add Stop</CButton>
          <CButton color="secondary" variant="outline" size="sm" onClick={resetToDefault}>Reset</CButton>
        </div>
      </div>

      <CCard className="stat-card mb-3">
        <CCardHeader className="fw-semibold d-flex gap-3 align-items-center">
          Course Map
          <span className="text-muted small fw-normal">~42.2 km · Anzac Highway corridor · Click a row below to locate on map</span>
        </CCardHeader>
        <CCardBody className="p-0" style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          <MapContainer
            center={[-34.955, 138.558]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '540px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <Polyline positions={COURSE_LINE} pathOptions={{ color: '#FF4D4D', weight: 5, opacity: 0.85 }} />

            {points.map((p) => {
              const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.Other
              return (
                <Marker
                  key={p.id}
                  position={p.pos}
                  icon={dotIcon(cfg.color, cfg.size)}
                  ref={(r) => { if (r) markerRefs.current[p.id] = r }}
                >
                  <Popup>
                    <strong>{p.label}</strong><br />
                    <span style={{
                      display: 'inline-block', marginTop: 4, padding: '2px 8px',
                      background: cfg.color, color: '#fff', borderRadius: 4, fontSize: 12,
                    }}>{p.type}</span>
                    <br />
                    <small className="text-muted">{p.pos[0].toFixed(5)}, {p.pos[1].toFixed(5)}</small>
                  </Popup>
                </Marker>
              )
            })}

            <FlyToPoint target={flyTarget} markerRefs={markerRefs} />
          </MapContainer>
        </CCardBody>
      </CCard>

      {/* Course points list */}
      <CCard className="stat-card">
        <CCardHeader className="fw-semibold d-flex justify-content-between align-items-center">
          <span>Course Points ({points.length})</span>
          <span className="text-muted small fw-normal">Click a row to show on map</span>
        </CCardHeader>
        <CCardBody className="p-0">
          <table className="table table-hover table-sm mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: 16 }}></th>
                <th>Type</th>
                <th>Label</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => {
                const cfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.Other
                return (
                  <tr
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setFlyTarget({ ...p, _ts: Date.now() })}
                  >
                    <td>
                      <span style={{
                        display: 'inline-block', width: 12, height: 12,
                        background: cfg.color, borderRadius: '50%', verticalAlign: 'middle',
                      }} />
                    </td>
                    <td><CBadge color={cfg.badge}>{p.type}</CBadge></td>
                    <td className="fw-semibold small">{p.label}</td>
                    <td className="text-muted small">{p.pos[0].toFixed(4)}, {p.pos[1].toFixed(4)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-1">
                        <CButton size="sm" color="primary" variant="outline" onClick={() => openEdit(p)}>Edit</CButton>
                        <CButton size="sm" color="danger" variant="ghost"
                          onClick={() => deletePoint(p.id)}
                          disabled={p.type === 'Start' || p.type === 'Finish'}>✕</CButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CCardBody>
      </CCard>

      {/* Add / Edit Stop Modal */}
      <CModal visible={showAdd} onClose={() => setShowAdd(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editPoint ? 'Edit Course Point' : 'Add New Course Stop'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12}>
              <label className="form-label fw-semibold">Label / Description *</label>
              <CFormInput
                placeholder="e.g. Water Point — Glenelg North"
                value={form.label}
                onChange={(e) => upd('label', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <label className="form-label fw-semibold">Type *</label>
              <CFormSelect value={form.type} onChange={(e) => upd('type', e.target.value)}>
                {Object.keys(TYPE_CONFIG).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <label className="form-label fw-semibold">Latitude *</label>
              <CFormInput
                placeholder="-34.9560"
                value={form.lat}
                onChange={(e) => upd('lat', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <label className="form-label fw-semibold">Longitude *</label>
              <CFormInput
                placeholder="138.5655"
                value={form.lng}
                onChange={(e) => upd('lng', e.target.value)}
              />
            </CCol>
          </CRow>
          <div className="alert alert-info mt-3 mb-0 small">
            💡 To get coordinates: right-click any location on <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a> → click the lat/lng shown to copy it.
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSave}
            disabled={!form.label || !form.lat || !form.lng}>
            {editPoint ? 'Save Changes' : 'Add Stop'}
          </CButton>
          <CButton color="secondary" variant="outline" onClick={() => setShowAdd(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
