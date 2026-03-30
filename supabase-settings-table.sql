-- Single-row settings table for event configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  event_name TEXT DEFAULT '2026 Adelaide Marathon',
  event_date TEXT DEFAULT '2026-09-06',
  start_time TEXT DEFAULT '07:00',
  start_venue TEXT DEFAULT 'Victoria Square, Adelaide CBD SA 5000',
  finish_venue TEXT DEFAULT 'Glenelg Jetty, Glenelg SA 5045',
  distance TEXT DEFAULT '42.2km (Full Marathon)',
  organiser_name TEXT DEFAULT '',
  organiser_email TEXT DEFAULT '',
  website TEXT DEFAULT 'www.adelaidemarathon.com.au',
  phone TEXT DEFAULT '',
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Insert default row
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
