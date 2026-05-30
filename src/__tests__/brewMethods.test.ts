import { BREW_METHODS, brewMethodLabel } from '../utils/brewMethods'

test('BREW_METHODS has 4 entries', () => {
  expect(BREW_METHODS).toHaveLength(4)
})

test('brewMethodLabel returns French Press', () => {
  expect(brewMethodLabel('french_press')).toBe('French Press')
})

test('brewMethodLabel returns V60', () => {
  expect(brewMethodLabel('v60')).toBe('V60')
})

test('brewMethodLabel returns AeroPress', () => {
  expect(brewMethodLabel('aeropress')).toBe('AeroPress')
})

test('brewMethodLabel returns Moka Pot', () => {
  expect(brewMethodLabel('moka_pot')).toBe('Moka Pot')
})

test('brewMethodLabel fallback for unknown value', () => {
  expect(brewMethodLabel('unknown')).toBe('unknown')
})
