# Supabase Database Setup

This folder contains the SQL migration files for the Running Event 2026 database.
Run these **in order** in Supabase → Database → SQL Editor if you ever need to recreate the database.

## Files — Run in This Order

| # | File | Description |
|---|------|-------------|
| 01 | `01-profiles-setup.sql` | Creates `profiles` table, RLS policies, and auto-create trigger |
| 02 | `02-fix-rls.sql` | Fixes infinite recursion in profiles RLS policies |
| 03 | `03-sync-roles.sql` | Syncs roles from auth metadata into profiles table |
| 04 | `04-profile-columns.sql` | Adds `full_name`, `avatar_url` columns + storage bucket for avatars |
| 05 | `05-fix-profile-update.sql` | Allows users to update their own profile (not admin-only) |
| 06 | `06-add-viewer-role.sql` | Adds `viewer` as a valid role option |
| 07 | `07-main-schema.sql` | Creates `contacts`, `segments`, `drop_runs`, `campaigns` tables with RLS |
| 08 | `08-settings-table.sql` | Creates `settings` table for shared event configuration |

## After Running SQL

Seed the contacts and segments by running the Python script in the project root:

```bash
python3 scripts/seed-supabase.py
```

## Supabase Project

- **Project URL:** stored in `.env.local` as `VITE_SUPABASE_URL`
- **Anon key:** stored in `.env.local` as `VITE_SUPABASE_ANON_KEY`
- **Service key:** stored in `.env.local` as `SUPABASE_SERVICE_KEY` (never commit this)
