

## Refactor Booking.tsx to Single-Page Checkout

### Changes to `src/pages/Booking.tsx`

**Remove:**
- `step` state, `setStep`, progress dots, step indicators, "stepOf" text
- `canProceedToStep2()` function
- `renderStep1()` / `renderStep2()` split — merge into single continuous form
- Trip Focus card (budget select + `TRIP_FOCUS_OPTIONS`)
- Occasion card (dropdown + `OCCASION_OPTIONS`)
- Service Interests card (category toggles + `handleServiceToggle` + `useCategories` import)
- Accommodation card (status select + location input + `ACCOMMODATION_OPTIONS`)
- Back/Next navigation buttons
- Unused imports: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `ArrowLeft`, `ArrowRight`, `Sparkles`, `MapPin`, `Hotel`, `Heart`, `PartyPopper`, `useCategories`, `getCategoryName`

**Keep & reorder into single scroll:**
1. Header (title, no progress dots)
2. Selected Experiences summary card (from Trip Plan URL params — unchanged)
3. **Dates & Guests card** — merge the two existing cards into one card with dates row + guest counters below
4. **Special Notes or Occasions** — rename "Vibe & Details" textarea, update label/placeholder
5. **Contact Info card** — Name, Email, WhatsApp (unchanged structure)
6. Honeypot field
7. Single "Submit Request" button

**Update `handleSubmit`:**
- Remove zod schema fields: `tripFocus`, `accommodationStatus`, `stayingLocation`, `occasionType`, `serviceInterests`
- Send `null`/empty for removed edge function fields: `budgetRange: null`, `locationDetails: null`, `occasionType: null`, `vibePreferences: null`
- Keep `specialNotes: formData.vision`, `selectedServices: serviceIds`
- Simplify validation: just check dates, adults >= 1, name, email
- Button text: use new i18n key `booking.buttons.submitRequest`

**Update `formData` state:** Remove `tripFocus`, `accommodationStatus`, `stayingLocation`, `occasionType`, `serviceInterests`. Keep `checkIn`, `checkOut`, `adults`, `kids`, `vision`, `customerName`, `customerEmail`, `customerPhone`, `honeypot`.

### Localization updates (`en.json` + `es.json`)
- Add `booking.specialNotesTitle` / `booking.specialNotesPlaceholder`
- Add `booking.buttons.submitRequest`
- Add `booking.datesAndGuests` (combined card title)

### Files changed
1. `src/pages/Booking.tsx` — major refactor
2. `src/locales/en.json` — new keys
3. `src/locales/es.json` — new keys

