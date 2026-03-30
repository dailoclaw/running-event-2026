import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import seedData from '../data/seed.json'

export const useMarathonStore = create(
  persist(
    (set, get) => ({
      contacts: seedData.contacts,
      segments: seedData.segments,
      campaigns: [],
      dropRuns: [],

      // ── Contacts ──────────────────────────────────────────────────────────
      setContacts: (contacts) => set({ contacts }),
      updateContact: (id, updates) =>
        set((s) => ({ contacts: s.contacts.map((c) => c.id === id ? { ...c, ...updates } : c) })),
      deleteContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      // ── Segments ──────────────────────────────────────────────────────────
      setSegments: (segments) => set({ segments }),
      updateSegment: (id, updates) =>
        set((s) => ({ segments: s.segments.map((seg) => seg.id === id ? { ...seg, ...updates } : seg) })),

      // ── Drop Runs ─────────────────────────────────────────────────────────
      addDropRun: (run) => set((s) => ({ dropRuns: Array.isArray(s.dropRuns) ? [...s.dropRuns, run] : [run] })),
      updateDropRun: (id, updates) =>
        set((s) => ({ dropRuns: (s.dropRuns || []).map((r) => r.id === id ? { ...r, ...updates } : r) })),
      deleteDropRun: (id) =>
        set((s) => ({ dropRuns: (s.dropRuns || []).filter((r) => r.id !== id) })),

      // ── Campaigns ─────────────────────────────────────────────────────────
      addCampaign: (c) => set((s) => ({ campaigns: Array.isArray(s.campaigns) ? [...s.campaigns, c] : [c] })),
      updateCampaign: (id, updates) =>
        set((s) => ({ campaigns: (s.campaigns || []).map((c) => c.id === id ? { ...c, ...updates } : c) })),
      deleteCampaign: (id) =>
        set((s) => ({ campaigns: (s.campaigns || []).filter((c) => c.id !== id) })),

      // ── Stats ─────────────────────────────────────────────────────────────
      getStats: () => {
        const { contacts } = get()
        const c = contacts || []
        return {
          total: c.length,
          withEmail: c.filter((x) => x.email).length,
          emailed: c.filter((x) => x.dateSent && x.dateSent !== '').length,
          failed: c.filter((x) => x.emailFailed === 'Yes').length,
          responded: c.filter((x) => x.response === 'Yes').length,
          dropped: c.filter((x) => x.dropStatus === 'dropped').length,
          churches: c.filter((x) => x.sheet === 'Churches').length,
          businesses: c.filter((x) => x.sheet === 'Businesses').length,
          noEmail: c.filter((x) => !x.email).length,
        }
      },

      resetToSeed: () => set({ contacts: seedData.contacts, segments: seedData.segments }),
    }),
    {
      name: 'marathon-event-2026',
      // merge so seed data is never clobbered but campaigns/dropRuns always persist
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        // always ensure arrays, never undefined
        campaigns: Array.isArray(persisted?.campaigns) ? persisted.campaigns : [],
        dropRuns: Array.isArray(persisted?.dropRuns) ? persisted.dropRuns : [],
        contacts: Array.isArray(persisted?.contacts) && persisted.contacts.length > 0
          ? persisted.contacts
          : current.contacts,
        segments: Array.isArray(persisted?.segments) && persisted.segments.length > 0
          ? persisted.segments
          : current.segments,
      }),
    }
  )
)
