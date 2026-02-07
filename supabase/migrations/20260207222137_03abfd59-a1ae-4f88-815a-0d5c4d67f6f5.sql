
-- Fix: Drop and recreate blacklist_stats view with SECURITY INVOKER
DROP VIEW IF EXISTS public.blacklist_stats;

CREATE VIEW public.blacklist_stats
WITH (security_invoker = true) AS
SELECT
  phone_number,
  COUNT(*)::integer AS report_count,
  ARRAY_AGG(DISTINCT reason) FILTER (WHERE reason IS NOT NULL) AS reasons,
  MIN(created_at) AS first_reported_at,
  MAX(created_at) AS last_reported_at
FROM public.courier_blacklist
GROUP BY phone_number;
