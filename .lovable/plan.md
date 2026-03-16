

## Plan: Redirect Root `/` to Active Concierge Slug

### Problem
Visitors landing on `/` see a generic Home page with no concierge bound, which can produce orphan leads since booking CTAs require a slug.

### Approach
**Reuse the existing `SlugRedirect` pattern** — it already resolves a slug from context or the database. Instead of creating new logic, we generalize `SlugRedirect` to accept a target path suffix and reuse it for `/`.

### Changes

**1. Generalize `SlugRedirect.tsx`**
Add an optional `targetPath` prop (default: `/experiences`). The component redirects to `/${slug}${targetPath}`. This keeps one redirect component for both `/` → `/:slug` and `/experiences` → `/:slug/experiences`.

**2. Update `src/App.tsx`**
Replace `<Route path="/" element={<Home />} />` with:
```tsx
<Route path="/" element={<SlugRedirect targetPath="" />} />
```
This redirects `/` → `/:slug`, which hits the existing `/:slug` route rendering `<Home />`.

The `/experiences` legacy route stays as-is: `<SlugRedirect targetPath="/experiences" />` (current default behavior, no change needed).

**3. No other files change.** Home, Navigation, Footer, etc. remain untouched. The `/:slug` route already renders `<Home />` and binds the concierge context.

### Why this approach
- **Minimal code**: ~3 lines changed in SlugRedirect, ~1 line in App.tsx.
- **No tech debt**: Reuses existing redirect logic rather than adding a new component.
- **Scales**: When you add more concierges, the "first profile with a slug" query still works as a default, and you can later add a concierge selector page if needed.

