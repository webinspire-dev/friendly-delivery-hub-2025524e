
-- Add email column to courier_profiles
ALTER TABLE public.courier_profiles ADD COLUMN email text;

-- Backfill email from auth.users for existing couriers
UPDATE public.courier_profiles cp
SET email = u.email
FROM auth.users u
WHERE cp.user_id = u.id;
