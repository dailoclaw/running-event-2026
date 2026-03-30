-- Sync roles from auth.users metadata into profiles table
UPDATE public.profiles p
SET role = u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE p.id = u.id
AND u.raw_user_meta_data->>'role' IS NOT NULL;
