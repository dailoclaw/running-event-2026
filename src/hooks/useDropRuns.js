import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function toApp(r) {
  return {
    id: r.id,
    name: r.name || '',
    volunteer: r.volunteer || '',
    segments: r.segment_ids || [],
    date: r.date || '',
    status: r.status || 'pending',
    notes: r.notes || '',
    createdAt: r.created_at || '',
  }
}

export function useDropRuns() {
  const [dropRuns, setDropRuns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('drop_runs').select('*').order('created_at', { ascending: false })
    setDropRuns((data || []).map(toApp))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addDropRun = async (run) => {
    const { data, error } = await supabase.from('drop_runs').insert({
      id: run.id,
      name: run.name,
      volunteer: run.volunteer || '',
      segment_ids: run.segments || [],
      date: run.date || '',
      status: run.status || 'pending',
      notes: run.notes || '',
    }).select().single()
    if (!error && data) setDropRuns((prev) => [toApp(data), ...prev])
    return { error }
  }

  const updateDropRun = async (id, updates) => {
    const dbUpdates = {}
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.volunteer !== undefined) dbUpdates.volunteer = updates.volunteer
    if (updates.date !== undefined) dbUpdates.date = updates.date
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    const { error } = await supabase.from('drop_runs').update(dbUpdates).eq('id', id)
    if (!error) setDropRuns((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r))
    return { error }
  }

  const deleteDropRun = async (id) => {
    const { error } = await supabase.from('drop_runs').delete().eq('id', id)
    if (!error) setDropRuns((prev) => prev.filter((r) => r.id !== id))
    return { error }
  }

  return { dropRuns, loading, addDropRun, updateDropRun, deleteDropRun, refetch: fetchAll }
}
