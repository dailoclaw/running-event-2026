import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Map snake_case DB cols → camelCase app fields
function toApp(c) {
  return {
    id: c.id,
    organisation: c.organisation || '',
    contactPerson: c.contact_person || '',
    email: c.email || '',
    phone: c.phone || '',
    street: c.street || '',
    suburb: c.suburb || '',
    category: c.category || '',
    sheet: c.sheet || '',
    dateSent: c.date_sent || '',
    response: c.response || '',
    emailFailed: c.email_failed || '',
    notes: c.notes || '',
    dropStatus: c.drop_status || 'pending',
    dropVolunteer: c.drop_volunteer || '',
    dropDate: c.drop_date || '',
  }
}

function toDB(c) {
  return {
    organisation: c.organisation,
    contact_person: c.contactPerson,
    email: c.email,
    phone: c.phone,
    street: c.street,
    suburb: c.suburb,
    category: c.category,
    sheet: c.sheet,
    date_sent: c.dateSent,
    response: c.response,
    email_failed: c.emailFailed,
    notes: c.notes,
    drop_status: c.dropStatus,
    drop_volunteer: c.dropVolunteer,
    drop_date: c.dropDate,
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    // Fetch all contacts in batches (Supabase default limit is 1000)
    let all = []
    let from = 0
    const batchSize = 1000
    while (true) {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .range(from, from + batchSize - 1)
        .order('organisation')
      if (error) { setError(error.message); break }
      all = [...all, ...(data || [])]
      if (!data || data.length < batchSize) break
      from += batchSize
    }
    setContacts(all.map(toApp))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const updateContact = async (id, updates) => {
    const dbUpdates = toDB({ ...updates })
    // Remove undefined keys
    Object.keys(dbUpdates).forEach(k => dbUpdates[k] === undefined && delete dbUpdates[k])
    const { error } = await supabase.from('contacts').update(dbUpdates).eq('id', id)
    if (!error) {
      setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c))
    }
    return { error }
  }

  const deleteContact = async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (!error) setContacts((prev) => prev.filter((c) => c.id !== id))
    return { error }
  }

  const getStats = () => {
    return {
      total: contacts.length,
      withEmail: contacts.filter((c) => c.email).length,
      emailed: contacts.filter((c) => c.dateSent && c.dateSent !== '').length,
      failed: contacts.filter((c) => c.emailFailed === 'Yes').length,
      responded: contacts.filter((c) => c.response === 'Yes').length,
      dropped: contacts.filter((c) => c.dropStatus === 'dropped').length,
      churches: contacts.filter((c) => c.sheet === 'Churches').length,
      businesses: contacts.filter((c) => c.sheet === 'Businesses').length,
      noEmail: contacts.filter((c) => !c.email).length,
    }
  }

  return { contacts, loading, error, updateContact, deleteContact, getStats, refetch: fetchAll }
}
