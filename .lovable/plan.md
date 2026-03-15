

## Plan: Remove Concierge and Revenue Features

### Files to Delete (9 files)

**Concierge pages:**
- `src/pages/concierge/Dashboard.tsx`
- `src/pages/concierge/Bookings.tsx`
- `src/pages/concierge/BookingDetail.tsx`
- `src/pages/concierge/Vendors.tsx`

**Concierge components:**
- `src/components/concierge/BookingStatusBadge.tsx`
- `src/components/concierge/BookingStatusWorkflow.tsx`
- `src/components/concierge/ConciergeLayout.tsx`
- `src/components/concierge/ConciergeSidebar.tsx`
- `src/components/concierge/VendorAssignment.tsx`

**Revenue files:**
- `src/pages/admin/Revenue.tsx`
- `src/components/admin/RevenueEntryForm.tsx`
- `src/hooks/useRevenueSplits.ts`

### Files to Edit (2 files)

**`src/App.tsx`**
- Remove imports: `ConciergeLayout`, `ConciergeDashboard`, `ConciergeBookings`, `BookingDetail`, `ConciergeVendors`, `AdminRevenue`
- Remove the entire `/concierge` route block (lines ~82-92)
- Remove the `/admin/revenue` route (line ~73)

**`src/components/admin/AdminSidebar.tsx`**
- Remove `revenue` entry from `navItems` array (line 26)
- Remove `DollarSign` from lucide imports
- Remove the "View Concierge" button (lines ~81-89)

### No database changes — frontend only as requested.

