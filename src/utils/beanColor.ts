/**
 * Farbe einer Kaffeebohne nach Röstgrad — und die Sortenfrage dahinter.
 *
 * Die Skala läuft von 1 (Zimtröstung, hell und rötlich) bis 10 (italienisch,
 * fast schwarz mit Ölglanz). Zwischen den Stützstellen wird interpoliert,
 * damit der Schieberegler stufenlos wirkt.
 *
 * Die Stützpunkte sind an echten Röstgraden orientiert, nicht an einem
 * gleichmäßigen Farbverlauf: die Bohne wird zwischen hell und mittel deutlich
 * schneller dunkler als zwischen dunkel und sehr dunkel, wo nur noch der Glanz
 * zunimmt.
 */

/** Stützstellen: Röstgrad → [Grundton, Lichtseite, Schattenseite]. */
const STOPS: { at: number; base: string; light: string; shade: string }[] = [
  { at: 1,  base: '#c89a63', light: '#e2bd8c', shade: '#9c7040' }, // Zimt
  { at: 3,  base: '#a9713c', light: '#c9945c', shade: '#7d4e24' }, // hell
  { at: 5,  base: '#8a5228', light: '#a97042', shade: '#5f3616' }, // mittel
  { at: 7,  base: '#5f3618', light: '#7d4d28', shade: '#3d200c' }, // Wiener
  { at: 9,  base: '#3d2210', light: '#5a361c', shade: '#241206' }, // French
  { at: 10, base: '#2a1709', light: '#4a2c15', shade: '#170b03' }, // Italienisch
]

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t])
}

export interface BeanShades {
  base: string
  light: string
  shade: string
  /** Ölglanz 0–1. Erst ab etwa Stufe 7 tritt Öl an die Oberfläche; davor ist
   *  eine glänzende Bohne schlicht falsch. */
  sheen: number
}

/** Farbtöne für einen (auch gebrochenen) Röstgrad. Werte außerhalb 1–10
 *  werden geklemmt, damit ein kaputter DB-Wert keine schwarze Bohne ergibt. */
export function beanShades(roastLevel: number): BeanShades {
  const v = Math.min(10, Math.max(1, Number.isFinite(roastLevel) ? roastLevel : 5))

  let lo = STOPS[0]
  let hi = STOPS[STOPS.length - 1]
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (v >= STOPS[i].at && v <= STOPS[i + 1].at) {
      lo = STOPS[i]
      hi = STOPS[i + 1]
      break
    }
  }
  const span = hi.at - lo.at
  const t = span === 0 ? 0 : (v - lo.at) / span

  return {
    base: mix(lo.base, hi.base, t),
    light: mix(lo.light, hi.light, t),
    shade: mix(lo.shade, hi.shade, t),
    sheen: Math.max(0, Math.min(1, (v - 6.5) / 3.5)),
  }
}

export type BeanSpecies = 'arabica' | 'robusta'

/**
 * Welche Bohnen zeigt die Grafik?
 *
 * Bei einer 100-%-Sorte nur diese, bei einer Mischung beide. Sind gar keine
 * Anteile erfasst, wird Arabica gezeigt — das ist die häufigere Annahme und
 * besser als eine leere Fläche.
 */
export function beansToShow(
  arabicaPct: number | null,
  robustaPct: number | null,
): BeanSpecies[] {
  const a = arabicaPct ?? 0
  const r = robustaPct ?? 0
  if (a > 0 && r > 0) return ['arabica', 'robusta']
  if (r > 0) return ['robusta']
  if (a > 0) return ['arabica']
  return ['arabica']
}

/** Rundet den feinen Wert auf die grobe 1–10-Skala.
 *  `roast_level` bleibt in der DB und muss zum feinen Wert passen. */
export function coarseRoastLevel(fine: number | null): number | null {
  if (fine == null || !Number.isFinite(fine)) return null
  return Math.min(10, Math.max(1, Math.round(fine)))
}
