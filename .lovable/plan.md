

## Plan: URL-Driven Checkout + Admin Slug Protection

### Part 1: URL-Driven Checkout Flow

**Goal**: Remove dependency on context for concierge identity during checkout. The slug in the URL becomes the source of truth.

#### 1a. Remove legacy routes from `src/App.tsx`
- Delete the two legacy routes: `<Route path="/booking">` and `<Route path="/success">`. Only `/:slug/booking` and `/:slug/success` remain.

#### 1b. Update navigation links across the app
All links that currently fall back to `/booking` must now require a slug:

| File | Current | Updated |
|---|---|---|
| `src/pages/Home.tsx` (line 27) | `activeSlug ? ... : "/booking"` | Always use `/${activeSlug}/booking` (guard: only render CTA if activeSlug exists) |
| `src/pages/Experiences.tsx` (line 326) | `slug ? ... : "/booking"` | Always use `/${slug}/booking` (slug is guaranteed from URL params on this page) |
| `src/pages/Properties.tsx` (lines 128, 174) | Hardcoded `/booking` | Use conciergeSlug from context: `/${conciergeSlug}/booking` or hide CTA if no slug |
| `src/components/Footer.tsx` (line 38) | Hardcoded `/booking` | Use conciergeSlug from context, or hide link if unavailable |

#### 1c. Update `src/pages/Booking.tsx`
- `slug` from `useParams` is now required (no more optional fallback to context slug).
- Use `useProfileBySlug(slug)` to fetch the concierge profile directly from the URL slug.
- Pass the resolved `conciergeProfile.id` as `conciergeId` in the submit payload instead of relying on context.
- Success redirect always navigates to `/${slug}/success`.

#### 1d. Update `src/pages/Success.tsx`
- Read `slug` from `useParams<{ slug: string }>()`.
- Replace `useUserProfile(conciergeId)` with `useProfileBySlug(slug!)` to fetch concierge data directly from the URL.
- Remove dependency on `useTripPlan()` for concierge identity (keep it only for `clear()` if needed elsewhere).

---

### Part 2: Admin Slug Protection in `EditProfileDialog.tsx`

#### 2a. Lock slug input by default
- Add `slugEditing` boolean state, default `false`.
- Set `readOnly` on the slug Input when `!slugEditing`.
- Style the locked input with reduced opacity.

#### 2b. Edit toggle button
- Add a pencil icon (`Pencil` from lucide) button next to the slug Label.
- Clicking toggles `slugEditing` to `true`, unlocking the input.
- Reset `slugEditing` to `false` when the dialog closes or profile data reloads.

#### 2c. Save warning
- When `slugEditing` is `true` AND slug differs from the original `profile.slug`, show a warning text: "Warning: Changing this slug will break existing routing links."

#### 2d. Live URL preview + copy
- Below the slug input, render the compiled URL: `https://puravidaconcierge.co/${slug}`.
- Add a `Copy` icon button (`Copy` from lucide) that calls `navigator.clipboard.writeText(fullUrl)` and triggers `toast.success("Copied!")`.
- Only show when slug is non-empty.

---

### Files touched

| File | Changes |
|---|---|
| `src/App.tsx` | Remove legacy `/booking` and `/success` routes |
| `src/pages/Booking.tsx` | Use `useProfileBySlug(slug)` for concierge, remove context fallback |
| `src/pages/Success.tsx` | Use `useParams` + `useProfileBySlug` instead of context conciergeId |
| `src/pages/Home.tsx` | Guard booking link to require slug |
| `src/pages/Experiences.tsx` | Remove `/booking` fallback |
| `src/pages/Properties.tsx` | Use context slug for booking links |
| `src/components/Footer.tsx` | Use context slug for booking link |
| `src/components/admin/EditProfileDialog.tsx` | Add slug locking, edit toggle, warning, URL preview + copy |
| `src/locales/en.json` | Add slug warning + copy success strings |
| `src/locales/es.json` | Add slug warning + copy success strings |

