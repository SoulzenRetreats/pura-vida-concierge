

## Plan: Accordion Lead Log with Trip Plan Details

### Context
- Bookings are linked to services via `booking_services` (booking_id, service_id) junction table
- No email notification logging exists in the database — we'll show the submission timestamp as the "Email Sent" confirmation (since the edge function sends the email at submission time)
- `booking_services` has no foreign key defined in types, so we'll need a separate query to fetch service names

### 1. `src/hooks/useBookings.ts` — Update query to include services

- Update the select to join through `booking_services` and get service names: `"*, properties(name, location), booking_services(service_id, services(name))"`
- Update the `BookingWithProperty` type to include `booking_services` with nested `services`

### 2. `src/pages/admin/Bookings.tsx` — Convert table to accordion layout

**Replace** the Table with an Accordion component:
- Each booking becomes an `AccordionItem`
- **Collapsed view (trigger):** Date range, guest count, customer name/email, occasion — same info as current rows, laid out in a compact row
- **Expanded view (content):**
  - **Trip Plan:** Bulleted list of selected service names from `booking_services`. Show "No services selected" if empty
  - **Submitted:** `format(booking.created_at, "MMM d, yyyy 'at' h:mm a")`
  - **Email Sent:** Same timestamp with recipient email (confirmation email fires on submit)
  - **Copy Lead Details button:** Copies a formatted text block (customer name, email, dates, guest count, services list) to clipboard using `navigator.clipboard.writeText()`, with a toast confirmation

### 3. `src/locales/en.json` + `src/locales/es.json` — Add new keys

Under `admin.bookings`:
- `tripPlan` / `noServices` / `submitted` / `emailSent` / `emailSentTo` / `copyDetails` / `detailsCopied`

Both files updated in parity.

### No database changes needed
The `booking_services` junction table and `services` table already exist with appropriate RLS policies.

