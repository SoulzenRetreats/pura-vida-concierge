

## Plan: Update Internal Concierge Notification Email

**Single file change:** `supabase/functions/submit-booking/index.ts`

### Changes

1. **Extract `customerNotes`** — Alias `trimmed["Special notes"]` to a `customerNotes` variable for template clarity.

2. **Extract `cleanPhone`** — `(trimmed["Phone number"] || "").replace(/[^0-9]/g, "")` for the WhatsApp link in the email.

3. **Extract `conciergeName`** — `conciergeProfile?.first_name || "Team"`.

4. **Bilingual service fetch** — Update the services query from `.select("name_en")` to `.select("name_en, name_es")`. Map results to `{ name: "${s.name_en} / ${s.name_es || s.name_en}" }` so each service entry is bilingual.

5. **Replace `internalHtml`** — Swap the current plain HTML (lines 205–214) with the user's provided bilingual template, wiring:
   - `${customerName}` → `customerName.trim()`
   - `${customerEmail}` → `customerEmail.trim().toLowerCase()`
   - `${customerPhone}` → `trimmed["Phone number"]`
   - `${cleanPhone}` → sanitized phone for `wa.me` link
   - `${conciergeName}` → from profile or "Team"
   - `${selectedServices.map(...)}` → bilingual service list using `service.name`
   - `${customerNotes}` → from trimmed special notes

No other files are touched. The edge function redeploys automatically.

