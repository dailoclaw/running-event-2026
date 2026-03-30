import * as XLSX from 'xlsx'

const uid = () => Math.random().toString(36).slice(2, 10)
const clean = (v) => (v === null || v === undefined ? '' : String(v).trim().replace(/\s+/g, ' '))

export function importCleanExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array', cellDates: true })

        const contacts = []
        const segments = []
        const seen = new Set()

        // ── Master Contact List ──────────────────────────────────────────────
        const masterSheet = wb.Sheets['Master Contact List']
        if (masterSheet) {
          const rows = XLSX.utils.sheet_to_json(masterSheet, { defval: '' })
          rows.forEach((row) => {
            const email = clean(row['Email']).toLowerCase()
            if (email && seen.has(email)) return
            if (email) seen.add(email)
            contacts.push({
              id: uid(),
              organisation: clean(row['Organisation']),
              contactPerson: clean(row['Contact Person']),
              email: clean(row['Email']).trim(),
              phone: clean(row['Phone']),
              street: clean(row['Street']),
              suburb: clean(row['Suburb']),
              category: clean(row['Category']),
              sheet: 'Master',
              dateSent: clean(row['Date Sent']),
              response: clean(row['Response']),
              emailFailed: clean(row['Email Failed']),
              notes: clean(row['Notes']),
              dropStatus: 'pending',
              dropVolunteer: '',
              dropDate: '',
            })
          })
        }

        // ── Churches ────────────────────────────────────────────────────────
        const churchSheet = wb.Sheets['Churches']
        if (churchSheet) {
          const rows = XLSX.utils.sheet_to_json(churchSheet, { defval: '' })
          rows.forEach((row) => {
            const email = clean(row['Email']).toLowerCase()
            if (email && seen.has(email)) return
            if (email) seen.add(email)
            const method = clean(row['Method'] || row['Notes'] || '')
            contacts.push({
              id: uid(),
              organisation: clean(row['Church Name']),
              contactPerson: '',
              email: clean(row['Email']).trim(),
              phone: clean(row['Phone']),
              street: clean(row['Street']),
              suburb: clean(row['Suburb']),
              category: clean(row['Denomination']) || 'Church',
              sheet: 'Churches',
              dateSent: clean(row['Date Sent']),
              response: '',
              emailFailed: '',
              notes: method,
              dropStatus: method.toLowerCase().includes('post') ? 'pending' : 'n/a',
              dropVolunteer: '',
              dropDate: '',
            })
          })
        }

        // ── Businesses ───────────────────────────────────────────────────────
        const bizSheet = wb.Sheets['Businesses']
        if (bizSheet) {
          const rows = XLSX.utils.sheet_to_json(bizSheet, { defval: '' })
          rows.forEach((row) => {
            const email = clean(row['Email']).toLowerCase()
            if (email && seen.has(email)) return
            if (email) seen.add(email)
            contacts.push({
              id: uid(),
              organisation: clean(row['Business Name']),
              contactPerson: '',
              email: clean(row['Email']).trim(),
              phone: clean(row['Phone']),
              street: clean(row['Street']),
              suburb: clean(row['Suburb']),
              category: clean(row['Area/Centre']) || 'Business',
              sheet: 'Businesses',
              dateSent: '',
              response: '',
              emailFailed: '',
              notes: clean(row['Notes']),
              dropStatus: 'pending',
              dropVolunteer: '',
              dropDate: '',
            })
          })
        }

        // ── Route Street Counts ──────────────────────────────────────────────
        const scSheet = wb.Sheets['Route Street Counts']
        if (scSheet) {
          const rows = XLSX.utils.sheet_to_json(scSheet, { defval: '0' })
          rows.forEach((row) => {
            const name = clean(row['Route Segment'])
            if (!name || name === 'TOTALS') return
            const n = (k) => parseInt(clean(row[k])) || 0
            const mh = n('Main Rd - Houses'), ma = n('Main Rd - Apts'), mb = n('Main Rd - Business')
            const sh = n('Side St - Houses'), sa = n('Side St - Apts'), sb = n('Side St - Business')
            segments.push({
              id: uid(), name,
              mainHouses: mh, mainApts: ma, mainBusiness: mb,
              sideHouses: sh, sideApts: sa, sideBusiness: sb,
              total: mh + ma + mb + sh + sa + sb,
              assignedTo: '', status: 'pending',
            })
          })
        }

        resolve({ contacts, segments })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
