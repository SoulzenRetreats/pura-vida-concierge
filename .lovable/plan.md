

## Two Issues + Rename "Bookings" → "Requests"

### 1. Why the WhatsApp button is missing

The `get_notification_recipient()` RPC joins `app_settings` (where `key = 'notification_email'`) to find the concierge. I queried the database and **there is no `notification_email` row in `app_settings`**, so the function returns empty. That means `recipient` is `null`, hiding both the "Lead emailed to..." line and the WhatsApp button.

**Fix:** Go to **Settings** in the admin sidebar and configure the notification email. It must match one of your admin user emails (e.g. `cjgbaker+pvc@gmail.com`). Once set, the RPC resolves the profile, and both the email stamp and WhatsApp button appear.

No code change needed for this — it's a configuration issue.

### 2. Rename "Bookings" → "Requests" across the admin UI

This is a low-lift string-only change. No database, route, or logic changes.

**Files to update:**

- **`src/locales/en.json`**:
  - `admin.sidebar.bookings`: `"Bookings"` → `"Requests"`
  - `admin.dashboard.totalBookings`: `"Total Bookings"` → `"Total Requests"`
  - `admin.dashboard.welcomeDescription` / `gettingStarted`: replace "bookings" with "requests"
  - `concierge.bookings.title`: `"Bookings"` → `"Requests"`
  - `concierge.bookings.description`: `"...booking requests"` → `"...service requests"`
  - `concierge.bookings.noBookings`: `"No bookings found"` → `"No requests found"`
  - `concierge.dashboard` strings referencing "bookings" → "requests"

- **`src/locales/es.json`** — mirror all changes:
  - `admin.sidebar.bookings`: `"Reservas"` → `"Solicitudes"`
  - `admin.dashboard.totalBookings`: `"Total de Reservas"` → `"Total de Solicitudes"`
  - And all parallel concierge/dashboard strings

Route paths (`/admin/bookings`), DB table name (`bookings`), and code variable names stay unchanged — only user-visible labels are updated.

