

## Plan: Rich WhatsApp Message with Booking Details

### Changes

**1. `src/pages/Booking.tsx`** (line 129)
Pass additional booking metadata in navigate state:
```tsx
navigate(`/${slug}/success`, {
  state: {
    serviceNames,
    customerName: formData.customerName.trim(),
    checkIn: formData.checkIn,
    checkOut: formData.checkOut,
    guestCount: formData.adults + formData.kids,
  }
});
```

**2. `src/pages/Success.tsx`**
- Destructure new fields from `location.state` with safe fallbacks (empty strings / 0) so the page never crashes on direct navigation.
- Format `checkIn` / `checkOut` into `"MMM D, YYYY"` using `new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })`, with a guard returning `""` if the input is falsy.
- Replace the i18n-based `whatsappMessage` with the rich template literal using WhatsApp native markdown:

```
Hi {name}! I just submitted a request on the site for my upcoming trip.

Here are my details:

*Name:* {customerName}

*Dates:* {formattedCheckIn} to {formattedCheckOut}

*Travelers:* {guestCount}

I'm interested in booking the following:

- Service 1
- Service 2

Let me know what the next steps are to get this finalized!
```

Only two files touched. No other changes needed.

