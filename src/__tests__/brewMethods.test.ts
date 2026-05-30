import { BREW_METHODS, brewMethodLabel } from '../utils/brewMethods'

test('BREW_METHODS enthält 4 Einträge', () => {
  expect(BREW_METHODS).toHaveLength(4)
})

test('brewMethodLabel gibt French Press zurück', () => {
  expect(brewMethodLabel('french_press')).toBe('French Press')
})

test('brewMethodLabel gibt V60 zurück', () => {
  expect(brewMethodLabel('v60')).toBe('V60')
})

test('brewMethodLabel gibt AeroPress zurück', () => {
  expect(brewMethodLabel('aeropress')).toBe('AeroPress')
})

test('brewMethodLabel gibt Moka Pot zurück', () => {
  expect(brewMethodLabel('moka_pot')).toBe('Moka Pot')
})

test('brewMethodLabel Fallback für unbekannten Wert', () => {
  expect(brewMethodLabel('unknown')).toBe('unknown')
})
