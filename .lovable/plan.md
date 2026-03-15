

## Plan: Strip All Status Logic from Admin Bookings

### Files to Delete (1)
- **`src/components/BookingStatusBadge.tsx`** — only imported by Bookings.tsx; no longer needed

### Files to Edit (2)

**`src/pages/admin/Bookings.tsx`** — major rewrite:
- Remove imports: `Tabs`, `TabsList`, `TabsTrigger`, `BookingStatusBadge`, `useBookingCounts`, `Database` type
- Remove `BookingStatus` type alias, `statusTabs` constant, `statusFilter` state, `counts` query
- Remove the entire `<Tabs>` block (status filter tabs)
- Remove the Status `<TableHead>` and Status `<TableCell>` (with badge) from the table
- Change `useBookings` call to only pass `searchTerm` (no `statusFilter`)
- Hardcode title to "Lead Log" and subtitle to "Read-only list of submitted inquiries" (no i18n key dependency)

**`src/hooks/useBookings.ts`** — simplify:
- Remove `useBookingCounts` function entirely
- Remove `BookingStatus` type and `statusFilter` from `UseBookingsOptions` interface
- Remove the `if (statusFilter !== "all")` filter branch from query
- Keep only `useBookings` with `searchTerm` support

### No other files reference these status constructs. No database changes.

