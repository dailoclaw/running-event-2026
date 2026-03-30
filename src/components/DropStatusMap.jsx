import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { getSegmentCoords } from '../data/segmentCoordinates'

// Marathon course line
const COURSE = [
  [-34.9285, 138.6007], [-34.9305, 138.5990], [-34.9340, 138.5960],
  [-34.9400, 138.5880], [-34.9460, 138.5800], [-34.9510, 138.5730],
  [-34.9560, 138.5655], [-34.9610, 138.5580], [-34.9660, 138.5510],
  [-34.9710, 138.5440], [-34.9760, 138.5380], [-34.9810, 138.5300],
  [-34.9849, 138.5157],
]

const STATUS_COLORS = {
  'pending':     { fill: '#ffc107', border: '#e0a800', label: 'Pending' },
  'in-progress': { fill: '#0dcaf0', border: '#0aa2c0', label: 'In Progress' },
  'complete':    { fill: '#198754', border: '#146c43', label: 'Complete' },
}

function segmentIcon(status, size = 14) {
  const { fill, border } = STATUS_COLORS[status] || STATUS_COLORS.pending
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${fill};border:2px solid ${border};
      border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);
      cursor:pointer;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  })
}

export default function DropStatusMap({ segments }) {
  const safeSegments = Array.isArray(segments) ? segments : []

  const counts = {
    pending: safeSegments.filter(s => s.status === 'pending').length,
    'in-progress': safeSegments.filter(s => s.status === 'in-progress').length,
    complete: safeSegments.filter(s => s.status === 'complete').length,
  }

  return (
    <div>
      {/* Legend */}
      <div className="d-flex gap-4 mb-3 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([status, { fill, label }]) => (
          <div key={status} className="d-flex align-items-center gap-2">
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: fill, border: '2px solid rgba(0,0,0,0.2)',
              flexShrink: 0,
            }} />
            <span className="small fw-semibold">{label}</span>
            <span className="small text-muted">({counts[status]})</span>
          </div>
        ))}
        <span className="small text-muted ms-auto align-self-center">
          Click any marker for details
        </span>
      </div>

      {/* Map */}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #dee2e6' }}>
        <MapContainer
          center={[-34.955, 138.558]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: 520, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Course line */}
          <Polyline
            positions={COURSE}
            pathOptions={{ color: '#1F3864', weight: 3, opacity: 0.4, dashArray: '6 4' }}
          />

          {/* Segment markers */}
          {safeSegments.map((seg, i) => {
            const coords = getSegmentCoords(seg.name, i, safeSegments.length)
            const { fill } = STATUS_COLORS[seg.status] || STATUS_COLORS.pending
            return (
              <Marker
                key={seg.id}
                position={coords}
                icon={segmentIcon(seg.status)}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <div className="fw-bold mb-1" style={{ fontSize: 13 }}>{seg.name}</div>
                    <div style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      background: fill, color: '#fff', fontSize: 11, marginBottom: 8,
                    }}>
                      {seg.status}
                    </div>
                    <table style={{ fontSize: 12, width: '100%' }}>
                      <tbody>
                        <tr><td>Houses</td><td><strong>{seg.mainHouses + seg.sideHouses}</strong></td></tr>
                        <tr><td>Apts</td><td><strong>{seg.mainApts + seg.sideApts}</strong></td></tr>
                        <tr><td>Business</td><td><strong>{seg.mainBusiness + seg.sideBusiness}</strong></td></tr>
                        <tr><td>Total</td><td><strong>{seg.total}</strong></td></tr>
                        {seg.assignedTo && <tr><td>Volunteer</td><td><strong>{seg.assignedTo}</strong></td></tr>}
                      </tbody>
                    </table>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      <div className="text-muted small mt-2">
        ⚠️ Marker positions are approximate (Option A). Positions can be refined or replaced with drawn areas in a future update.
      </div>
    </div>
  )
}
