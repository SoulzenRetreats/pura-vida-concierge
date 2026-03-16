

## Plan: WhatsApp-First Confirmation Strategy

### Problem
1. The edge function sends a customer confirmation email that needs to be removed.
2. The Success page has no visibility into the requested services because `clearTripPlan()` wipes the context before navigation.
3. The WhatsApp message is a generic greeting — it should include the service names.

### Changes

#### 1. Edge Function (`supabase/functions/submit-booking/index.ts`)
- Remove the entire customer confirmation email block (lines ~232-270 — the `fetch("https://api.resend.com/emails"...)` call to the customer email, plus the `customer_email_sent_at` update)
- Keep the internal concierge notification email intact
- Remove the `conciergeName` variable (only used in customer email)

#### 2. Booking Page (`src/pages/Booking.tsx`)
- Pass `selectedServiceNames` via React Router navigation state so Success page can read them:
  ```ts
  navigate(successPath, { state: { serviceNames: selectedServiceNames } });
  ```
- `clearTripPlan()` stays — the names are now in router state, not context

#### 3. Success Page (`src/pages/Success.tsx`)
- Read `serviceNames` from `useLocation().state`
- Render a simple list of requested services below the subtext (e.g., bulleted or comma-separated inside a Card)
- Build a dynamic WhatsApp message string:
  ```
  Hi {firstName}, I just submitted a request for my trip! My requested experiences are: {comma-separated names}.
  ```
- Use `encodeURIComponent` on the full message for the `wa.me` URL
- Phone number already strips non-digits via `.replace(/[^0-9]/g, "")`

#### 4. Locale Strings (`en.json` + `es.json`)
- Update `success.whatsappGreeting` to a template: `"Hi {{name}}, I just submitted a request for my trip! My requested experiences are: {{services}}."`
- Add `success.yourExperiences`: `"Your Requested Experiences"` / `"Tus Experiencias Solicitadas"`

### Files touched
| File | Change |
|---|---|
| `supabase/functions/submit-booking/index.ts` | Remove customer email dispatch |
| `src/pages/Booking.tsx` | Pass `serviceNames` via router state |
| `src/pages/Success.tsx` | Read state, render service list, build dynamic WhatsApp message |
| `src/locales/en.json` | Update greeting template, add `yourExperiences` |
| `src/locales/es.json` | Same |

