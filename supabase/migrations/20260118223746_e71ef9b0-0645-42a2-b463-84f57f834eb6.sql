-- Add booking_url and vendor_id columns to properties table
ALTER TABLE public.properties
ADD COLUMN booking_url text,
ADD COLUMN vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;

-- Create index for vendor lookups
CREATE INDEX idx_properties_vendor_id ON public.properties(vendor_id);