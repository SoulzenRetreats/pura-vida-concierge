

## Trip Plan Wishlist with Concierge Bell Icon

### Overview
Implement a mobile-first "Trip Plan" wishlist on the Experiences page using a **Bell** icon (`BellRing` from lucide-react) instead of a heart. Users tap the bell to "ring" a service into their plan, review selections in a bottom drawer, and finalize to the Booking form.

### New Files

**`src/contexts/TripPlanContext.tsx`**
- React context with `Set<string>` of service IDs, persisted to `localStorage` key `tripPlan`
- Methods: `toggle(id)`, `remove(id)`, `clear()`, `isInPlan(id)`, `planItems` (array), `planCount`

### Modified Files

**`src/App.tsx`**
- Wrap routes with `<TripPlanProvider>`

**`src/pages/Experiences.tsx`** — Major changes:

1. **Bell icon on cards** — Top-right of image area (where category badge currently sits). Category badge moves to top-left alongside sale/rental badges. Bell button: 44x44px touch target, `bg-black/20 backdrop-blur-sm rounded-full`. 
   - Inactive: `BellRing` outline icon, white stroke
   - Active (rung): `BellRing` with `fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]` — a gold glow effect
   - `aria-label="Add to Trip Plan"` / `"Remove from Trip Plan"`

2. **"More Details" button** in `CardContent` — Opens a responsive detail view:
   - Mobile (`useIsMobile`): `Drawer` (Vaul) sliding up from bottom
   - Desktop: `Dialog` (Radix)
   - Content: scrollable photo gallery, full localized description, price, and an "Add to Plan" / "Remove from Plan" toggle button with bell icon

3. **Sticky bottom bar** — `fixed bottom-6 left-1/2 -translate-x-1/2 z-40`, `bg-primary text-primary-foreground rounded-full px-6 py-3 shadow-luxury font-body`. Shows `"[X] Services in Plan"` + `ChevronUp`. Only visible when `planCount >= 1`. Animated slide-up entry via CSS transition.

4. **Review Drawer** — Tapping sticky bar opens a Vaul `Drawer`:
   - Itemized list: thumbnail (h-16 w-16 rounded), localized name, price range, `X` remove button
   - All data text uses `font-body`
   - "Finalize Plan" primary button → navigates to `/booking?services=id1,id2,...`

**`src/pages/Booking.tsx`**
- Read `services` search param, fetch service names by IDs
- Display a summary card at top: "Your selected experiences: Chef, Catamaran, Spa"
- Pass service IDs into the `selectedServices` array in the submit payload

**`src/locales/en.json`** — Add `tripPlan` section:
- `addToPlan`: "Add to Trip Plan"
- `removeFromPlan`: "Remove from Trip Plan"  
- `servicesInPlan`: "{{count}} Services in Plan"
- `moreDetails`: "More Details"
- `reviewPlan`: "Your Trip Plan"
- `finalizePlan`: "Finalize Plan"
- `selectedExperiences`: "Your Selected Experiences"

**`src/locales/es.json`** — Spanish equivalents:
- `addToPlan`: "Agregar al Plan"
- `removeFromPlan`: "Quitar del Plan"
- `servicesInPlan`: "{{count}} Servicios en el Plan"
- `moreDetails`: "Más Detalles"
- `reviewPlan`: "Tu Plan de Viaje"
- `finalizePlan`: "Finalizar Plan"
- `selectedExperiences`: "Experiencias Seleccionadas"

### Key Design Decisions
- **Bell icon**: `BellRing` from lucide-react (has the concierge bell shape with ringing lines). Active state uses `fill-amber-400` with a gold `drop-shadow` glow — fits the luxury brand.
- No database changes needed — all client-side with localStorage.
- Booking integration is lightweight: service IDs passed via URL, displayed as a summary, included in the existing submit payload.

### Files Changed
1. **New**: `src/contexts/TripPlanContext.tsx`
2. `src/App.tsx`
3. `src/pages/Experiences.tsx`
4. `src/pages/Booking.tsx`
5. `src/locales/en.json`
6. `src/locales/es.json`

