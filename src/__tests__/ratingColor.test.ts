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
  expect(ratingHex(1)).toBe('#c0392b')   // low = red
  expect(ratingHex(6)).toBe('#bcae49')   // mid = olive-amber (NOT brand gold #c9a35e)
  expect(ratingHex(8)).toBe('#6fb16a')   // high = green
  expect(ratingHex(10)).toBe('#4a9657')
})

test('ratingHex falls back to muted for out-of-range', () => {
  expect(ratingHex(0)).toBe('#7a6450')
  expect(ratingHex(11)).toBe('#7a6450')
})
