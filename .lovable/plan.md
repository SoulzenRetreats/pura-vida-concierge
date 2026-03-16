

## UI Polish: Icon Swap + Scroll Reset

### 1. Replace BellRing → ConciergeBell

**`src/pages/Experiences.tsx`** (line 9):
- Change import from `BellRing` to `ConciergeBell`
- Replace all 3 usages (lines 162, 242, 435) of `<BellRing` with `<ConciergeBell`

**`src/pages/Booking.tsx`** (line 11):
- Change import from `BellRing` to `ConciergeBell`
- Replace usage on line 146

All existing className props (gold glow, fill-amber-400, animate-bell-pulse) remain unchanged — they apply to the SVG element regardless of which icon component renders it.

### 2. Scroll-to-top on page load

**`src/pages/Booking.tsx`**: Add `useEffect(() => { window.scrollTo(0, 0); }, []);` (useEffect is already imported).

**`src/pages/Success.tsx`**: Add `import { useEffect } from "react"` and the same `useEffect` scroll-to-top hook.

