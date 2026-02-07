
-- Create courier_blacklist table
CREATE TABLE public.courier_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id UUID NOT NULL REFERENCES public.courier_profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(courier_id, phone_number)
);

-- Enable RLS
ALTER TABLE public.courier_blacklist ENABLE ROW LEVEL SECURITY;

-- Couriers can read their own blacklist entries
CREATE POLICY "Couriers can read own blacklist"
ON public.courier_blacklist
FOR SELECT
USING (
  courier_id IN (
    SELECT id FROM public.courier_profiles WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Couriers can insert into their own blacklist
CREATE POLICY "Couriers can insert own blacklist"
ON public.courier_blacklist
FOR INSERT
WITH CHECK (
  courier_id IN (
    SELECT id FROM public.courier_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can delete blacklist entries
CREATE POLICY "Admins can delete blacklist entries"
ON public.courier_blacklist
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create blacklist_stats view for aggregated stats
CREATE VIEW public.blacklist_stats AS
SELECT
  phone_number,
  COUNT(*)::integer AS report_count,
  ARRAY_AGG(DISTINCT reason) FILTER (WHERE reason IS NOT NULL) AS reasons,
  MIN(created_at) AS first_reported_at,
  MAX(created_at) AS last_reported_at
FROM public.courier_blacklist
GROUP BY phone_number;

-- Add RLS policies for cities management by admins
CREATE POLICY "Admins can insert cities"
ON public.cities
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cities"
ON public.cities
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cities"
ON public.cities
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
