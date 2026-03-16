

## International Phone Input for Booking Form

### Approach
Install `react-international-phone` — a lightweight library with a country code selector, flag display, and built-in validation. No need to build a custom Select + Input combo.

### Changes

#### 1. Install dependency
- `react-international-phone` (provides `PhoneInput` component and `usePhoneValidation` hook)

#### 2. Create `src/components/ui/phone-input.tsx`
- Wrap `react-international-phone`'s `PhoneInput` in a styled component that matches the existing Input styling (h-12, rounded-md, border, etc.)
- Default country: `"us"`, with preferred countries `["us", "cr", "mx", "ca"]` (Costa Rica focus)
- Export a simple `<InternationalPhoneInput value onChange />` component

#### 3. Update `src/pages/Booking.tsx`
- Replace the plain `<Input type="tel">` (line 269) with the new `<InternationalPhoneInput>`
- The value stored in `formData.customerPhone` will now always be in E.164 format (e.g. `+50688881234`)
- Add validation before submit: if phone is provided, it must start with `+` and have at least 8 digits — show a toast error otherwise
- Add `customerPhone` to the submit button's disabled condition when it's non-empty but invalid

#### 4. Locale strings (`en.json` + `es.json`)
- Add `booking.validation.phoneRequired`: "Please enter a valid phone number with country code" / "Por favor ingresa un número de teléfono válido con código de país"

### Files touched
| File | Change |
|---|---|
| `package.json` | Add `react-international-phone` |
| `src/components/ui/phone-input.tsx` | New styled wrapper component |
| `src/pages/Booking.tsx` | Swap Input for InternationalPhoneInput, add validation |
| `src/locales/en.json` | Add phone validation message |
| `src/locales/es.json` | Add phone validation message |

