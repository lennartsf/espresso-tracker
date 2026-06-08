# App-Reskin Welle 1 — Dark Premium Fundament

## Context
Phase 1 des Website-Pivots ist der **App-Reskin**: die Tracker-App (`/app/*`) raus aus dem
generischen Pastel/Light-Look hin zu **Dark Premium**, konsistent mit der Marketing-Website.
Der Reskin ist zu groß für einen Wurf (~15 Seiten) → in Wellen. **Diese Spec = Welle 1**:
themed UI-Primitives + App-Shell + Dashboard + Shot/Brew-Cards. Sie etabliert das System,
das Welle 2 (Formulare) und Welle 3 (Content-Seiten) wiederverwenden.

Design-Tokens existieren bereits aus Phase 0 (`--coffee-*` in `src/index.css`, `coffee.*` +
`font-display`/`font-grotesk` in `tailwind.config.ts`). GSAP + `CountUp` vorhanden.

Entscheidungen aus dem Brainstorming (visuell bestätigt):
- **Flächen-Behandlung: Elevated Surfaces** (Variante B) — hellere Panels (`#38302a`-Bereich),
  klare Kanten, leichter Schatten + Top-Highlight → lesbar für dichte Daten/Formulare.
  (Pure-Dark bleibt dem Marketing vorbehalten.)
- **Farbe: Funktionsfarben behalten, Deko raus** — Rating-Skala (rot→grün) + Drink/Methoden-Badges
  bleiben (für Dark getunt); Pastel-Deko-Statkarten → Gold/Neutral.
- **Rating-Badges hervorgehoben** — gefüllt, größer, leichtes Glow.
- **Keine Emojis** app-weit; Nav-Icons via **Lucide** (`lucide-react`).

## Scope Welle 1
**Drin:** `src/components/ui/` Primitives · `Layout` (App-Shell) · `Dashboard` ·
`ShotCard` · `BrewCard` · `ratingColor`-Util (Dark-Mapping) · Lucide-Dep · Marketing-Logo Emoji raus.
**Nicht drin (spätere Wellen):** NewShot/NewBrew/ShotDetail/BrewDetail (Formulare, Welle 2);
Guide/GuideDetail/Glossary/Analysis/Animate/AnimateDetail/Roasters/CoffeeManager/Equipment (Welle 3).

## UI-Primitives (`src/components/ui/`)
Jede Komponente klein, eine Aufgabe, kapselt die Dark-Tokens (Seiten referenzieren nie rohe coffee-Klassen für diese Muster):
- **`Card`** — `bg-coffee-surface2 border border-coffee-line rounded-xl` + Schatten/Top-Highlight; `props: className?, children`. Optionale `as`/Link-Variante nicht nötig (Cards die Links sind nutzen `Card` innerhalb `<Link>`).
- **`Button`** — `variant: 'primary' | 'secondary'`, `size?`; primary = Gold (`bg-coffee-accent text-coffee-bg`), secondary = Outline (`border-coffee-line text-coffee-cream`). Unterstützt `as`-Link über optionales Rendering oder separater Einsatz mit `<Link>`. Ersetzt alle `bg-orange-500`/Gradient-CTAs.
- **`Badge`** — neutrale Gold-Pill (`bg-coffee-accent/14 text-coffee-accent-soft border`), für Drink-/Methoden-Labels.
- **`RatingBadge`** — `props: value: number`; gefülltes, farbiges Badge via `ratingBadgeClasses(value)` (s.u.), größer (≈38px), `font-display`, leichtes Glow.
- **`StatCard`** — `props: value: number, label, decimals?`; `Card` + Gold-`CountUp`-Zahl (`font-display`) + Label.
- **`PageHeader`** — `props: title, action?`; Fraunces-Titel + optionaler Action-Slot rechts (ersetzt das wiederkehrende `flex justify-between` + `h1` + Button auf jeder Seite).

## ratingColor (Dark-Mapping)
`src/utils/ratingColor.ts` erweitern um `ratingBadgeClasses(rating: number): string` — gibt gefüllte
Dark-Klassen je Band zurück (z.B. 8–10 grün, 6–7 lime, 4–5 amber/gold, 1–3 rot), jeweils
`bg-…/voll + text-hell + ring/glow`. Bestehende Funktion(en) bleiben (von noch-nicht-reskinnten
Seiten genutzt) — nicht entfernen, nur ergänzen.

## App-Shell (`src/components/Layout.tsx`)
- Root dunkel: `bg-coffee-bg text-coffee-text font-grotesk`.
- Sidebar (`bg-coffee-surface` + `border-coffee-line`), Brand „Espresso" (Fraunces, **kein ☕**),
  Nav-Items mit **Lucide-Icons** statt Emoji, Active = Gold (`bg-coffee-accent/14 text-coffee-accent-soft`).
- Mobile Bottom-Nav + „More"-Panel ebenfalls dunkel, Lucide-Icons, Gold-Active.
- Nav-Daten: `navItems` bekommt statt `icon: '🏠'` eine Lucide-Komponente (z.B. `icon: Home`).
  Mapping je Eintrag: Home→Home, Shots→ListChecks, Brews→…, Analysis→BarChart3, Coffees→Coffee,
  Roasters→MapPin, Equipment→Settings, Guide→BookOpen, Glossary→Library, Animate→Clapperboard
  (konkrete Lucide-Namen bei Umsetzung wählen).

## Dashboard (`src/pages/Dashboard.tsx`)
- `PageHeader title="Espresso"` (kein ☕) + `Button` „New Shot" als Action.
- Stat-Grid → `StatCard` (Gold-Zahlen, `CountUp` bleibt; GSAP-Stagger bleibt erhalten).
- „Recent Shots"/„Recent Brews" Abschnitte: Labels (`PageHeader` nicht nötig, kleines `.lbl`),
  Karten über `ShotCard`/`BrewCard`.

## ShotCard / BrewCard
- Auf `Card` umstellen, dunkel; Rating als `RatingBadge`; Drink-/Methoden-Label als `Badge`.
- Subtitle-Logik (Grind/Time/Device …) bleibt unverändert, nur Farb-/Border-Klassen dark.

## Marketing
- `MarketingLayout` + `Hero`/`AuthForm` Logo „☕ SILVIA" → „SILVIA" (Wortmarke, Emoji raus).

## Interim-Strategie (kein kaputtes Live)
Alle Reskin-Wellen bleiben auf Branch `animations-update`. **Deploy/Merge erst, wenn die ganze
App konsistent dark ist.** Zwischen den Wellen sehen noch-nicht-reskinnte Seiten (Welle 2/3)
lokal dark-auf-dunkel/kontrastarm aus — das ist akzeptiert, betrifft nur die Dev-Ansicht, nicht
die Live-Seite (unverändert hell bis zum finalen Merge).

## Dependencies
`npm i lucide-react` (tree-shaked, nur genutzte Icons gebündelt).

## Testing
- Neue Primitives: leichte Render-/Varianten-Tests (`Button` variant-Klassen, `RatingBadge` Farbe
  je Band, `StatCard` zeigt Wert, `PageHeader` Titel + Action).
- Bestehende **130 Tests grün halten**. Dashboard hat keinen eigenen Test; Card-Tests
  (`ShotCard`/`BrewCard` falls vorhanden) + alle Tests die auf Emoji-Text oder alte Farbklassen
  asserten anpassen. Vor Umbau prüfen: `grep` nach Emoji/`bg-orange`/`text-slate` in `__tests__`.
- `matchMedia`-Polyfill (Setup) deckt GSAP in Tests bereits ab.

## Verification
1. `npx tsc -b` fehlerfrei.
2. `npx vitest run` — alle grün (≥130).
3. `npm run dev` → `/app`: Dashboard dark, elevated Karten, Gold-StatCards (CountUp + Stagger),
   gefüllte Rating-Badges, Lucide-Nav, **keine Emojis**. `/app/shots` + `/app/brews`: Cards dark
   mit RatingBadge. Marketing `/` unverändert (Pure Dark), Logo ohne ☕.
4. Selbst-Review per Playwright-Screenshots (Dashboard + Shots + Brews) vor Vorlage.
5. `npm run build` erfolgreich.
6. Nicht deployen (Branch only) bis alle Reskin-Wellen fertig.

## Out of Scope
Formulare (Welle 2), Content-Seiten + deren Emoji-/Icon-Daten (Welle 3), Demo-Sandbox (Sub-Projekt C),
Marketing-Content-Ausbau (Sub-Projekt B), Supabase Auth/RLS (Phase 2).
