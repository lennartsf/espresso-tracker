import type { ThemeName } from './ratingColor'

/** Literale Chart-Farben je Theme.
 *
 *  Warum nicht `var(--coffee-muted)` direkt in den Recharts-Props?
 *  Recharts setzt `stroke`/`fill` als SVG-PRÄSENTATIONSATTRIBUT. Chromium löst
 *  `var()` dort auf (nachgemessen, inkl. `rgba(var(--x), α)`) — aber die App
 *  läuft primär auf dem iPhone, und für Safari ist das nicht verifiziert. Fällt
 *  es dort aus, wird der Text schwarz statt gedämpft: still, ohne Fehler, und
 *  ausgerechnet auf dem Hauptgerät. Deshalb hier literale Werte.
 *
 *  ⚠ Muss mit den Tokens in `src/index.css` synchron bleiben — abgesichert durch
 *  `src/__tests__/themeTokens.test.ts`, das beide Seiten vergleicht. */
export interface ChartColors {
  /** Achsenbeschriftung und Tick-Labels — entspricht `--coffee-muted`. */
  axis: string
  /** Gitternetz — entspricht `--coffee-surface-2`. */
  grid: string
  /** Balken ohne Wert (leerer Tag) — entspricht `--coffee-surface-2`. */
  emptyBar: string
  /** Balken mit Wert — entspricht `--coffee-accent-deco` (textfreie Fläche). */
  bar: string
  /** Hover-Fläche hinter einem Balken. */
  cursor: string
}

const CHART: Record<ThemeName, ChartColors> = {
  dark: {
    axis: '#a89784',
    grid: '#33291f',
    emptyBar: '#33291f',
    bar: '#c9a35e',
    cursor: 'rgba(233, 201, 135, 0.06)',
  },
  light: {
    axis: '#665849',
    grid: '#dcd2c1',
    emptyBar: '#dcd2c1',
    bar: '#b4863c',
    cursor: 'rgba(74, 54, 32, 0.07)',
  },
}

export function chartColors(theme: ThemeName): ChartColors {
  return CHART[theme]
}
