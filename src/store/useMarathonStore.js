// Legacy store — kept for campaigns and drop_runs until fully migrated
// Contacts and segments now served from Supabase
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMarathonStore = create(
  persist(
    (set, get) => ({
      campaigns: [],
      dropRuns: [],

      addCampaign: (c) => set((s) => ({ campaigns: Array.isArray(s.campaigns) ? [...s.campaigns, c] : [c] })),
      updateCampaign: (id, updates) =>
        set((s) => ({ campaigns: (s.campaigns || []).map((c) => c.id === id ? { ...c, ...updates } : c) })),
      deleteCampaign: (id) =>
        set((s) => ({ campaigns: (s.campaigns || []).filter((c) => c.id !== id) })),

      addDropRun: (run) => set((s) => ({ dropRuns: Array.isArray(s.dropRuns) ? [...s.dropRuns, run] : [run] })),
      updateDropRun: (id, updates) =>
        set((s) => ({ dropRuns: (s.dropRuns || []).map((r) => r.id === id ? { ...r, ...updates } : r) })),
      deleteDropRun: (id) =>
        set((s) => ({ dropRuns: (s.dropRuns || []).filter((r) => r.id !== id) })),
    }),
    {
      name: 'marathon-event-2026-v2',
      partialize: (s) => ({ campaigns: s.campaigns, dropRuns: s.dropRuns }),
      merge: (persisted, current) => ({
        ...current,
        campaigns: Array.isArray(persisted?.campaigns) ? persisted.campaigns : [],
        dropRuns: Array.isArray(persisted?.dropRuns) ? persisted.dropRuns : [],
      }),
    }
  )
)
