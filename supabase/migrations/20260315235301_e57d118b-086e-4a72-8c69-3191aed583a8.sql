
ALTER TABLE public.services ADD COLUMN name_en text;
ALTER TABLE public.services ADD COLUMN name_es text;
ALTER TABLE public.services ADD COLUMN description_en text;
ALTER TABLE public.services ADD COLUMN description_es text;

-- Backfill existing data
UPDATE public.services SET name_en = name, description_en = description WHERE name_en IS NULL;

-- Make required columns NOT NULL after backfill
ALTER TABLE public.services ALTER COLUMN name_en SET NOT NULL;
ALTER TABLE public.services ALTER COLUMN description_en SET NOT NULL;
