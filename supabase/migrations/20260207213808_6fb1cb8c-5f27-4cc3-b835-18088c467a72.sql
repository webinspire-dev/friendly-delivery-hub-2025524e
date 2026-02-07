
-- Create courier_analytics table for tracking events
CREATE TABLE public.courier_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_id UUID REFERENCES public.courier_profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courier_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events
CREATE POLICY "Anyone can insert analytics" ON public.courier_analytics FOR INSERT WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can read analytics" ON public.courier_analytics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
