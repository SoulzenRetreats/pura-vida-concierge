

## Fix Resend Email Sender Address

**File:** `supabase/functions/submit-booking/index.ts` (line 322)

Change the `from` field from:
```
"Pura Vida Concierge <notifications@pura-vida-concierge.lovable.app>"
```
to:
```
"Pura Vida Concierge <bookings@soulzenwellness.com>"
```

Single-line change. No other files affected.

