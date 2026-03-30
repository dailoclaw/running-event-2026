// Approximate coordinates for each street segment along the marathon route
// Based on Adelaide CBD → Anzac Highway → Glenelg corridor
// Option A: marker-based, can be replaced with polygons (Option B) or user-pinned (Option C) later

export const SEGMENT_COORDS = {
  // ── Adelaide CBD ──────────────────────────────────────────────
  'ADELAIDE CBD - SOUTH TCE':           [-34.9305, 138.6010],
  'WEST TCE':                           [-34.9290, 138.5945],

  // ── Anzac Highway main carriageway ───────────────────────────
  'ANZAC HIGHWAY - southern carriageway': [-34.9450, 138.5800],
  'ANZAC HWY':                          [-34.9450, 138.5800],
  'ANZAC HWY NORTH':                    [-34.9420, 138.5820],

  // ── Anzac Highway side streets (Adelaide end) ────────────────
  'AUGUSTA ST':                         [-34.9380, 138.5870],
  'BYRON ST':                           [-34.9390, 138.5860],
  'COLLEY TCE':                         [-34.9849, 138.5160],
  'DURHAM ST':                          [-34.9400, 138.5850],
  'GORDON ST':                          [-34.9410, 138.5840],
  'NILE ST':                            [-34.9420, 138.5830],
  'ROSE TCE':                           [-34.9430, 138.5820],
  'SCOTT ST':                           [-34.9440, 138.5810],
  'SUSSEX ST':                          [-34.9450, 138.5800],
  'TORRENS SQ':                         [-34.9460, 138.5790],
  'WATERLOO ST':                        [-34.9470, 138.5780],
  'STURT ST':                           [-34.9480, 138.5770],
  'TAPLEYS HILL RD':                    [-34.9650, 138.5490],
  'OLD TAPLEYS HILL RD':                [-34.9640, 138.5500],
  'ST ANNES TCE':                       [-34.9500, 138.5750],
  'MELBOURNE ST':                       [-34.9510, 138.5740],
  'MARY ST':                            [-34.9520, 138.5730],
  'INVERARITY PLACE':                   [-34.9530, 138.5720],
  'GEORGE ST':                          [-34.9540, 138.5710],
  'FULTON ST':                          [-34.9550, 138.5700],
  'CANNING ST':                         [-34.9560, 138.5690],
  'BUCKLE ST':                          [-34.9570, 138.5680],
  'ADELPHI TCE':                        [-34.9580, 138.5670],

  // ── Glenelg sectors ──────────────────────────────────────────
  'GLENELG - SECTOR GCBD both sides':   [-34.9840, 138.5165],
  'GLENELG - SECTOR A1 both sides':     [-34.9820, 138.5180],
  'GLENELG - SECTOR A2 both sides':     [-34.9800, 138.5200],
  'GLENELG - SECTOR A3 both sides':     [-34.9780, 138.5220],
  'GLENELG - SECTOR A4 both sides':     [-34.9760, 138.5240],
  'GLENELG - SECTOR C both sides':      [-34.9750, 138.5260],

  // ── Glenelg streets ──────────────────────────────────────────
  'MOSELEY ST':                         [-34.9845, 138.5155],
  'JETTY RD':                           [-34.9840, 138.5160],
  'HIGH ST':                            [-34.9830, 138.5170],
  'MARINE PDE':                         [-34.9850, 138.5145],
  'COLLEY TCE':                         [-34.9849, 138.5157],
  'PARTRIDGE ST':                       [-34.9820, 138.5190],
  'PERCIVAL ST':                        [-34.9810, 138.5200],
  'ST JOHNS ROW':                       [-34.9800, 138.5210],
  'OLIVE ST':                           [-34.9790, 138.5220],
  'MARION ST':                          [-34.9780, 138.5230],
  'KATIES LN':                          [-34.9770, 138.5240],
  'ELIZABETH ST':                       [-34.9760, 138.5250],
  'COWPER ST':                          [-34.9750, 138.5260],
  'COLLEGE ST':                         [-34.9740, 138.5270],
  'CHAPEL ST':                          [-34.9730, 138.5280],
  'BRIGHTON RD (west)':                 [-34.9720, 138.5290],
  'BRIGHTON RD (east)':                 [-34.9710, 138.5300],
  'BRIGHTON RD':                        [-34.9700, 138.5310],
  'RUGLESS TCE':                        [-34.9700, 138.5290],
  'MAXWELL TCE':                        [-34.9690, 138.5300],
  'MALCOM ST':                          [-34.9680, 138.5310],
  'FORTROSE ST':                        [-34.9670, 138.5320],
  'SECOND AVE':                         [-34.9660, 138.5330],
  'FIRST AVE':                          [-34.9650, 138.5340],
  'DUNBAR TCE':                         [-34.9640, 138.5350],
}

// Fallback: evenly space unknown segments along the route
const ROUTE_FALLBACK = [
  [-34.9300, 138.6000],
  [-34.9400, 138.5880],
  [-34.9500, 138.5730],
  [-34.9600, 138.5580],
  [-34.9700, 138.5430],
  [-34.9800, 138.5290],
  [-34.9849, 138.5157],
]

export function getSegmentCoords(name, index, total) {
  // Exact match
  if (SEGMENT_COORDS[name]) return SEGMENT_COORDS[name]
  // Partial match
  const key = Object.keys(SEGMENT_COORDS).find(k => name.includes(k) || k.includes(name))
  if (key) return SEGMENT_COORDS[key]
  // Fallback: distribute along the route
  const idx = Math.floor((index / total) * (ROUTE_FALLBACK.length - 1))
  return ROUTE_FALLBACK[idx]
}
