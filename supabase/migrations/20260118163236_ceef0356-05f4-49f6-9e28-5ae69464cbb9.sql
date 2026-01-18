-- Remove the is_for_sale column since luxury_items category implies for sale
ALTER TABLE public.services DROP COLUMN IF EXISTS is_for_sale;