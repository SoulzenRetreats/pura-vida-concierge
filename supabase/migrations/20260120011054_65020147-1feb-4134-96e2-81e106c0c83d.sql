-- Create the categories table for full CRUD management
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_es text NOT NULL,
  icon text DEFAULT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Seed with existing category data (matching current ENUM values)
INSERT INTO public.categories (slug, name_en, name_es, sort_order) VALUES
  ('chef', 'Private Chef', 'Chef Privado', 1),
  ('transportation', 'Transportation', 'Transporte', 2),
  ('adventure', 'Adventure', 'Aventura', 3),
  ('spa', 'Spa & Wellness', 'Spa y Bienestar', 4),
  ('tours', 'Tours', 'Tours', 5),
  ('celebrations', 'Celebrations', 'Celebraciones', 6),
  ('luxury_items', 'Luxury Items', 'Artículos de Lujo', 7),
  ('other', 'Other Services', 'Otros Servicios', 99);

-- Change services.category from ENUM to text
ALTER TABLE public.services 
  ALTER COLUMN category TYPE text USING category::text;

-- Drop the old ENUM type
DROP TYPE IF EXISTS public.service_category;

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories (for filters/dropdowns)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();