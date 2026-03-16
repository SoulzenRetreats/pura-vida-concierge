

## Enhance Sparkle Burst — Confetti-Like Overflow

Currently particles travel ±20px (`(Math.random() - 0.5) * 40`) and shrink to `scale(0.5)`. They stay within the bell button area. We need to push them further so they visibly escape the card boundary, add more particles, vary sizes, and extend the animation slightly.

### Changes

**`src/pages/Experiences.tsx`** (SparklingBell component):
- Increase `PARTICLES` from 6 → 10
- Increase spread from `±20px` to `±60px` so particles visibly overflow beyond the card edge
- Add slight size variation: randomly assign each particle `w-1` or `w-1.5` and `h-1`/`h-1.5`
- Add a slight delay stagger per particle (0–150ms) for a more organic confetti feel

**`tailwind.config.ts`**:
- Extend `sparkle-burst` duration from `0.5s` to `0.7s` for a longer, more visible trail
- Change end scale from `0.5` to `0.3` so particles shrink more dramatically
- Add a mid-frame at 40% where particles are still fully opaque, so they stay visible longer before fading

No other files affected.

