

## Gold Sparkle Burst Animation for Bell Tap

### Approach
Create a self-contained `SparklingBell` component that wraps the bell icon button. On tap (when adding to plan), it spawns 6 tiny gold particle `<span>` elements that burst radially outward and fade, while the bell does a quick scale pulse (1 → 1.2 → 1).

### Files Changed

**1. `tailwind.config.ts`** — Add two keyframes:
- `bell-pulse`: scale 1 → 1.25 → 1 over 400ms
- `sparkle-burst`: translate outward + fade opacity 1 → 0 over 500ms (uses CSS custom properties `--tx` and `--ty` for direction)

**2. `src/pages/Experiences.tsx`**:
- Extract the bell button into a `SparklingBell` component with local state `sparkling: boolean`
- On toggle (only when adding, not removing): set `sparkling = true`, spawn 6 absolutely-positioned gold dot `<span>`s with randomized `--tx`/`--ty` custom properties (e.g. ±20px range), apply the `sparkle-burst` animation
- After 500ms timeout, set `sparkling = false` to unmount particles
- Apply `animate-bell-pulse` class to the `BellRing` icon during the burst
- Each particle: `w-1.5 h-1.5 rounded-full bg-amber-400` with absolute positioning centered on the bell

### No other files affected. No localization changes needed.

