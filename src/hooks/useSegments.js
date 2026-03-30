import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function toApp(s) {
  return {
    id: s.id,
    name: s.name,
    mainHouses: s.main_houses || 0,
    mainApts: s.main_apts || 0,
    mainBusiness: s.main_business || 0,
    sideHouses: s.side_houses || 0,
    sideApts: s.side_apts || 0,
    sideBusiness: s.side_business || 0,
    total: s.total || 0,
    assignedTo: s.assigned_to || '',
    status: s.status || 'pending',
  }
}

export function useSegments() {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('segments').select('*').order('name')
    setSegments((data || []).map(toApp))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const updateSegment = async (id, updates) => {
    const dbUpdates = {}
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo
    if (updates.status !== undefined) dbUpdates.status = updates.status
    const { error } = await supabase.from('segments').update(dbUpdates).eq('id', id)
    if (!error) setSegments((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s))
    return { error }
  }

  return { segments, loading, updateSegment, refetch: fetchAll }
}
