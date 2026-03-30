-- Drop the recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Replace with non-recursive versions that check auth.users metadata directly
-- View: admins see all, members see only themselves
CREATE POLICY "View profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Update: only admins can change roles
CREATE POLICY "Update profiles" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Insert: allow trigger to insert new profiles
CREATE POLICY "Insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);
