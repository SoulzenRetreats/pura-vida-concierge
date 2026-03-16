
-- Add slug and contact_email to profiles
ALTER TABLE public.profiles ADD COLUMN slug text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN contact_email text;

-- Add concierge_id to services
ALTER TABLE public.services ADD COLUMN concierge_id uuid REFERENCES public.profiles(id);

-- Add RLS policy for public to read profiles by slug (needed for storefront routing)
CREATE POLICY "Anyone can read profiles by slug"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (slug IS NOT NULL);
