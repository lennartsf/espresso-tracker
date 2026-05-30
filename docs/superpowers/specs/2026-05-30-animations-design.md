# Animations Feature — Design Spec

**Date:** 2026-05-30
**Scope:** Dedicated animation explainer page for the Espresso Tracker, covering boiler types, V60 pouring pattern, milk steaming foam volumes, and latte art heart pattern.

---

## 1. Placement & Navigation

New route `/animate`, new page `Animate.tsx`.

Nav entry added to:
- **Mobile:** "More" panel (alongside Glossary, Equipment, Guide, etc.)
- **Desktop:** Sidebar (all items shown)

Label: `Animate` · Icon: `🎬`

Layout.tsx updates: add `{ to: '/animate', label: 'Animate', icon: '🎬' }` to `navItems`.

---

## 2. Page Structure

Mirrors the Guide overview page: card grid (2 cols mobile, 3 cols desktop), each card taps to a detail player.

```
/animate           → AnimatePage (grid of 4 cards)
/animate/:id       → AnimateDetail (full-width player)
```

IDs: `boiler`, `v60`, `milk`, `latte-heart`

---

## 3. Tech Stack

- **AnimeJS** (`npm install animejs`) — SVG path drawing, timeline control, staggered sequences
- **SVG** — all animations are inline SVG, no canvas
- **Visual style:** Illustrated — soft orange fills, App palette (`orange-500`, `slate-800`, `white`), friendly not schematic. Dark or light background per animation.
- No new CSS framework. Tailwind only.

---

## 4. Animation Specs

### 4a. Boiler Types (`boiler`)

**Title:** Boiler Types  
**Description:** How your machine heats water

4 sub-animations selectable via chip tabs: `Single Boiler` · `Heat Exchanger` · `Dual Boiler` · `Thermoblock`

Each shows an illustrated cross-section of the machine internals. AnimeJS animates:
- Water flow paths (stroke-dashoffset draw-on)
- Color fill of heated zones (opacity/fill transition)
- Arrow indicators for brew water vs steam

**Content per type:**

| Tab | Key visual | Animation |
|-----|-----------|-----------|
| Single Boiler | One tank, switch between brew temp and steam temp | Temperature gauge animates up/down, "wait" indicator |
| Heat Exchanger | Large steam boiler + inner tube for brew water | Two parallel flows, different colors |
| Dual Boiler | Two separate tanks side by side | Both animate simultaneously |
| Thermoblock | Winding metal channel | Water drips in cold, exits hot, fast |

### 4b. V60 Pouring Pattern (`v60`)

**Title:** V60 Pour Pattern  
**Description:** Bloom + 3 pours with timing

Overhead view of V60 dripper. Coffee bed shown as brown circle. Water poured as animated blue circles expanding outward.

Timeline with time markers shown below animation (progress bar):

| Time | Action | Visual |
|------|--------|--------|
| 0:00 | Bloom — 30–45 ml | Small circle, center, slow |
| 0:30 | Wait — CO₂ escapes | Bubbles animate out |
| 1:00 | Pour 1 — 60 ml | Spiral pour, medium circle |
| 1:30 | Pour 2 — 60 ml | Spiral pour |
| 2:00 | Pour 3 — 60 ml | Spiral pour |
| 2:30–3:30 | Drain | Water level drops |

Controls: Play / Pause / Replay button. Timeline scrubbing optional (v2).

### 4c. Milk Steaming (`milk`)

**Title:** Milk Steaming  
**Description:** Foam volume by drink type

Pitcher side-view cross-section. Three horizontal fill zones animate in:
1. Espresso layer (orange)
2. Steamed milk layer (white/cream)
3. Foam layer (light gray/white, dotted texture)

4 drink profiles as chip tabs. Foam ratio animates to correct proportions on tab switch:

| Drink | Espresso | Milk | Foam |
|-------|----------|------|------|
| Cappuccino | 1/3 | 1/3 | 1/3 (thick) |
| Latte Macchiato | ~1/4 | ~1/2 | ~1/4 (medium) |
| Flat White | ~1/4 | ~3/4 | thin microfoam only |
| Cortado | 1/2 | 1/2 | minimal |

Steam wand shown entering milk. Animated: tip position (surface for stretching → deep for texturing), steam bubbles, foam level rising.

### 4d. Latte Art Heart (`latte-heart`)

**Title:** Latte Art Heart  
**Description:** Classic heart pour technique

Overhead view of espresso cup (dark brown circle). Animated white pitcher-pour stream traces the heart pattern in two phases:

**Phase 1 — Base pour:** White stream enters center, spreads as white circle growing in cup center (the "canvas").

**Phase 2 — Heart shape:**
1. Pitcher moves to back of circle, pours steadily
2. White blob forms at back
3. Quick forward motion through center — cuts the blob into a heart shape
4. Final cut line completes the heart

Path coordinates hardcoded as SVG bezier curves, AnimeJS `motionPath` traces pitcher tip along them.

Replay button. Playback speed: real-time (~8s total).

---

## 5. File Structure

```
src/
  pages/
    Animate.tsx          ← Grid overview page
    AnimateDetail.tsx    ← Player page (routes to :id)
  components/
    animations/
      BoilerAnimation.tsx
      V60Animation.tsx
      MilkAnimation.tsx
      LatteHeartAnimation.tsx
  utils/
    animationContent.ts  ← Metadata (titles, descriptions, IDs) — mirrors guideContent.ts pattern
```

`animationContent.ts` exports `ANIMATIONS: Animation[]` with `id`, `title`, `icon`, `description`, `component` reference.

---

## 6. App.tsx + Layout.tsx changes

**App.tsx:** Add routes:
```tsx
<Route path="animate" element={<Animate />} />
<Route path="animate/:id" element={<AnimateDetail />} />
```

**Layout.tsx:** Add to `navItems`:
```ts
{ to: '/animate', label: 'Animate', icon: '🎬' }
```

Position: after Glossary (last in moreNav).

---

## 7. Dependencies

```bash
npm install animejs
npm install @types/animejs  # if needed
```

AnimeJS v3 (stable, well-documented). Import: `import anime from 'animejs'`

---

## 8. Testing

- `Animate.test.tsx`: renders 4 cards, each links to correct `/animate/:id`
- `AnimateDetail.test.tsx`: renders player for each id, shows title + play button, redirects unknown id to `/animate`
- Animation components: no unit tests for SVG internals — visual correctness checked manually

---

## Out of Scope

- Tulip and Rosetta latte art patterns (deferred)
- Timeline scrubbing / seek
- Audio
- PWA / offline caching of animations
