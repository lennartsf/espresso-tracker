import { drinkTypeLabel, milkTypeLabel, DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'

test('DRINK_TYPES has 6 entries', () => {
  expect(DRINK_TYPES).toHaveLength(6)
})

test('MILK_TYPES has 7 entries', () => {
  expect(MILK_TYPES).toHaveLength(7)
})

test('drinkTypeLabel returns Espresso', () => {
  expect(drinkTypeLabel('espresso')).toBe('Espresso')
})

test('drinkTypeLabel returns Cappuccino', () => {
  expect(drinkTypeLabel('cappuccino')).toBe('Cappuccino')
})

test('drinkTypeLabel returns Flat White', () => {
  expect(drinkTypeLabel('flat_white')).toBe('Flat White')
})

test('drinkTypeLabel returns Latte Macchiato', () => {
  expect(drinkTypeLabel('latte_macchiato')).toBe('Latte Macchiato')
})

test('drinkTypeLabel fallback for unknown value', () => {
  expect(drinkTypeLabel('unknown')).toBe('unknown')
})

test('milkTypeLabel returns Oat Milk', () => {
  expect(milkTypeLabel('hafer')).toBe('Oat Milk')
})

test('milkTypeLabel returns Whole Milk 3.8%', () => {
  expect(milkTypeLabel('vollmilch_38')).toBe('Whole Milk 3.8%')
})

test('milkTypeLabel fallback for unknown value', () => {
  expect(milkTypeLabel('unknown')).toBe('unknown')
})
