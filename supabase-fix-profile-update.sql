-- Allow users to update their OWN profile (name, avatar)
-- Admins can still update anyone's profile (for role changes)
DROP POLICY IF EXISTS "Update profiles" ON public.profiles;

CREATE POLICY "Update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins update any profile" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
