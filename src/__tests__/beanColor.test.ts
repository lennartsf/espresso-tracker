import { beanShades, beansToShow, coarseRoastLevel } from '../utils/beanColor'

/** Relativhelligkeit, nur fuer Vergleiche innerhalb der Tests. */
function lum(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

test('a darker roast level gives a darker bean, without exception', () => {
  // Das ist die Kernaussage der Grafik. Ein Ausreisser wuerde bedeuten, dass
  // ein dunklerer Roestgrad heller aussieht.
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const lums = levels.map(l => lum(beanShades(l).base))
  for (let i = 1; i < lums.length; i++) {
    expect(lums[i]).toBeLessThan(lums[i - 1])
  }
})

test('the fine scale interpolates between the stops', () => {
  // Ohne Interpolation wuerde der Schieberegler in Stufen springen.
  const a = lum(beanShades(5).base)
  const mid = lum(beanShades(5.5).base)
  const b = lum(beanShades(6).base)
  expect(mid).toBeLessThan(a)
  expect(mid).toBeGreaterThan(b)
})

test('light side is always brighter than base, shade always darker', () => {
  for (const l of [1, 3.5, 5, 7.2, 10]) {
    const s = beanShades(l)
    expect(lum(s.light)).toBeGreaterThan(lum(s.base))
    expect(lum(s.shade)).toBeLessThan(lum(s.base))
  }
})

test('oil sheen only appears on dark roasts', () => {
  // Eine glaenzende helle Bohne waere schlicht falsch — Oel tritt erst bei
  // dunkler Roestung an die Oberflaeche.
  expect(beanShades(3).sheen).toBe(0)
  expect(beanShades(6).sheen).toBe(0)
  expect(beanShades(8).sheen).toBeGreaterThan(0)
  expect(beanShades(10).sheen).toBeGreaterThan(beanShades(8).sheen)
})

test('out-of-range and broken values are clamped, not rendered black', () => {
  expect(beanShades(-5).base).toBe(beanShades(1).base)
  expect(beanShades(99).base).toBe(beanShades(10).base)
  expect(beanShades(NaN).base).toBe(beanShades(5).base)
})

test('every shade is a valid hex colour', () => {
  for (const l of [1, 2.7, 5, 8.9, 10]) {
    const s = beanShades(l)
    for (const c of [s.base, s.light, s.shade]) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/)
    }
  }
})

// ── Sortenwahl ─────────────────────────────────────────────────────────────

test('a blend shows both beans', () => {
  expect(beansToShow(70, 30)).toEqual(['arabica', 'robusta'])
})

test('a 100% variety shows only that one', () => {
  expect(beansToShow(100, null)).toEqual(['arabica'])
  expect(beansToShow(100, 0)).toEqual(['arabica'])
  expect(beansToShow(null, 100)).toEqual(['robusta'])
  expect(beansToShow(0, 100)).toEqual(['robusta'])
})

test('no species information falls back to arabica, not to nothing', () => {
  // Eine leere Flaeche waere schlechter als die haeufigere Annahme.
  expect(beansToShow(null, null)).toEqual(['arabica'])
  expect(beansToShow(0, 0)).toEqual(['arabica'])
})

// ── Grober Wert ────────────────────────────────────────────────────────────

test('the coarse level is the rounded fine level', () => {
  expect(coarseRoastLevel(7.4)).toBe(7)
  expect(coarseRoastLevel(7.5)).toBe(8)
  expect(coarseRoastLevel(1.2)).toBe(1)
})

test('the coarse level stays inside 1..10 whatever comes in', () => {
  // roast_level ist int2 mit Bedeutung 1-10; eine 0 oder 11 wuerde Badges
  // und Filter kaputtmachen.
  expect(coarseRoastLevel(0.2)).toBe(1)
  expect(coarseRoastLevel(99)).toBe(10)
  expect(coarseRoastLevel(null)).toBeNull()
  expect(coarseRoastLevel(NaN)).toBeNull()
})
