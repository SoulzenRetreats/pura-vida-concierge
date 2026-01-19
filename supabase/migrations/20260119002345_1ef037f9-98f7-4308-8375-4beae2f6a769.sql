-- Add is_for_sale and is_rental boolean columns to services table
ALTER TABLE public.services
ADD COLUMN is_for_sale boolean DEFAULT false NOT NULL,
ADD COLUMN is_rental boolean DEFAULT false NOT NULL;

-- Migrate existing luxury_items to is_for_sale = true
UPDATE public.services 
SET is_for_sale = true 
WHERE category = 'luxury_items';