import { render, screen } from '@testing-library/react'
import { CoffeeBean } from '../components/CoffeeBean'
import { beanShades, formatRoast, hasRoast, coarseRoastLevel } from '../utils/beanColor'

test('a blend renders two beans, a single variety one', () => {
  const { container, unmount } = render(<CoffeeBean roastLevel={6} arabicaPct={70} robustaPct={30} />)
  // Pro Bohne genau ein Koerper-Verlauf.
  expect(container.querySelectorAll('radialGradient[id^="body-"]')).toHaveLength(2)
  unmount()
  const { container: single } = render(<CoffeeBean roastLevel={6} arabicaPct={100} robustaPct={null} />)
  expect(single.querySelectorAll('radialGradient[id^="body-"]')).toHaveLength(1)
})

test('the accessible name states species and roast level', () => {
  render(<CoffeeBean roastLevel={7.3} arabicaPct={100} robustaPct={null} />)
  expect(screen.getByRole('img')).toHaveAccessibleName('Arabica bean, roast level 7.3 of 10')
})

test('a blend names both species', () => {
  render(<CoffeeBean roastLevel={5} arabicaPct={60} robustaPct={40} />)
  expect(screen.getByRole('img')).toHaveAccessibleName(/Arabica and Robusta bean/)
})

test('no roast level renders a mid-roast bean instead of nothing', () => {
  render(<CoffeeBean roastLevel={null} arabicaPct={100} robustaPct={null} />)
  expect(screen.getByRole('img')).toHaveAccessibleName(/roast level 5.0 of 10/)
})

test('gradient ids are unique per bean so two beans do not share one fill', () => {
  // Gleiche IDs im selben Dokument → beide Bohnen bekaemen denselben Verlauf.
  const { container } = render(<CoffeeBean roastLevel={6} arabicaPct={70} robustaPct={30} />)
  const ids = [...container.querySelectorAll('radialGradient')].map(g => g.id)
  expect(new Set(ids).size).toBe(ids.length)
})

// ── Sichtbarkeit auf dem Teller ──────────────────────────────────────────────

function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const ch = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  const lin = ch.map(x => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const PLATE_BTM = '#ded4c2'  // dunkleres Ende des Tellerverlaufs = schlechtester Fall
const BEAN_RIM = '#3a2c1e'

test('the rim carries the silhouette on every roast level', () => {
  // Die FUELLUNG kann das nicht: eine helle Roestung liegt farblich nah am
  // Teller. Deshalb muss die Kontur allein die Form tragen — und zwar
  // unabhaengig vom Roestgrad, also einmal gegen den Teller geprueft.
  expect(contrast(BEAN_RIM, PLATE_BTM)).toBeGreaterThanOrEqual(3)
})

test.each([1, 3, 5, 7, 9, 10])('roast level %i is discernible on the plate', level => {
  // Vor dem Teller lag die Bohne auf der Karte und erreichte in Dark bei
  // dunklen Roestungen 1.03:1 — unsichtbar. Entweder traegt jetzt die
  // Fuellung den Kontrast oder die Kontur; eines von beiden muss reichen.
  const { base } = beanShades(level)
  const byFill = contrast(base, PLATE_BTM)
  const byRim = contrast(BEAN_RIM, PLATE_BTM)
  expect(Math.max(byFill, byRim)).toBeGreaterThanOrEqual(3)
})

test('the plate has an edge so it does not melt into a light card', () => {
  // In Light ist die Karte #fffdfa und der Teller #efe8dc — ohne Kante waere
  // die Grenze kaum zu sehen.
  expect(contrast('#cabda6', '#fffdfa')).toBeGreaterThanOrEqual(1.5)
})

// ── Anzeige des Röstgrads ───────────────────────────────────────────────────

test('the fine value wins over the rounded one', () => {
  // Der Kern: gespeichert wird 7.3, gerundet danebengelegt 7. Wer 7 anzeigt,
  // laesst die Speicherung gerundet aussehen, obwohl der genaue Wert da ist.
  expect(formatRoast(7.3, 7)).toBe('7.3')
  expect(formatRoast(8.5, 9)).toBe('8.5')
})

test('a coffee with only the rounded value still shows something', () => {
  // Alte Kaffees von vor der feinen Skala haben nur roast_level.
  expect(formatRoast(null, 6)).toBe('6.0')
})

test('no roast level means no text, not a zero', () => {
  expect(formatRoast(null, null)).toBeNull()
  expect(formatRoast(undefined, undefined)).toBeNull()
  // Ein kaputter DB-Wert darf nicht als „NaN" in der UI landen.
  expect(formatRoast(Number.NaN, null)).toBeNull()
})

test('hasRoast checks BOTH columns', () => {
  // Nur auf roast_level zu pruefen versteckte einen Kaffee, der ausschliesslich
  // einen feinen Wert hat.
  expect(hasRoast(7.3, null)).toBe(true)
  expect(hasRoast(null, 7)).toBe(true)
  expect(hasRoast(null, null)).toBe(false)
})

test('the coarse value is derived, never the stored truth', () => {
  // coarseRoastLevel ist nur fuer die Zweitschrift `roast_level` da. Der feine
  // Wert geht ungerundet in die DB — deshalb darf er hier nicht durchlaufen.
  expect(coarseRoastLevel(7.3)).toBe(7)
  expect(coarseRoastLevel(7.5)).toBe(8)
  expect(formatRoast(7.5, coarseRoastLevel(7.5))).toBe('7.5')
})
