import { drinkTypeLabel, milkTypeLabel, DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'

test('DRINK_TYPES enthält 6 Einträge', () => {
  expect(DRINK_TYPES).toHaveLength(6)
})

test('MILK_TYPES enthält 7 Einträge', () => {
  expect(MILK_TYPES).toHaveLength(7)
})

test('drinkTypeLabel gibt Espresso zurück', () => {
  expect(drinkTypeLabel('espresso')).toBe('Espresso')
})

test('drinkTypeLabel gibt Cappuccino zurück', () => {
  expect(drinkTypeLabel('cappuccino')).toBe('Cappuccino')
})

test('drinkTypeLabel gibt Flat White zurück', () => {
  expect(drinkTypeLabel('flat_white')).toBe('Flat White')
})

test('drinkTypeLabel gibt Latte Macchiato zurück', () => {
  expect(drinkTypeLabel('latte_macchiato')).toBe('Latte Macchiato')
})

test('drinkTypeLabel Fallback für unbekannten Wert', () => {
  expect(drinkTypeLabel('unknown')).toBe('unknown')
})

test('milkTypeLabel gibt Hafermilch zurück', () => {
  expect(milkTypeLabel('hafer')).toBe('Hafermilch')
})

test('milkTypeLabel gibt Vollmilch 3,8% zurück', () => {
  expect(milkTypeLabel('vollmilch_38')).toBe('Vollmilch 3,8%')
})

test('milkTypeLabel Fallback für unbekannten Wert', () => {
  expect(milkTypeLabel('unknown')).toBe('unknown')
})
