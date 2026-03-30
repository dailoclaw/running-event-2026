import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { CCard, CCardBody, CCardHeader, CBadge } from '@coreui/react'

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

// Adelaide Marathon course: Victoria Square → Glenelg via Anzac Hwy
const COURSE = [
  [-34.9285, 138.6007], // Victoria Square (Start)
  [-34.9305, 138.5990], // South Terrace
  [-34.9340, 138.5960], // Anzac Hwy entry
  [-34.9400, 138.5880],
  [-34.9460, 138.5800], // Ashford Hospital area
  [-34.9510, 138.5730],
  [-34.9560, 138.5655], // Kurralta Park
  [-34.9610, 138.5580],
  [-34.9660, 138.5510],
  [-34.9710, 138.5440],
  [-34.9760, 138.5380],
  [-34.9810, 138.5300],
  [-34.9849, 138.5157], // Glenelg Jetty (Finish)
]

function dotIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}

const POINTS = [
  { pos: [-34.9285, 138.6007], label: 'START — Victoria Square', color: '#198754', type: 'Start' },
  { pos: [-34.9350, 138.5960], label: 'Aid Station 1 — Anzac Hwy / Greenhill Rd', color: '#0dcaf0', type: 'Aid Station' },
  { pos: [-34.9460, 138.5800], label: 'Aid Station 2 — Ashford Hospital Area', color: '#0dcaf0', type: 'Aid Station' },
  { pos: [-34.9560, 138.5655], label: 'Water Point — Kurralta Park', color: '#6f42c1', type: 'Water' },
  { pos: [-34.9660, 138.5510], label: 'Aid Station 3 — Mid Glenelg Road', color: '#0dcaf0', type: 'Aid Station' },
  { pos: [-34.9760, 138.5380], label: 'Water Point — Glenelg North', color: '#6f42c1', type: 'Water' },
  { pos: [-34.9849, 138.5157], label: 'FINISH — Glenelg Jetty', color: '#FF4D4D', type: 'Finish' },
]

const TYPE_BADGE = {
  Start: 'success',
  Finish: 'danger',
  'Aid Station': 'info',
  Water: 'primary',
}

export default function RouteMap() {
  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Route Map</h4>
        <span className="text-muted small">
          2026 Adelaide Marathon — Victoria Square CBD to Glenelg Jetty via Anzac Highway
        </span>
      </div>

      <CCard className="stat-card mb-3">
        <CCardHeader className="fw-semibold d-flex gap-3 align-items-center">
          Course Map
          <span className="text-muted small fw-normal">~42.2 km · Anzac Highway corridor</span>
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
            <Polyline positions={COURSE} pathOptions={{ color: '#FF4D4D', weight: 5, opacity: 0.85 }} />
            {POINTS.map((p) => (
              <Marker
                key={p.label}
                position={p.pos}
                icon={dotIcon(p.color, p.type === 'Start' || p.type === 'Finish' ? 20 : 14)}
              >
                <Popup>
                  <strong>{p.label}</strong>
                  <br />
                  <span style={{
                    display: 'inline-block', marginTop: 4, padding: '2px 8px',
                    background: p.color, color: '#fff', borderRadius: 4, fontSize: 12,
                  }}>{p.type}</span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </CCardBody>
      </CCard>

      {/* Legend */}
      <CCard className="stat-card">
        <CCardHeader className="fw-semibold">Course Points</CCardHeader>
        <CCardBody className="p-0">
          <table className="table table-hover table-sm mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: 24 }}></th>
                <th>Type</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {POINTS.map((p) => (
                <tr key={p.label}>
                  <td>
                    <span style={{
                      display: 'inline-block', width: 12, height: 12,
                      background: p.color, borderRadius: '50%', verticalAlign: 'middle',
                    }} />
                  </td>
                  <td><CBadge color={TYPE_BADGE[p.type] || 'secondary'}>{p.type}</CBadge></td>
                  <td>{p.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CCardBody>
      </CCard>
    </>
  )
}
