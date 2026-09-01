import { ratingColor, ratingBadgeClasses, ratingHex } from '../utils/ratingColor'

test('gibt Rot für 1 zurück', () => {
  expect(ratingColor(1)).toBe('bg-red-100 text-red-900')
})

test('gibt Orange für 4 zurück', () => {
  expect(ratingColor(4)).toBe('bg-orange-200 text-orange-900')
})

test('gibt Orange/Amber für 5 zurück', () => {
  expect(ratingColor(5)).toBe('bg-amber-200 text-amber-900')
})

test('gibt Grün für 10 zurück', () => {
  expect(ratingColor(10)).toBe('bg-green-300 text-green-900')
})

test('gibt Fallback für ungültige Werte zurück', () => {
  expect(ratingColor(0)).toBe('bg-slate-100 text-slate-500')
  expect(ratingColor(11)).toBe('bg-slate-100 text-slate-500')
})

test('ratingBadgeClasses: hoch = grün', () => {
  expect(ratingBadgeClasses(9)).toContain('green')
})
test('ratingBadgeClasses: mittel = lime', () => {
  expect(ratingBadgeClasses(7)).toContain('lime')
})
test('ratingBadgeClasses: niedrig-mittel = amber', () => {
  expect(ratingBadgeClasses(5)).toContain('amber')
})
test('ratingBadgeClasses: niedrig = rot', () => {
  expect(ratingBadgeClasses(2)).toContain('red')
})
test('ratingBadgeClasses: ungültig = neutral', () => {
  expect(ratingBadgeClasses(0)).toContain('coffee')
})

test('ratingHex maps the 10-step scale red -> amber -> green', () => {
  expect(ratingHex(1)).toBe('#d13025')   // low = red
  expect(ratingHex(6)).toBe('#838a20')   // mid = olive (NOT brand gold #c9a35e)
  expect(ratingHex(8)).toBe('#4e9d31')   // high = green
  expect(ratingHex(10)).toBe('#2ca759')
})

// ── Die Eigenschaften, auf die es ankommt ───────────────────────────────────
// Die Literale oben sagen nur, DASS sich nichts unbemerkt verschiebt. Die Tests
// hier sagen, WARUM die Werte so sind — sie ueberleben ein bewusstes Neuwaehlen
// der Farbtoene und fangen genau die Fehler, die beim Umbau passieren.

/** WCAG-Relativluminanz. */
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

const DARK_SURFACE = '#25201b'   // --coffee-surface, Theme dark
const LIGHT_SURFACE = '#fffdfa'  // --coffee-surface, Theme light
const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

test.each(STEPS)('rating step %i is visible on BOTH surfaces', step => {
  // 3:1 ist die WCAG-Schwelle fuer Grafik-Elemente. Eine nur fuer Hell
  // optimierte Rampe faellt auf Dunkel durch und umgekehrt — genau deshalb
  // liegt die Rampe im Luminanz-Fenster, das beide Bedingungen erfuellt.
  const hex = ratingHex(step)
  expect(contrast(hex, DARK_SURFACE)).toBeGreaterThanOrEqual(3)
  expect(contrast(hex, LIGHT_SURFACE)).toBeGreaterThanOrEqual(3)
})

test('rating luminance rises monotonically from 1 to 10', () => {
  // Damit ist die Bewertung auch ohne Farbunterscheidung ablesbar — bei einer
  // Rot-Gruen-Skala der Punkt, auf den es fuer Rot-Gruen-Blinde ankommt.
  const lums = STEPS.map(n => luminance(ratingHex(n)))
  for (let i = 1; i < lums.length; i++) {
    expect(lums[i]).toBeGreaterThan(lums[i - 1])
  }
})

test('the rating scale never uses the brand gold', () => {
  // Gold = Marke/Interaktion. Eine Bewertung in Markenfarbe waere nicht als
  // Bewertung lesbar.
  expect(STEPS.map(n => ratingHex(n))).not.toContain('#c9a35e')
})

test('ratingHex falls back to muted for out-of-range', () => {
  expect(ratingHex(0)).toBe('#7a6450')
  expect(ratingHex(11)).toBe('#7a6450')
})
