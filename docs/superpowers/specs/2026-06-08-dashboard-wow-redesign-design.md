# Dashboard Wow-Redesign — Design Spec

**Date:** 2026-06-08
**Status:** Approved (design), pending implementation plan
**Branch:** `dashboard-wow`

## Problem

Die App ist Dark Premium, aber die App-Screens wirken „Standard" (flache Stat-Karten, Zahlen) — kein Wow-Effekt beim Öffnen. Ziel: Optik, die beim Öffnen beeindruckt. Priorität: **(A) den Nutzer selbst begeistern** (Daily Delight) > (B) anderen herzeigbar > (C) echte Nutzer. Wenn das Tool selbst begeistert → live schalten + ausgewählten Leuten für Feedback geben.

## Scope

**Nur das Dashboard** (`src/pages/Dashboard.tsx`) + neue wiederverwendbare Komponenten. Andere Screens bleiben unberührt. Die Bausteine werden so gebaut, dass spätere Specs sie auf NewShot/ShotDetail/Analysis ziehen können (Scope B/C, separat).

**Out of scope:** Marketing-Seite (schon Dark Premium), Auth, andere App-Screens, Daten-/Schema-Änderungen.

## Design-Richtung

Per Visual-Companion-Brainstorm gewählt: **Mix B×C** — „Bento-Cockpit mit Maschinen-Haptik".
- **Bento (B):** Kachel-Grid variabler Größe, datengetrieben.
- **Tactile (C):** Tiefe, Verläufe, Inset-Schatten, glühendes Gold, „geprägte" Surfaces, Dial wie an der Silvia.

Mockup-Referenz: `.superpowers/brainstorm/13341-1780914537/content/mix-bc-v2.html`.

## Komponenten (neu, wiederverwendbar)

Ablage: `src/components/dashboard/` (Dashboard-spezifisch) bzw. `src/components/ui/` (generisch wie `EmbossedTile`, Button-`glow`-Variante).

### `EmbossedTile`
Surface-Wrapper für alle Kacheln: Gradient-Hintergrund + Inset-Schatten + Border (geprägter Look). Props: `children`, optional `className`, `span` (Grid-Spalten/Reihen). Basis aller Bento-Kacheln.

### `DialGauge`
Kreis-Fortschrittsring in geprägter Mulde, glühende Wert-Zahl in der Mitte.
- Props: `value: number`, `max: number`, `color?: string` (Default: Funktionsfarbe nach Wert), `label?: string`.
- Render: SVG-Ring (Hintergrund-Track + Wert-Arc via `stroke-dasharray`/`stroke-dashoffset`), Glow via `drop-shadow`. Zahl per bestehender `CountUp`.
- Einsatz Dashboard: Ø Flavor.

### `CorrelationScatter`
SVG-Scatter **Brew-Ratio (x) × Geschmack/Flavor (y)**, ein Punkt je Shot.
- Props: `shots: { ratio: number; flavor: number }[]` (oder direkt `Shot[]` + Selektoren).
- Punktfarbe: nach Rating, über **neuen Hex-Helper** `ratingHex(v)` (s.u.) — koppelt Chart-Farben an die 10-stufige Rating-Skala (erledigt Backlog-Task „Chart-Farben an ratingColor koppeln").
- Achsen + dezentes Grid (dunkel), x = Ratio, y = Flavor 1–10.
- **Regressionslinie + Pearson-`r`** nur ab genug Daten (s. Daten-Realität).
- Berechnung (`ratio`, `flavor`, Regression, `r`) in reiner Util-Funktion `correlation.ts` → unit-testbar, getrennt vom SVG.

### `LiquidBar`
Brew-Ratio-Bar, Gold-Verlauf + Inset-Schatten („flüssig"). **Erst prüfen, ob bestehende `BrewRatioBar` restylt werden kann** statt neue Komponente — wenn API passt, restylen; sonst neue `LiquidBar` und `BrewRatioBar` unangetastet lassen.

### Recent-Shot-Row + CTA
- Recent-Shot-Zeile in `EmbossedTile`-Stil mit 3D-Rating-Chip (bestehende `ratingBadgeClasses`).
- Glühender „+ Neuer Shot"-CTA → neue `Button`-Variante `glow` (Gold-Verlauf + Schatten-Glow).

### `ratingHex(v: number): string` (neu, in `ratingColor.ts`)
Bestehende `ratingColor`/`ratingBadgeClasses` liefern **Tailwind-Klassen** — für SVG-`fill` nutzlos. Neuer Helper gibt Hex der 10-stufigen Skala zurück (rot→gold→grün), passend zu den vorhandenen Funktionsfarben. Einzige Farbquelle für `CorrelationScatter`.

## Layout

Bento-Grid ersetzt die aktuellen flachen Stat-Karten in `Dashboard.tsx`:
- **Desktop:** 3-Spalten-Grid. Held = `DialGauge` (Ø Flavor) über 2 Reihen; rechts oben Ratio-`LiquidBar`-Kachel; darunter `CorrelationScatter` (volle Breite); darunter Recent-Shot-Row.
- **Mobile:** gestapelt (Dial → Ratio → Scatter → Recent).
- Header: Datum-Label + „Espresso" + glühender CTA.

## Daten-Realität (Schwellen)

Aktuell wenige Shots (Single-User). Verhalten:
- **0 Shots:** Dial/Ratio/Scatter zeigen Leerstate („Erfasse deinen ersten Shot").
- **1 Shot:** Dial/Ratio mit Ø; Scatter zeigt den Punkt, **keine** Linie/`r`.
- **2–4 Shots:** Scatter-Punkte, **keine** Regressionslinie / kein `r` (statistisch sinnlos).
- **≥5 Shots:** Regressionslinie + `r`-Wert.
- Schwellen-Konstante zentral, in `correlation.ts` getestet.

## Animation

GSAP (bereits Dependency) + `prefers-reduced-motion` respektieren (bestehendes Muster, `src/__tests__/setup.ts` matchMedia-Polyfill). Nur beim Mount/Route-Enter, nicht endlos:
- `DialGauge`: Ring füllt sich (dashoffset-Tween), Zahl per `CountUp`.
- `LiquidBar`: Breite fließt rein.
- `CorrelationScatter`: Punkte staggered Pop-in, Regressionslinie zeichnet sich.

## Funktionsfarben

Rating-/Score-Farben (grün/gold/rot, 10-stufig) bleiben bewusst Funktionsfarben — gelten auch für Scatter-Punkte (`ratingHex`) und Dial-Default-Farbe.

## Tests

- **Unit:** `correlation.ts` (Ratio/Flavor-Extraktion, Pearson-`r`, Regression, Schwellen-Logik 0/1/2-4/≥5); `ratingHex` (Grenzwerte 1/5/8/10, Fallback); `DialGauge` (rendert Wert/Arc); `LiquidBar` (Breite).
- **Integration:** `Dashboard` rendert Kacheln + korrekte Leerstates je Datenstand.
- **Visuell:** Playwright-Screenshot-Self-Review (bestehendes `scripts/shoot.mjs` / `verify-shoot.mjs`-Muster) über mehrere Datenstände (0 / wenige / ≥5 Shots via Mock).

## Verifikation vor Merge

Wie laufende Praxis: `npx tsc -b` + `npx vitest run` + `npm run build` grün; Screenshots selbst prüfen vor Vorlage; dann mergen/deployen über Branch→Preview→main (git-connected Vercel).

## Offene Annahmen

- `LiquidBar` vs. `BrewRatioBar`: Entscheidung beim Bauen (restylen wenn möglich).
- Genauer Bento-Grid-Bruch (Spalten/Spans) wird beim Bauen per Screenshot feinjustiert.
