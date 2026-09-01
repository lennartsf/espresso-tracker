export function ratingColor(v: number): string {
  const map: Record<number, string> = {
    1:  'bg-red-100 text-red-900',
    2:  'bg-red-200 text-red-800',
    3:  'bg-orange-100 text-orange-900',
    4:  'bg-orange-200 text-orange-900',
    5:  'bg-amber-200 text-amber-900',
    6:  'bg-yellow-100 text-yellow-900',
    7:  'bg-lime-100 text-lime-900',
    8:  'bg-green-100 text-green-900',
    9:  'bg-green-200 text-green-900',
    10: 'bg-green-300 text-green-900',
  }
  return map[v] ?? 'bg-slate-100 text-slate-500'
}

/** Hex der 10-stufigen Rating-Skala (rot→amber→grün) — für SVG-fills (Charts).
 *
 *  EINE Rampe für beide Themes (Paket C1b, 2026-08-27). Die Werte davor waren für
 *  dunklen Grund gewählt und erreichten auf heller Karte nur 2.07–3.57; für
 *  Grafik-Elemente verlangt WCAG 3:1. Eine einfach abgedunkelte Variante löst das
 *  nicht — sie fällt dann auf DUNKLEM Grund bei Stufe 1 und 2 durch. Der Ausweg ist
 *  das Luminanz-Fenster, in dem beide Bedingungen zugleich gelten:
 *    3:1 gegen `--coffee-surface` dark  (#26221e) → L ≥ 0.145
 *    3:1 gegen `--coffee-surface` light (#fffdfa) → L ≤ 0.295
 *  Alle zehn Stufen liegen darin und erreichen auf beiden Gründen 3.05–5.21.
 *
 *  Zusätzlich steigt die Luminanz jetzt MONOTON von Stufe 1 (0.158) zu Stufe 10
 *  (0.289). Die alte Skala war in der Mitte am hellsten und damit ohne
 *  Farbunterscheidung nicht ablesbar — bei einer Rot-Grün-Skala genau der Punkt,
 *  auf den es für Rot-Grün-Blinde ankommt.
 *
 *  Bewusst OHNE Brand-Gold #c9a35e: Akzent = Marke/Interaktion, nie Rating.
 *  Werte nur mit Kontrastprüfung gegen BEIDE Kartenflächen ändern. */
export function ratingHex(v: number): string {
  const map: Record<number, string> = {
    1: '#d13025', 2: '#c64c20', 3: '#b5631b', 4: '#a1741a', 5: '#90801b',
    6: '#838a20', 7: '#6a942a', 8: '#4e9d31', 9: '#30a437', 10: '#2ca759',
  }
  return map[v] ?? '#7a6450'
}

/** Lesbare Schrift auf einer `ratingHex`-Fläche.
 *
 *  Die Rampe liegt bewusst im Luminanz-Fenster 0.145–0.295 — dadurch trägt sie
 *  auf beiden Kartenflächen, aber sie ist eben auch überall mittelhell. Eine
 *  einzige Schriftfarbe reicht deshalb NICHT: Creme fällt ab Stufe 3 durch,
 *  dunkle Tinte auf den Stufen 1–2. Der Umschlag liegt bei Stufe 3.
 *
 *  Die beiden Tinten sind absichtlich etwas extremer als `--coffee-cream` und
 *  `--coffee-bg`: mit den Palettenwerten bliebe die Mitte der Rampe unter
 *  4.5:1. Sie sind themeunabhängig — die Fläche darunter ist die Rating-Farbe,
 *  nicht die Karte.
 *
 *  Der schlechteste Wert liegt bei 4.54:1 (Stufe 3) und damit knapp über der
 *  Anforderung. `ratingColor.test.ts` prüft das für alle zehn Stufen — wer die
 *  Rampe ändert, sieht sofort, wenn die Zusage fällt. */
export function ratingInk(v: number): string {
  return v <= 2 ? '#fffdfa' : '#0a0806'
}

/** Grundfarbe der Intensitäts-Skala je Theme.
 *  Dark: Creme auf dunklem Grund. Light: dunkles Braun auf hellem — gespiegelt,
 *  gleiche Aussage. Ohne diesen Wechsel wäre die Skala in Light unsichtbar
 *  (Creme auf cremefarbenem Grund), ohne dass irgendwo ein Fehler entstünde.
 *
 *  Bewusst ein TS-Wert und kein CSS-Token: die Farbe landet in Recharts als
 *  SVG-`fill`-ATTRIBUT, und dort löst `var(--x)` nicht auf — der Punkt wäre
 *  schwarz, ohne Fehlermeldung. */
export type ThemeName = 'light' | 'dark'

const INTENSITY_RGB: Record<ThemeName, string> = {
  dark: '246, 239, 228',
  light: '58, 44, 30',
}

/** Intensitäts-Fill (blass→satt) für NICHT-Qualitäts-Scores
 *  (Body/Säure/Bitterness): zeigt Stärke der Ausprägung, kein gut/schlecht.
 *  Bewusst nicht die rot→grün-Skala und nicht Brand-Gold.
 *  `theme` ist Pflicht, damit kein Aufrufer den Wechsel vergessen kann. */
export function intensityFill(v: number, theme: ThemeName): string {
  const t = Math.min(1, Math.max(0, (v - 1) / 9))
  return `rgba(${INTENSITY_RGB[theme]}, ${(0.28 + t * 0.67).toFixed(2)})`
}

/** Inline-Style fürs Intensitäts-Badge (Body/Säure/Bitterness).
 *  Die Schrift schlägt ab der Mitte um, sonst wird die Ziffer auf den satten
 *  Stufen unlesbar — in beiden Themes, nur spiegelbildlich. */
export function intensityBadge(v: number, theme: ThemeName): { backgroundColor: string; color: string } {
  const t = Math.min(1, Math.max(0, (v - 1) / 9))
  const alpha = 0.16 + t * 0.76
  const ink = theme === 'dark'
    ? { on: '#171412', off: '#f1e9df' }   // satte Creme-Fläche → dunkle Ziffer
    : { on: '#fffaf2', off: '#2a221b' }   // satte Braun-Fläche → helle Ziffer
  return {
    backgroundColor: `rgba(${INTENSITY_RGB[theme]}, ${alpha.toFixed(2)})`,
    color: t > 0.5 ? ink.on : ink.off,
  }
}

/** Gefüllte Klassen fürs Rating-Badge (Funktionsfarbe).
 *  Bleibt themeunabhängig: dunkle Füllung mit heller Ziffer trägt auf beiden
 *  Gründen, deshalb hier bewusst keine Token. */
export function ratingBadgeClasses(v: number): string {
  if (v >= 8 && v <= 10) return 'bg-green-600/90 text-green-50 ring-1 ring-green-400/40 shadow-lg shadow-green-900/30'
  if (v >= 6) return 'bg-lime-600/90 text-lime-50 ring-1 ring-lime-400/40 shadow-lg shadow-lime-900/30'
  if (v >= 4) return 'bg-amber-600/90 text-amber-50 ring-1 ring-amber-400/40 shadow-lg shadow-amber-900/30'
  if (v >= 1) return 'bg-red-600/90 text-red-50 ring-1 ring-red-400/40 shadow-lg shadow-red-900/30'
  return 'bg-coffee-surface2 text-coffee-muted ring-1 ring-coffee-line'
}
