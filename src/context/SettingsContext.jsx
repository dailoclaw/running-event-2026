import { createContext, useContext, useState } from 'react'

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
  description: 'The Adelaide Marathon runs from Victoria Square in the city through Anzac Highway to the Glenelg Jetty.',
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('marathon-settings') || 'null') || DEFAULTS
    } catch { return DEFAULTS }
  })

  const updateSettings = (updates) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    localStorage.setItem('marathon-settings', JSON.stringify(next))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
