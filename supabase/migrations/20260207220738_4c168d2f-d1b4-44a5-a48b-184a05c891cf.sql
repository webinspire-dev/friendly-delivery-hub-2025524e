-- Add is_active column to cities table (expected by the HeroSection from the other repo)
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;