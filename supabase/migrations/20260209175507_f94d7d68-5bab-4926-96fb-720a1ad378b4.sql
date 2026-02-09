
-- Add is_claimed to courier_profiles
ALTER TABLE public.courier_profiles ADD COLUMN IF NOT EXISTS is_claimed boolean NOT NULL DEFAULT false;

-- Create claim_requests table
CREATE TABLE public.claim_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id UUID NOT NULL REFERENCES public.courier_profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verification_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'code_sent', 'verified', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

-- Public can create claim requests (anonymous)
CREATE POLICY "Anyone can create claim requests"
ON public.claim_requests
FOR INSERT
WITH CHECK (true);

-- Public can read their own claim request by courier_id (for checking status)
CREATE POLICY "Anyone can read claim requests by courier_id"
ON public.claim_requests
FOR SELECT
USING (true);

-- Admins can update claim requests
CREATE POLICY "Admins can update claim requests"
ON public.claim_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete claim requests
CREATE POLICY "Admins can delete claim requests"
ON public.claim_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_claim_requests_updated_at
BEFORE UPDATE ON public.claim_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
