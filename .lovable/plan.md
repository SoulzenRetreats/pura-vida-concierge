

## Align Home Page & Routing with "Experiences First" Vision

### Files Changed
1. `src/pages/Home.tsx` — Revamp hero, replace features with "Our Expertise", update CTA
2. `src/App.tsx` — Remove TripTypes import and route
3. `src/components/Navigation.tsx` — Remove Trip Types link, change "Plan My Trip" button to link to `/experiences`
4. `src/components/Footer.tsx` — Remove Trip Types link from quick links
5. `src/locales/en.json` — Update hero text, add expertise section keys, update CTA, update nav
6. `src/locales/es.json` — Same translation updates in Spanish
7. **Delete** `src/pages/TripTypes.tsx`

### Changes Detail

**Home Hero** — Update i18n keys:
- `home.hero.title` → "Curate Your Pura Vida"
- `home.hero.subtitle` → "Browse our exclusive collection of private chefs, luxury transfers, and hidden adventures. Build your plan and we'll handle the rest."
- Primary button: new key `home.hero.exploreExperiences` → "Explore Experiences", links to `/experiences`
- Keep secondary "View Properties" button as-is

**Features → "Our Expertise" section** — Replace the 4 current feature cards with:
1. Local Adventures (Compass icon)
2. Standard Excellence (Award icon)
3. Premiere Service (Crown icon)
4. Ultra-Luxe Support (Gem icon)

New i18n keys under `home.expertise` with brief descriptions.

**CTA Section** — Add a text badge above the button: "Not sure where to start? Tell us your dates and we'll build a custom plan for you." Button text: "Request Custom Itinerary", links to `/booking`.

**Navigation** — Remove Trip Types link (desktop + mobile). Change the CTA button from linking to `/booking` to `/experiences`. Update `nav.planMyTrip` to "Explore Experiences" (or add a new key `nav.exploreExperiences`).

**Footer** — Remove the Trip Types quick link.

**Routing** — Remove `TripTypes` import and `/trip-types` route from `App.tsx`. Delete `src/pages/TripTypes.tsx`.

**Spanish translations** — Mirror all new/updated keys in `es.json`.

