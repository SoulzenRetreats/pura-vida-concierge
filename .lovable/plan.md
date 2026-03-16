## Multi-Concierge Storefront Architecture

This is a significant architectural change. I recommend executing in **three phases** to keep each deployment stable and testable.

---

### Phase 1: Database + Admin UI (no public-facing changes)

**Migration: Alter `profiles` and `services` tables**

- Add `slug TEXT UNIQUE` and `contact_email TEXT` to `profiles`
- Add `concierge_id UUID REFERENCES profiles(id)` to `services`

**Update `EditProfileDialog.tsx**`

- Add two new input fields: "URL Slug" (text, slugified) and "Contact Email" (email input)
- Update `useUpdateProfile` mutation in `useProfiles.ts` to include `slug` and `contact_email` fields

**Update `ServiceForm.tsx**`

- Add a new `concierge_id` field to the zod schema
- Add a Select dropdown labeled "Assigned Concierge" that fetches profiles with admin/staff roles (reuse `get_all_users_with_roles` RPC or query profiles directly)
- Pre-populate when editing an existing service

**Update `Services.tsx` (admin page)**

- Add a "Duplicate" action in the dropdown menu alongside Edit and Delete
- Clicking Duplicate opens the ServiceForm pre-filled with the source service's data but with `concierge_id` cleared, so the user can assign it to a different concierge

**Update `useServices.ts**`

- Include `concierge_id` in create/update mutations

**Locale strings** — Add keys for new form labels in both `en.json` and `es.json`

---

### Phase 2: Public Storefront Routing

**Update `App.tsx` routing**

- Change `/experiences` to `/:slug/experiences`
- Add `/:slug/booking` and `/:slug/success` routes
- Keep `/` as the Home page
- Add a redirect from `/experiences` → a default slug (configurable, or first available profile with a slug)

**Update `TripPlanContext.tsx**`

- Add `conciergeId` and `conciergeSlug` state to the context
- Expose `setConcierge(id, slug)` so Experiences page can set it on mount
- Persist `conciergeId` alongside `planItems` in localStorage so it survives page reloads

**Update `Experiences.tsx**`

- Read `:slug` from URL params
- Fetch profile by slug to get `concierge_id`
- Filter services query: `.eq("concierge_id", profileId)`
- Call `setConcierge()` on mount
- Update `handleFinalize` to navigate to `/${slug}/booking?services=...`

**Update `Booking.tsx**`

- Read `:slug` from URL params (or use context)
- Pass `conciergeId` in the `submit-booking` payload
- Navigate to `/${slug}/success` on completion

**Update `Navigation.tsx**`

- Update the Experiences link to use the current concierge slug from context (or fall back to `/experiences` which redirects)

**Update `Success.tsx**`

- Read `conciergeId` from TripPlanContext
- Fetch that specific profile's `whatsapp_number` and `first_name` directly from the `profiles` table instead of the `get_concierge_contact` RPC

---

### Phase 3: Email Fixes + Lead Log

**Update `submit-booking/index.ts` edge function**

- Accept `conciergeId` from the payload
- Fetch that profile's `contact_email` from `profiles` table (instead of `app_settings` notification_email)
- Send internal notification to the concierge's `contact_email`
- Add a second Resend dispatch: customer confirmation email
  - From: `Pura Vida Concierge <onboarding@resend.dev>`
  - Reply-To: the concierge's `contact_email`
  - Subject: "Your Pura Vida Trip Request is Received"
  - Body: confirmation message with trip details
- Store `concierge_id` on the booking record (the column already exists as `assigned_to`)
- Successfully dispatching the customer email must now update a new `customer_email_sent_at` column.
- Redeploy the edge function

**Update `Bookings.tsx` (Lead Log)**

- Remove the static "Confirmation sent" / `emailSentTo` placeholder text
- **EDITS**: Replace with a real timestamp read from the `customer_email_sent_at` column to verify delivery.

**Migration option for tracking**: Add `customer_email_sent_at TIMESTAMPTZ` to `bookings` table. The edge function sets this after successful Resend dispatch. The Lead Log reads it to show a real timestamp.

---

### Summary of all files touched


| Phase | Files                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Migration SQL, `EditProfileDialog.tsx`, `useProfiles.ts`, `ServiceForm.tsx`, `Services.tsx` (admin), `useServices.ts`, `en.json`, `es.json` |
| 2     | `App.tsx`, `TripPlanContext.tsx`, `Experiences.tsx`, `Booking.tsx`, `Navigation.tsx`, `Success.tsx`                                         |
| 3     | `submit-booking/index.ts`, `Bookings.tsx` (admin), Migration SQL (optional `customer_email_sent_at`)                                        |


Each phase is independently deployable — Phase 1 adds the data model and admin tools without breaking anything public. Phase 2 introduces the slug-based routing. Phase 3 wires up the email logic and lead log fix.