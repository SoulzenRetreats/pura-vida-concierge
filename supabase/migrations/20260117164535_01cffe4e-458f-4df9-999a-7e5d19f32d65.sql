-- Add new enum value for luxury items
ALTER TYPE service_category ADD VALUE 'luxury_items';

-- Add columns to services table for items for sale
ALTER TABLE services 
ADD COLUMN is_for_sale boolean DEFAULT false,
ADD COLUMN price numeric DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN services.is_for_sale IS 'True if this is a luxury item for sale rather than a service';
COMMENT ON COLUMN services.price IS 'Fixed price for items for sale (use price_range for services)';