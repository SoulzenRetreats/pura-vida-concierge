

## Localized Service Form with EN/ES Tabs

### 1. Database Migration — Add localized columns to `services` table

Add `name_en`, `name_es`, `description_en`, `description_es` columns (text, nullable initially). Backfill from existing `name`/`description` into `name_en`/`description_en`. Keep `name` as a computed/synced column for backward compatibility (set it to `name_en` value on insert/update via trigger, or just keep writing to it).

```sql
ALTER TABLE services ADD COLUMN name_en text;
ALTER TABLE services ADD COLUMN name_es text;
ALTER TABLE services ADD COLUMN description_en text;
ALTER TABLE services ADD COLUMN description_es text;

-- Backfill existing data
UPDATE services SET name_en = name, description_en = description;

-- Make name_en NOT NULL after backfill
ALTER TABLE services ALTER COLUMN name_en SET NOT NULL;
ALTER TABLE services ALTER COLUMN description_en SET NOT NULL;
```

Keep `name` and `description` columns intact for now (backward compat with booking lead log, search, etc). We'll sync `name = name_en` on writes.

### 2. `src/components/services/ServiceForm.tsx` — Add EN/ES Tabs

- Replace single `name`/`description` fields with `Tabs` (English / Spanish)
- Schema changes: `name` → `name_en` + `name_es`, `description` → `description_en` + `description_es`
- English tab: `name_en` (required) + `description_en` (required)
- Spanish tab: `name_es` (optional) + `description_es` (optional)
- Category, toggles, prices, photo URLs remain outside tabs as global fields
- On edit, populate from `service.name_en`, `service.name_es`, etc.

### 3. `src/pages/admin/Services.tsx` — Update submission logic

- Map form data `name_en`/`name_es`/`description_en`/`description_es` to DB columns
- Also set `name = name_en` and `description = description_en` for backward compat
- Update table display to show localized name based on current language

### 4. `src/hooks/useServices.ts` — Type updates

The types auto-generate from the DB schema after migration. The `Service` type (`Tables<"services">`) will automatically include the new columns. No manual type changes needed — just ensure the hook's search uses `name_en` for filtering (or keep `name` for search since it syncs).

### 5. `src/pages/Experiences.tsx` — Display localized names

Update public-facing page to use `service.name_en`/`service.name_es` based on `i18n.language`, falling back to `service.name`.

### 6. Localization keys — `en.json` + `es.json`

Add under `admin.services.form`:
- `nameEn`, `nameEs`, `descriptionEn`, `descriptionEs`, `tabEnglish`, `tabSpanish`

### Files Changed
- **Migration**: Add 4 columns + backfill
- `src/components/services/ServiceForm.tsx`: Tabs UI, updated schema
- `src/pages/admin/Services.tsx`: Updated submit handler + table display
- `src/pages/Experiences.tsx`: Localized name/description display
- `src/locales/en.json` + `src/locales/es.json`: New keys

