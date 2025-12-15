-- Add new columns to bookings table for extended booking form
ALTER TABLE public.bookings 
ADD COLUMN budget_range text,
ADD COLUMN service_dates text,
ADD COLUMN preferred_time text,
ADD COLUMN location_details text,
ADD COLUMN occasion_type text,
ADD COLUMN dietary_preferences text,
ADD COLUMN vibe_preferences text,
ADD COLUMN surprise_elements text;

-- Create revenue_splits table for tracking revenue after booking completion
CREATE TABLE public.revenue_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  vendor_cost DECIMAL(10,2),
  concierge_share_percentage DECIMAL(5,2) DEFAULT 15.00,
  concierge_share_amount DECIMAL(10,2),
  total_charged DECIMAL(10,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on revenue_splits
ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;

-- Only admin and staff can manage revenue splits
CREATE POLICY "Admins can view revenue splits"
ON public.revenue_splits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins can insert revenue splits"
ON public.revenue_splits
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins can update revenue splits"
ON public.revenue_splits
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admins can delete revenue splits"
ON public.revenue_splits
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Add trigger for updated_at on revenue_splits
CREATE TRIGGER update_revenue_splits_updated_at
BEFORE UPDATE ON public.revenue_splits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add price column to booking_services for manual pricing
ALTER TABLE public.booking_services
ADD COLUMN price DECIMAL(10,2);