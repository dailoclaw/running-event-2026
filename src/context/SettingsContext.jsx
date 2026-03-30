import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

function toApp(row) {
  if (!row) return DEFAULTS
  return {
    eventName:     row.event_name     || DEFAULTS.eventName,
    eventDate:     row.event_date     || DEFAULTS.eventDate,
    startTime:     row.start_time     || DEFAULTS.startTime,
    startVenue:    row.start_venue    || DEFAULTS.startVenue,
    finishVenue:   row.finish_venue   || DEFAULTS.finishVenue,
    distance:      row.distance       || DEFAULTS.distance,
    organiserName: row.organiser_name || DEFAULTS.organiserName,
    organiserEmail:row.organiser_email|| DEFAULTS.organiserEmail,
    website:       row.website        || DEFAULTS.website,
    phone:         row.phone          || DEFAULTS.phone,
    description:   row.description    || DEFAULTS.description,
  }
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setSettings(toApp(data)) })
  }, [])

  const updateSettings = async (updates) => {
    setSaving(true); setError('')
    const dbUpdates = {
      event_name:      updates.eventName,
      event_date:      updates.eventDate,
      start_time:      updates.startTime,
      start_venue:     updates.startVenue,
      finish_venue:    updates.finishVenue,
      distance:        updates.distance,
      organiser_name:  updates.organiserName,
      organiser_email: updates.organiserEmail,
      website:         updates.website,
      phone:           updates.phone,
      description:     updates.description,
      updated_at:      new Date().toISOString(),
    }
    const { error } = await supabase.from('settings').update(dbUpdates).eq('id', 1)
    if (error) setError(error.message)
    else setSettings({ ...settings, ...updates })
    setSaving(false)
    return { error }
  }

  return (
    <SettingsContext.Provider value={{ settings, saving, error, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
