-- ═══════════════════════════════════════════════════════════════
-- Running Event 2026 — Full Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── Contacts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  organisation TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  street TEXT,
  suburb TEXT,
  category TEXT,
  sheet TEXT,
  date_sent TEXT,
  response TEXT,
  email_failed TEXT,
  notes TEXT,
  drop_status TEXT DEFAULT 'pending',
  drop_volunteer TEXT,
  drop_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members and admins can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'member')
  );

CREATE POLICY "Members and admins can update contacts" ON public.contacts
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'member')
  );

CREATE POLICY "Admins can delete contacts" ON public.contacts
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ── Street Segments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  main_houses INTEGER DEFAULT 0,
  main_apts INTEGER DEFAULT 0,
  main_business INTEGER DEFAULT 0,
  side_houses INTEGER DEFAULT 0,
  side_apts INTEGER DEFAULT 0,
  side_business INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  assigned_to TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view segments" ON public.segments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members and admins can update segments" ON public.segments
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'member')
  );

CREATE POLICY "Admins can insert segments" ON public.segments
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'member')
  );

-- ── Drop Runs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.drop_runs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  volunteer TEXT,
  segment_ids TEXT[], -- array of segment IDs
  date TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drop_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view drop runs" ON public.drop_runs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members and admins can manage drop runs" ON public.drop_runs
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'member')
  );

-- ── Campaigns ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  recipient_ids TEXT[],
  sent_at TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view campaigns" ON public.campaigns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members and admins can manage campaigns" ON public.campaigns
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'member')
  );

-- ── Auto-update updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contacts_updated_at ON public.contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS segments_updated_at ON public.segments;
CREATE TRIGGER segments_updated_at BEFORE UPDATE ON public.segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS drop_runs_updated_at ON public.drop_runs;
CREATE TRIGGER drop_runs_updated_at BEFORE UPDATE ON public.drop_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
