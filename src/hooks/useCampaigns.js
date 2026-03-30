import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function toApp(c) {
  return {
    id: c.id,
    name: c.name || '',
    subject: c.subject || '',
    body: c.body || '',
    recipients: c.recipient_ids || [],
    sentAt: c.sent_at || '',
    status: c.status || 'draft',
    createdAt: c.created_at || '',
  }
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
    setCampaigns((data || []).map(toApp))
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addCampaign = async (campaign) => {
    const { data, error } = await supabase.from('campaigns').insert({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body,
      recipient_ids: campaign.recipients,
      sent_at: campaign.sentAt || '',
      status: campaign.status || 'draft',
    }).select().single()
    if (!error && data) setCampaigns((prev) => [toApp(data), ...prev])
    return { error }
  }

  const updateCampaign = async (id, updates) => {
    const dbUpdates = {}
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.sentAt !== undefined) dbUpdates.sent_at = updates.sentAt
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.subject !== undefined) dbUpdates.subject = updates.subject
    if (updates.body !== undefined) dbUpdates.body = updates.body
    const { error } = await supabase.from('campaigns').update(dbUpdates).eq('id', id)
    if (!error) setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c))
    return { error }
  }

  const deleteCampaign = async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (!error) setCampaigns((prev) => prev.filter((c) => c.id !== id))
    return { error }
  }

  return { campaigns, loading, addCampaign, updateCampaign, deleteCampaign, refetch: fetchAll }
}
