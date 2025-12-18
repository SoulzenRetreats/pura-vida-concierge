-- Create app_settings table for global configuration
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings" 
ON public.app_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update settings
CREATE POLICY "Admins can update settings" 
ON public.app_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default revenue share percentage
INSERT INTO public.app_settings (key, value) 
VALUES ('revenue_share_percentage', '15'::jsonb);