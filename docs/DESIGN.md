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
1. ✅ **NewShot Mobile-Stepped-Flow** — ERLEDIGT (Branch `newshot-stepped-flow`):
   5 Schritte (Coffee · Dial-in · Timer · Taste · Notes), Progress-Leiste, Back/Next,
   Per-Step-Validierung; Desktop behält Ein-Seiten-Form (`useIsMobile`). Bug gefixt:
   Next→Save teilten DOM-Node → React morphte type→submit mitten im Klick (Vorab-Submit).
   Distinkte `key` lösen es (0 Stray-Inserts verifiziert).
2. ✅ **Offline-Write-Queue** — ERLEDIGT (`lib/writeQueue.ts`, `useWriteQueue`,
   enqueue in useCreateShot/useCreateBrew, Banner-Copy ehrlich „save locally", 3 Tests).
3. ✅ Landing-Hero: Parallax + Wort-Stagger schon vorhanden (`Hero.tsx`), Spec ok.
4. ✅ Dekorativer Arc hinter Section-Headern — ERLEDIGT (Layout-Content-Top + PageHeader).

## Mobile/UX-Backlog (User 2026-06-15)
5. ✅ **Eingabefeld-Kontrast (a11y)** — ERLEDIGT (Branch `mobile-ux-batch1`):
   `fieldClasses` (`src/components/ui/Input.tsx`) bg `coffee-bg`→`coffee-surface2`,
   Border `coffee-line`→`white/15`, Placeholder `muted/60`→`muted`. Hand-gerollte
   Felder migriert: Analysis-Selects → `Select`-Primitive; Equipment (23 Felder)
   bg/text/border injiziert; AuthForm angeglichen. 167✓.
6. **Bessere Visualisierung auf dem Handy** — TEILWEISE: 390px-Audit gemacht,
   App durchweg solide; nur Coffees-Roast-Badge kompakt gemacht (war 2-zeilig).
   Kein weiterer akuter Mangel gefunden. Brews-Filter-Tabs scrollen (overflow-x,
   ok-Pattern). Bleibt offen für gezielte Wünsche.
7. ✅ **RoasterMap ~2× größer** — ERLEDIGT: `Roasters.tsx` height 200px→420px.
8. ✅ **Analyse: Kaffeeauswahl wie in NewShot** — ERLEDIGT: alle Coffee-Selects in
   `Analysis.tsx` zeigen `Name / Rösterei` (Muster aus NewShot), via `Select`.
9. ✅ **Rezepte je Kaffee (Röster-Vorgabe)** — CODE ERLEDIGT (Felder an `coffees`,
   `RoasterRecipeFields`, Detail-Anzeige, NewShot „Use roaster recipe"-Prefill).
   **OFFEN: Migration `docs/migrations/2026-06-15-coffee-roaster-recipe.sql` muss
   User in Supabase ausführen, sonst schlägt Coffee-Speichern fehl.**
