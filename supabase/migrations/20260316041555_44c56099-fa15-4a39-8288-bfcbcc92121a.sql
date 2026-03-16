ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS concierge_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS customer_email_sent_at timestamp with time zone;