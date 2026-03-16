

## Fix Lead Log: Accurate Notification Info + WhatsApp Button

### Problem
The Lead Log shows "Confirmation sent to {customer_email}" which is false — no email goes to the customer. The notification goes to the admin/staff concierge configured in `app_settings.notification_email`.

### Approach

**1. New DB function: `get_notification_recipient`**

Create a `SECURITY DEFINER` function that joins `app_settings` (notification_email) → `auth.users` (match by email) → `profiles` (get whatsapp_number and first_name). Returns `{ email, first_name, whatsapp_number }`. This ensures the WhatsApp button links to the **same person** who received the email.

```sql
CREATE OR REPLACE FUNCTION public.get_notification_recipient()
RETURNS TABLE(email text, first_name text, whatsapp_number text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.email::text, p.first_name, p.whatsapp_number
  FROM app_settings s
  JOIN auth.users au ON au.email = (s.value #>> '{}')  -- jsonb to text
  JOIN profiles p ON p.id = au.id
  WHERE s.key = 'notification_email'
  LIMIT 1;
END;
$$;
```

**2. New hook: `useNotificationRecipient`** in `src/hooks/useBookings.ts`

Calls the RPC and caches the result. Returns `{ email, first_name, whatsapp_number }`.

**3. Update `src/pages/admin/Bookings.tsx`**

- Fetch notification recipient via the new hook
- Replace the misleading "Confirmation sent to {customer}" line with: **"Lead emailed to {recipient_email} on {date}"**
- Add a WhatsApp button next to "Copy Lead Details" that opens `https://wa.me/{whatsapp_number}` (stripped of non-digits)

**4. Update locale strings** (en.json + es.json)

- Change `emailSentTo` → `"Lead emailed to {{email}} on {{date}}"`
- Add `whatsappConcierge` → `"WhatsApp"`

### Files Changed
- **Migration**: new `get_notification_recipient()` function
- **`src/hooks/useBookings.ts`**: add `useNotificationRecipient` hook
- **`src/pages/admin/Bookings.tsx`**: swap email line, add WhatsApp button
- **`src/locales/en.json`** + **`src/locales/es.json`**: update strings

