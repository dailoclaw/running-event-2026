import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import seedData from '../data/seed.json'

const uid = () => Math.random().toString(36).slice(2, 10)

export const useMarathonStore = create(
  persist(
    (set, get) => ({
      // Auto-seed with real spreadsheet data on first load
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
      addDropRun: (run) => set((s) => ({ dropRuns: [...s.dropRuns, run] })),
      updateDropRun: (id, updates) =>
        set((s) => ({ dropRuns: s.dropRuns.map((r) => r.id === id ? { ...r, ...updates } : r) })),
      deleteDropRun: (id) =>
        set((s) => ({ dropRuns: s.dropRuns.filter((r) => r.id !== id) })),

      // ── Campaigns ─────────────────────────────────────────────────────────
      addCampaign: (c) => set((s) => ({ campaigns: [...s.campaigns, c] })),
      updateCampaign: (id, updates) =>
        set((s) => ({ campaigns: s.campaigns.map((c) => c.id === id ? { ...c, ...updates } : c) })),
      deleteCampaign: (id) =>
        set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),

      // ── Stats ─────────────────────────────────────────────────────────────
      getStats: () => {
        const { contacts } = get()
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
      },

      // ── Reset to seed data ────────────────────────────────────────────────
      resetToSeed: () => set({ contacts: seedData.contacts, segments: seedData.segments }),
    }),
    {
      name: 'marathon-event-2026',
      partialize: (s) => ({
        contacts: s.contacts,
        segments: s.segments,
        campaigns: s.campaigns,
        dropRuns: s.dropRuns,
      }),
    }
  )
)
