

## Bug Fix + Bulk Duplicate Feature

### Bug: Duplicate creates an update instead of a new record

**Root cause**: In `handleSubmit`, the branch `if (editingService)` calls `updateService`. When duplicating, `editingService` is set (to the cloned service object including its original `id`), so the code updates the existing row rather than inserting a new one. The `isDuplicating` flag is set but never checked in the submit logic.

**Fix**: Change the condition to `if (editingService && !isDuplicating)` so that duplicates go through `createService`.

### New Feature: Bulk Duplicate

Add a "Bulk Duplicate" button to the existing selection toolbar (next to the bulk concierge assign). When clicked:
- Iterate over all selected service IDs, look up each service from the loaded `services` array
- For each, call `createService` with the same data but `concierge_id: null` (strip the `id` so it inserts as new)
- Show a success toast with count
- Clear selection after completion

### Files to change

**`src/pages/admin/Services.tsx`**
1. Fix `handleSubmit`: change `if (editingService)` to `if (editingService && !isDuplicating)`
2. Add `handleBulkDuplicate` function that maps selected services to `createService` calls with `concierge_id: null`
3. Add a "Duplicate Selected" button in the bulk action toolbar

**`src/locales/en.json`** — Add `admin.services.duplicateSelected` and `admin.services.bulkDuplicated`

**`src/locales/es.json`** — Add corresponding Spanish translations

