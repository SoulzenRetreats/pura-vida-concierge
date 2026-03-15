

## Plan: Unify Pricing Model and Remove Legacy Fields

### 1. `src/components/services/ServiceForm.tsx` — Major Edit

**Remove:**
- `import { useVendors }` and `const { data: vendors } = useVendors({})`
- Schema fields: `price_range`, `price`, `default_vendor_id`
- `isLuxuryItem` / `selectedCategory` watch logic
- The conditional price_range / price `<FormField>` block (lines 231-270)
- The Default Vendor `<FormField>` block (lines 291-322)

**Add to schema:**
- `price_min: z.number().optional().nullable()`
- `price_max: z.number().optional().nullable()`

**Add to form UI** (replacing the old price block):
- Two side-by-side number inputs: "Minimum Price" (`price_min`) and "Maximum Price" (`price_max`)
- Helper text below: "For fixed prices, set both Min and Max to the same value."

**Update reset logic** to populate `price_min` / `price_max` from `service.price_min` / `service.price_max` instead of `price_range` / `price` / `default_vendor_id`.

### 2. `src/pages/admin/Services.tsx` — Edit `handleSubmit` (lines 78-108)

**Update data type and `serviceData` object:**
- Remove `price_range`, `price`, `default_vendor_id`
- Add `price_min` and `price_max`

### 3. `src/pages/Experiences.tsx` — Edit price display (lines 241-250)

Replace the current price display logic with:
- If `price_min && price_max && price_min === price_max` → show `$X`
- If `price_min && price_max && price_min !== price_max` → show `$X - $Y`
- If only `price_min` → show `From $X`
- Otherwise → show nothing

Remove references to `service.price` and `service.price_range`.

### No database or hook changes needed
`useServices.ts` already uses `Tables<"services">` which includes `price_min` and `price_max`. The old columns (`price`, `price_range`, `default_vendor_id`) remain in the DB but are simply no longer written to or read from the UI.

