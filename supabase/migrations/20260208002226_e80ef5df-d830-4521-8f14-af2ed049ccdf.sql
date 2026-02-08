
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are publicly readable
CREATE POLICY "Profiles are publicly readable"
ON public.profiles FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create courier_stats view (aggregated stats from courier_profiles)
CREATE VIEW public.courier_stats
WITH (security_invoker = true) AS
SELECT
  city,
  COUNT(*)::integer AS total_couriers,
  COUNT(*) FILTER (WHERE is_available)::integer AS available_couriers,
  COUNT(*) FILTER (WHERE is_verified)::integer AS verified_couriers,
  ROUND(AVG(rating), 2) AS avg_rating,
  SUM(total_deliveries)::integer AS total_deliveries
FROM public.courier_profiles
WHERE is_blocked = false
GROUP BY city;
