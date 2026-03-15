

## Fix Serif Font on Admin Bookings Accordion

The `AccordionTrigger` inherits `font-medium` from its base styles, which applies the heading font family (`Cormorant Garamond`, serif) because of the global CSS rule `h1-h6 { font-heading }` — and Radix wraps the trigger in an `AccordionPrimitive.Header` element.

### Fix in `src/pages/admin/Bookings.tsx`

Add `font-body` (or `font-sans`) to the wrapper `<div>` inside the `AccordionTrigger` at line 101 to override the inherited serif:

```
<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-left flex-1 mr-4 font-body">
```

This single change ensures dates, names, guest counts, and badges all render in the `Outfit` sans-serif body font. No other files need changes.

