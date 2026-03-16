

## Execution Plan

### 1. `src/hooks/useServices.ts` — Add concierge filter + bulk mutation

- Add `conciergeFilter?: string` to `UseServicesOptions`
- When set and not `"all"`, append `.eq("concierge_id", conciergeFilter)` to the query
- Include `conciergeFilter` in query key
- Add `useBulkUpdateConcierge` mutation: accepts `{ serviceIds: string[], conciergeId: string | null }`, runs `.update({ concierge_id }).in("id", serviceIds)`, invalidates `["services"]`

### 2. `src/pages/admin/Services.tsx` — Concierge column, filter, bulk select

- Import `useConciergeProfiles` from `useProfiles`, `Checkbox` from UI
- Add state: `conciergeFilter`, `selectedIds: Set<string>`
- Add concierge filter Select dropdown next to category filter
- Pass `conciergeFilter` to `useServices`
- Replace "Status" column header with "Concierge"
- Replace `is_for_sale`/`is_rental` badge cell with concierge `first_name` lookup (or "Unassigned" badge)
- Add checkbox column: header checkbox toggles all, row checkboxes toggle individual
- When `selectedIds.size > 0`, render a bulk action toolbar above the table with a concierge Select + "Assign" button
- Clear selection after successful bulk update
- Update `colSpan` from 5 to 6 for empty/loading states

### 3. `src/App.tsx` — Add `/:slug` route

- Add `<Route path="/:slug" element={<Home />} />` immediately before the `<Route path="*">` catch-all
- All static routes (`/properties`, `/login/auth`, `/admin/*`, `/booking`, `/success`, `/experiences`, `/:slug/experiences`, etc.) are defined above it, so they match first

### 4. `src/pages/Home.tsx` — Mandatory slug context binding

- Import `useParams` and `useProfileBySlug` 
- Read `:slug` from URL params
- When `slug` is present, fetch the profile via `useProfileBySlug(slug)`
- On successful profile fetch, call `setConcierge(profile.id, profile.slug)` in a `useEffect`
- The existing `conciergeSlug` logic for CTA links already works once context is set

### 5. Locale strings (`en.json` + `es.json`)

- Replace `"status": "Status"` with `"concierge": "Concierge"` in `admin.services.columns`
- Add keys: `admin.services.unassigned`, `admin.services.allConcierges`, `admin.services.bulkAssign`, `admin.services.assignSelected`, `admin.services.bulkAssigned`

### Files touched
| File | Change |
|---|---|
| `src/hooks/useServices.ts` | Concierge filter param + `useBulkUpdateConcierge` |
| `src/pages/admin/Services.tsx` | Column swap, filter, checkbox bulk select toolbar |
| `src/App.tsx` | `/:slug` route before catch-all |
| `src/pages/Home.tsx` | Read `:slug`, validate profile, fire `setConcierge()` |
| `src/locales/en.json` | New/updated keys |
| `src/locales/es.json` | New/updated keys |

