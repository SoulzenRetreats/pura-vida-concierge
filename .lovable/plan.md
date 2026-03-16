

## Plan: Booking Handoff — Email, Success Page, Dynamic WhatsApp

This plan covers four interconnected changes: a new `profiles` table, admin UI for WhatsApp numbers, email notification on booking, a Success page with dynamic concierge contact, and booking redirect.

---

### 1. Database: Create `profiles` table

**Migration SQL:**
- Create `profiles` table with columns: `id uuid PK references auth.users(id)`, `first_name text`, `whatsapp_number text`, `created_at`, `updated_at`
- RLS: Admins can SELECT/UPDATE/INSERT. No public access needed (only the edge function reads it via service role, and admin panel manages it)
- A trigger to auto-create a profile row on `auth.users` insert (so every user gets a profile)
- Enable the `updated_at` trigger

### 2. Admin Panel: WhatsApp field on Users page

**Files:** `src/pages/admin/Users.tsx`, new `src/components/admin/EditProfileDialog.tsx`, `src/hooks/useUsers.ts`

- Add a new `EditProfileDialog` component with fields for `first_name` and `whatsapp_number`
- Add an "Edit Profile" option to the existing dropdown menu on each user row in the Users table
- In `useUsers.ts`, add a `useUserProfile` query and `useUpdateProfile` mutation that read/write the `profiles` table
- Display a phone icon or WhatsApp badge on user rows that have a number set

### 3. Edge Function: Email notification via Resend

**File:** `supabase/functions/submit-booking/index.ts`

- **Secret required:** `RESEND_API_KEY` — will use the `add_secret` tool to request this from the user before proceeding
- After successful booking + services insert, fetch the selected service names from the DB
- Send an HTML email to a configured admin email (stored in `app_settings` or hardcoded initially) via Resend's API (`POST https://api.resend.com/emails`)
- Email contains: Customer name, email, phone, dates, guest count, selected service names
- Failure to send email should log but NOT fail the booking response (non-blocking)

### 4. Success Page

**Files:** new `src/pages/Success.tsx`, `src/App.tsx` (add route)

- Mobile-first confirmation page with `font-heading` for luxury feel
- Headline: "Your Pura Vida journey begins."
- Subtext about team reviewing the trip plan
- On mount, query `profiles` table (via an edge function or direct query with anon key — since profiles are admin-only RLS, we'll need a small edge function or a public RLS SELECT policy for limited fields)
  - **Approach:** Add a database function `get_concierge_contact()` (SECURITY DEFINER) that returns `first_name` and `whatsapp_number` from `profiles` joined with `user_roles` where role = 'admin' or 'staff', limited to 1 row. This avoids exposing the profiles table publicly.
- Primary CTA button: "Message [Name] on WhatsApp" → opens `https://wa.me/[number]` with pre-filled greeting in new tab
- Fallback if no concierge found: generic "We'll be in touch" message without WhatsApp button

### 5. Booking Redirect

**File:** `src/pages/Booking.tsx`

- Replace the success toast + form reset with `navigate('/success')` after successful submission
- Keep `clearTripPlan()` call before navigating

---

### Technical Details

**New route in `App.tsx`:**
```
<Route path="/success" element={<Success />} />
```

**New DB function `get_concierge_contact`:**
Returns the first admin/staff user's `first_name` and `whatsapp_number` from profiles. Called from the Success page client-side via `supabase.rpc()`. SECURITY DEFINER so it bypasses RLS safely, returning only the two public-safe fields.

**Email format (Resend):**
Simple HTML email — no template library needed. Subject: "New Trip Plan Request — [Customer Name]". Body lists key details in a clean format.

**Secret needed:** `RESEND_API_KEY` must be added before the edge function can send emails. I'll request this from the user during implementation.

