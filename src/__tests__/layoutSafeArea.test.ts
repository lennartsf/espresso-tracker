import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const layout = readFileSync(resolve(__dirname, '../components/Layout.tsx'), 'utf-8')

/**
 * Der untere Seitenrand und die Hoehe der Navigationsleiste haengen zusammen.
 *
 * Gemessen (390x844, Inset 34px, gegen das gebaute CSS):
 *   Leiste ohne Inset   57 px
 *   Leiste am iPhone    91 px   (57 + 34 Safe Area)
 *   reserviert war      80 px   -> 11 px Inhalt lagen unter der Leiste
 *   reserviert ist     114 px   -> 23 px Luft
 *
 * Der Punkt ist nicht die Zahl 114, sondern dass BEIDE Seiten dasselbe
 * `env(safe-area-inset-bottom)` tragen. Dadurch bleibt der Abstand auf jedem
 * Geraet gleich gross. Vorher war der Rand konstant, waehrend die Leiste mit
 * der Safe Area wuchs — deshalb brach es genau auf den Geraeten, die eine
 * haben, und nur dort.
 */
test('the bottom bar reserves space including the safe area', () => {
  const main = layout.match(/<main className="([^"]+)"/)![1]
  expect(main).toContain('env(safe-area-inset-bottom)')
  // Ein festes pb-* fuer MOBIL waere genau der alte Fehler. `md:pb-10` ist in
  // Ordnung: am Desktop gibt es keine untere Leiste und keine Safe Area.
  expect(main).not.toMatch(/(?<!md:)\bpb-\d+\b/)
})

test('the bar itself still carries the safe area — both sides must', () => {
  // Faellt das hier weg, ohne dass der Rand mitgeht, sitzt die Leiste im
  // Home-Indicator statt darueber.
  const nav = layout.match(/<nav className="md:hidden([^"]+)"/)![1]
  expect(nav).toContain('env(safe-area-inset-bottom)')
})

test('the More panel clears the bar', () => {
  // Die Leiste ist 57 px hoch; das Panel sitzt bei 4rem (64 px) + Inset,
  // liegt also darueber statt darauf.
  expect(layout).toContain('bottom-[calc(4rem+env(safe-area-inset-bottom))]')
})
