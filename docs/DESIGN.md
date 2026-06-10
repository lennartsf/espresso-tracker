# Espresso Tracker — Design System (verbindlich)

Maßgeblicher Design-Prompt für alle UI-Arbeit. Stand 2026-06-10.
Ton: dark, tactile, measured — Fellow / Onyx / Decent-Espresso-Referenz.
**Dark only, kein Light Mode, kein Toggle.**

## Zonen
- `/` Marketing (deutsch), `/app/*` Tracker (englisch) — EIN Produktgefühl.
- Geteilte Primitives (`src/components/ui/`): Button, Card, Badge, RatingBadge,
  StatCard, PageHeader, EmptyState … Keine zonen-spezifischen Varianten bauen.

## Tokens (`src/index.css`)
- `--coffee-bg #1c1714`, `--coffee-surface #25201b`, `--coffee-surface-2 #33291f`
- Akzent `--coffee-accent #c9a35e` / `--coffee-accent-soft #d8bd86` —
  **bedeutet Marke/Interaktion/Fokus, NIE Rating.**
- Text `--coffee-cream #f6efe4`, `--coffee-text #f1e9df`, `--coffee-muted #a89784`
- `--coffee-line rgba(246,239,228,0.10)`
- Keine Hex-Werte außerhalb der Tokens. Rating-Skala lebt in
  `src/utils/ratingColor.ts` (`ratingHex`): 10 Stufen rot→amber→grün,
  **bewusst ohne Brand-Gold** (Stufe 6 = `#bcae49`, nicht `#c9a35e`).
- Kontrast: alle Text/BG-Paare WCAG AA. `--coffee-muted` auf `--coffee-surface-2`
  ist grenzwertig → dort `--coffee-text` nehmen.

## Typo
- Fraunces (`font-display`): Hero/Section/Screen-Headlines, Rating-Zahlen.
- Space Grotesk (`font-grotesk`): UI, Parameter, Labels.
- Parameterwerte (grind/dose/yield/time/temp): immer `tabular-nums`,
  in Grids rechtsbündig.

## Signatur: Pull-Arc
Einziges Leitmotiv — dünner Bogen (Extraktion). Umgesetzt: BrewTimer-Ring,
DialGauge. Kein zweites Motiv (keine Diagonal-Divider, keine clip-path-Shapes).

## Motion (GSAP + @gsap/react)
- Eine orchestrierte Sequenz pro Screen, nichts verstreut.
- Page-Transitions nur GSAP (fade + y:16→0, 0.35 s); KEINE View Transitions API.
- Reduced Motion zweistufig: dekorativ (Reveals, Stagger, Parallax, Bounce)
  → per `matchMedia('(prefers-reduced-motion: reduce)')`-Guard aus (jede
  Timeline!); funktional (Timer-Arc, Ratio-Bar) → bleibt, aber gestuft statt
  getweent. **NIE** globales `* { animation-duration: 0.01ms !important }`.
- Timer: diskrete Updates ~1/s, CSS-Transition glättet (Batterie).
  Kein Zeichen-Flip/SplitText auf dem Timer.

## States — jede View braucht alle vier
- **Empty:** `<EmptyState>` (Fraunces-Headline, eine Zeile, EINE CTA).
  Copy: Shots „Your first pull awaits.“ · Brews „Time to bloom.“ ·
  Coffees „Add a bag to start dialling in.“ Ton trocken, nie entschuldigend.
- **Loading:** Skeletons im Ziel-Layout; Spinner nur in Buttons.
- **Error:** Inline-Karte, Klartext, eine Retry-Aktion.
- **Offline:** Banner in `Layout` (ehrlich: noch keine Write-Queue).

## Mobile
- Bottom-Nav: `env(safe-area-inset-bottom)`; Full-Screen-Flows zusätzlich
  `safe-area-inset-top`. Tap-Targets ≥ 56 px in Formularen.
- Speed is craft: „↻ Repeat last“ in NewShot prefillt den letzten Shot
  (ohne Ratings/Notes). Routine-Shot < 20 s loggen.

## Charts (Recharts)
- Grid: `--coffee-line`-Wert, gestrichelt, nur horizontal bevorzugt.
- Achsen: Space Grotesk 11px, muted, tabular-nums, keine Achsenlinien.
- Punkte: `ratingHex()` wenn Rating kodiert; sonst Akzent für Einzelserie.
- Tooltip wie Card (`--coffee-surface-2`, `--coffee-line`, radius 12).
- Keine Schatten auf Chart-Elementen; Flächen-Gradients < 8 % Opacity.

## Dependencies
- GSAP (Animation), Recharts (Charts), lucide-react (Icons), Tailwind,
  react-leaflet (Karte). framer-motion verboten.
- JS-Budget App-Shell: 250 kB min+gz. Neue Pakete nur mit: Zweck, Vorteil
  vs. Bestand, Bundle-Größe.
- Kandidat bei Bedarf: `@use-gesture/react` (~10 kB gz) für Step-Swipes.

## Output-Regeln
- Komplette Komponenten, keine TODOs; realistische Barista-Daten
  (18 g in, 36 g out, 28 s, 93 °C, Rating 8, „bright, stone fruit“).
- TypeScript strikt, kein `any`. Mobile-first (390 px denken).
- A11y: Fokusringe in Akzent, aria-labels auf Icon-Buttons, semantisches HTML.
- Tests bleiben grün — restylen, keine Component-Contracts/Test-IDs ändern.
- Chanel-Regel: vor Abschluss eine Dekoration entfernen, die dem
  Craft-Anspruch nicht dient.

## Backlog (groß, bewusst offen)
1. **NewShot als Mobile-Stepped-Flow** (5 Schritte: Drink → Grind/Dose/Yield →
   Timer → Ratings → Notes; Fortschritt = dünne Akzent-Linie oben,
   full-screen, safe-area-top). Größter Umbau, eigener Branch.
2. **Offline-Write-Queue** (Shots lokal puffern, Sync bei Reconnect) —
   erst dann Banner-Copy auf „shots save locally“ ändern.
3. Landing-Hero: Parallax + Wort-Stagger nach Spec prüfen/ergänzen.
4. Dekorativer Arc hinter Section-Headern (Marketing + App).
