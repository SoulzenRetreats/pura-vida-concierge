

## Plan: Modernize `useServices` Hook

### File: `src/hooks/useServices.ts` — Edit

1. **Remove `vendor_name` from `Service` type** — change to `export type Service = Tables<"services">;` (the generated type already includes `price_min` and `price_max`)

2. **Remove vendor join from query** — change `.select(...)` from the multi-line join to `.select("*")`

3. **Remove hard-coded enum cast** — change the category filter line from `.eq("category", categoryFilter as "adventure" | ...)` to simply `.eq("category", categoryFilter)`

4. **Remove vendor_name transformation** — replace the `.map()` return with a direct `return (data || []) as Service[]`

### File: `src/pages/admin/Services.tsx` — Edit

- Remove the "Default Vendor" table column header and the `<TableCell>{service.vendor_name || "-"}</TableCell>` cell (line ~240), since `vendor_name` no longer exists on the `Service` type
- Update `colSpan` on empty/loading rows from 6 to 5

### No other files affected
`useProperties.ts` and `Properties.tsx` still use their own vendor_name logic independently — not touched here.

