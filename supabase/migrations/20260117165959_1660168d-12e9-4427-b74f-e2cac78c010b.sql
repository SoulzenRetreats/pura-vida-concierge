-- Add default_vendor_id column to services table
ALTER TABLE services 
ADD COLUMN default_vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;

-- Add comment for clarity
COMMENT ON COLUMN services.default_vendor_id IS 'Reference to the default vendor for this service';