import { useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
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

// Flies map to show all markers of a given status
function FlyToStatus({ segments, activeFilter, markerRefs }) {
  const map = useMap()
  if (!activeFilter) return null
  const filtered = segments.filter(s => s.status === activeFilter)
  if (filtered.length === 0) return null
  const bounds = filtered.map((s, i) => getSegmentCoords(s.name, i, segments.length))
  if (bounds.length === 1) {
    map.flyTo(bounds[0], 15, { duration: 0.6 })
    setTimeout(() => { const ref = markerRefs.current[filtered[0].id]; if (ref) ref.openPopup() }, 700)
  } else {
    map.flyToBounds(L.latLngBounds(bounds), { padding: [40, 40], duration: 0.8 })
  }
  return null
}

export default function DropStatusMap({ segments }) {
  const safeSegments = Array.isArray(segments) ? segments : []
  const [activeFilter, setActiveFilter] = useState(null)
  const [flyTrigger, setFlyTrigger] = useState(0)
  const markerRefs = useRef({})

  const counts = {
    pending: safeSegments.filter(s => s.status === 'pending').length,
    'in-progress': safeSegments.filter(s => s.status === 'in-progress').length,
    complete: safeSegments.filter(s => s.status === 'complete').length,
  }

  const handleFilterClick = (status) => {
    setActiveFilter(prev => prev === status ? null : status)
    setFlyTrigger(t => t + 1)
  }

  // Which segments to show — all if no filter, or just the filtered ones
  const visibleSegments = activeFilter
    ? safeSegments.filter(s => s.status === activeFilter)
    : safeSegments

  return (
    <div>
      {/* Clickable legend pills */}
      <div className="d-flex gap-3 mb-3 flex-wrap align-items-center">
        {Object.entries(STATUS_COLORS).map(([status, { fill, label }]) => (
          <button
            key={status}
            onClick={() => handleFilterClick(status)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
              border: `2px solid ${fill}`,
              background: activeFilter === status ? fill : 'transparent',
              color: activeFilter === status ? '#fff' : 'inherit',
              fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
            }}
            title={`Click to show only ${label} segments on map`}
          >
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: activeFilter === status ? '#fff' : fill,
              flexShrink: 0,
            }} />
            {label} ({counts[status]})
          </button>
        ))}
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            style={{
              padding: '6px 12px', borderRadius: 999, border: '1px solid #ccc',
              background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#666',
            }}
          >
            Show All
          </button>
        )}
        <span className="small text-muted ms-auto">Click a status to filter · Click a marker for details</span>
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
          <Polyline
            positions={COURSE}
            pathOptions={{ color: '#1F3864', weight: 3, opacity: 0.4, dashArray: '6 4' }}
          />

          {/* Fly-to handler — re-triggers when flyTrigger changes */}
          {activeFilter && (
            <FlyToStatus
              key={`${activeFilter}-${flyTrigger}`}
              segments={safeSegments}
              activeFilter={activeFilter}
              markerRefs={markerRefs}
            />
          )}

          {/* Show all markers but dim non-matching ones when filter active */}
          {safeSegments.map((seg, i) => {
            const coords = getSegmentCoords(seg.name, i, safeSegments.length)
            const { fill } = STATUS_COLORS[seg.status] || STATUS_COLORS.pending
            const dimmed = activeFilter && seg.status !== activeFilter
            const size = dimmed ? 8 : 14
            return (
              <Marker
                key={seg.id}
                position={coords}
                icon={segmentIcon(seg.status, size)}
                opacity={dimmed ? 0.3 : 1}
                ref={(r) => { if (r) markerRefs.current[seg.id] = r }}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{seg.name}</div>
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
