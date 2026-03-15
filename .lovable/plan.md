

## Plan: Make Bookings Read-Only & Clean Up Vendor Assignment Logic

### Changes

**1. Rewrite `src/pages/admin/Bookings.tsx` — make it a read-only lead log**
- Remove the status override `Select` column and its handler (`handleStatusOverride`)
- Remove the `Eye` button / navigate to detail (the detail page no longer exists)
- Remove unused imports: `Select*`, `Button`, `Eye`, `useUpdateBooking`, `toast`, `useNavigate`
- Remove `allStatuses` constant
- Keep: search, status filter tabs with counts, and the read-only table (date, customer, occasion, status badge)

**2. Delete `src/hooks/useBookingDetail.ts`**
- No files import it anymore. It contains `useAssignVendor`, `useUpdateBookingStatus`, `useUpdateBookingNotes` — all concierge/vendor-assignment logic that's no longer used.

**3. Clean up `src/hooks/useBookings.ts`**
- Remove `useUpdateBooking` and `useClaimBooking` mutations (no longer needed for read-only view)
- Remove `booking-detail` invalidation references
- Keep `useBookings` (query) and `useBookingCounts` (counts) only

**4. No changes to Vendors page** — it's already a standalone address book with no booking dependencies.

### Result
- Bookings page becomes a simple read-only table: Date, Customer, Occasion, Status
- All vendor assignment and status mutation logic removed from frontend
- Vendors page untouched and fully functional

