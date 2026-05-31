# Animations Update — Design

**Date:** 2026-05-31
**Status:** Approved (pending spec review)

## Problem

Three of the four `/animate` explainers are broken or unhelpful:

- **V60Animation** — only growing circles inside a cone cross-section. No pour pattern, no water level. Doesn't show what to do.
- **MilkAnimation** — static layered-cup view (foam/milk/espresso ratios per drink). No steaming process, no steam wand. Title is "Milk Steaming" but nothing is steamed.
- **LatteHeartAnimation** — uses `anime.path()` stroke-trace (AnimeJS v3). Fragile / broken in practice.

**BoilerAnimation stays as-is** (not part of this work).

## Goal

Each animation must teach **what the user should do**, through the motion itself. Hard quality requirements:

- **Clean & legible** — no overlapping shapes, no z-fighting, generous separation between elements and labels.
- **Clear phase separation** — at any moment it is obvious which phase is active and what action it represents.
- **Self-explanatory** — captions name the action ("Bloom: 45 ml, 30 s warten"), not just a label.

## Technical Approach (all three)

**Library: Framer Motion** (replaces AnimeJS for these three components). Chosen because it is declarative and React-native — no DOM querying, no refs-casting hacks, and it solves the exact things that broke before. AnimeJS stays installed only for the untouched BoilerAnimation.

- **Add dependency** `framer-motion` (works with React 18; the `motion` package is the same lib if preferred). Do **not** remove `animejs` — Boiler still uses it.
- **Declarative `motion.*` SVG elements.** Animate plain attrs/props: `motion.rect animate={{ height, y }}` (water level, foam), `motion.circle animate={{ cx, cy, r }}` (spiral dot, blobs), transforms for whirlpool rotation and pitcher height. No `getElementById`, no `useRef` SVG queries.
- **SVG path-draw via `pathLength`.** The latte heart trace uses `motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}` — robust replacement for the broken `anime.path()`.
- **Phase-driven state = single source of truth.** A `phase` index (or active-tab key) drives the `animate` targets, the captions, and the chip highlight. Sequencing via `useAnimate` (async timeline) or variants with `delayChildren`/`staggerChildren`.
- **Clean restart.** `replay()` resets phase to start; Framer Motion interrupts/retargets in-flight animations automatically (no overlapping manual timelines to cancel).
- **Consistent shell.** Light card (`bg-slate-50 rounded-xl border border-slate-200`), phase chips/tabs, orange `↺ Replay` where applicable — matching BoilerAnimation.

## 1. V60 — Split Top + Side

**Layout:** two SVGs side by side in one card (stack on narrow screens), top labelled, side labelled.

**Side view** — V60 is a downward cone `▼`: **wide opening at top, narrow point (drip hole) at bottom.**
- Coffee bed = dark band sitting in the **lower / narrow** region.
- Water = blue layer **above** the bed. Level **rises** during each pour (tween `height`/`y` up) and **drains down** between pours.
- Pour stream = short line from top entering the cone during active pour only.

**Top view** — circle (dripper seen from above).
- A moving dot (kettle) traces a **spiral inside→outside** during each pour.
- Spiral via `motion.circle` animating through a keyframe array of precomputed `cx`/`cy` points (optionally a faint `motion.path` spiral guide drawn with `pathLength`).

**Playback:** synced timeline — Bloom → Pour 1 → Pour 2 → Pour 3 → Drain. Per phase: time marker (`0:00`, `1:00`, …), ml counter, and a caption. Phase chips highlight as the timeline advances. `↺ Replay`.

**Phases (data):**
| Phase | Time | Water added | Caption |
|-------|------|-------------|---------|
| Bloom | 0:00 | 45 ml | Gleichmäßig sättigen, 30 s blühen lassen |
| Pour 1 | 0:30 | +60 ml | Spirale innen→außen |
| Pour 2 | 1:15 | +60 ml | Mitte halten, Rand meiden |
| Pour 3 | 1:45 | +60 ml | Letzter Guss, Bett ebnen |
| Drain | 2:30 | — | Durchlaufen lassen (~3:00 total) |

(Numbers are sensible defaults; final copy can be tuned during implementation.)

## 2. Milk — Side View + Phase Tabs

**Layout:** pitcher cross-section + steam wand, one card.

- **Phase tabs:** **Ziehen (Stretching)** / **Rollen (Rolling)** — user switches to compare. (Tabs, not a timeline — the teaching point is the difference between the two positions.)
- **Ziehen:** wand tip **just below the surface**; foam layer grows (tween foam `height` up); small "tsch tsch" air ticks. Caption: Luft einarbeiten, Tip knapp unter Oberfläche.
- **Rollen:** wand tip **deeper**; whirlpool arrow (rotating); foam stops growing, gets polished into microfoam. Caption: Kein neuer Schaum, Mikroschaum verwirbeln.
- **Depth marker:** arrow/indicator showing tip position for the active phase.
- **Right/Wrong block:** ✗ zu tief (kein Schaum) / ✓ richtig / ✗ zu flach (grobe Blasen).
- **Temperature as small text** (no gauge): "Ziel ~60–65 °C — Kanne zu heiß zum Anfassen = fertig."

Separation: wand, milk, foam layer, whirlpool, and depth marker each clearly distinct; labels outside the pitcher, not overlapping milk.

## 3. Latte Art Heart — Split Side (Scene) + Top

**Layout:** side scene + top view in one card.

**Side view (scene look):** cup seen from the side with handle + visible crema surface; a tilted milk pitcher (jug with spout) above it; milk stream connecting. **Pitcher height** changes per phase — this is the lesson.

**Top view:** cup surface from above. White spot appears → grows to a circle → a line pulls through center → heart point. White blob via `motion.circle` (size/position); the pull-through outline drawn with `motion.path` + `pathLength` for a clean trace.

**Playback:** synced 3-phase timeline + `↺ Replay`:
| Phase | Pitcher | Caption |
|-------|---------|---------|
| 1. Einmischen | hoch, dünner Strahl | Aus der Höhe gießen, Crema einmischen |
| 2. Schaum aufschwimmen | tief & nah | Kännchen senken, weißer Kreis wächst |
| 3. Durchziehen | anheben + vorziehen | Anheben und durch die Mitte ziehen → Spitze |

## Out of Scope

- Boiler animation (unchanged).
- Tulip / Rosetta latte art (deferred, as before).
- Tasting/rating integration, new routes, copy i18n framework (animations stay English to match the app).

## Files Touched

- `src/components/animations/V60Animation.tsx` — rewrite
- `src/components/animations/MilkAnimation.tsx` — rewrite
- `src/components/animations/LatteHeartAnimation.tsx` — rewrite
- `src/utils/animationContent.ts` — update descriptions/tags if wording changes (e.g. milk tabs Ziehen/Rollen)
- `package.json` — add `framer-motion` (keep `animejs` for Boiler)
- No DB / Supabase changes.

## Testing

- Unit/render tests per component: renders without crashing, phase state advances, replay resets cleanly, tabs switch (milk). Follow existing test patterns in the repo.
- Manual: load each `/animate/:id`, verify no overlapping shapes, phases readable, replay works, no console errors.
