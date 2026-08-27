import { drinkTypeLabel, milkTypeLabel, DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'

// Auf die tatsaechlichen Werte pruefen statt auf eine Zahl: der Zaehler-Test war
// still veraltet, seit Caffe Crema dazukam.
test('DRINK_TYPES lists every drink exactly once', () => {
  expect(DRINK_TYPES.map(d => d.value)).toEqual([
    'espresso',
    'caffe_crema',
    'cappuccino',
    'latte_macchiato',
    'flat_white',
    'cortado',
    'macchiato',
  ])
})

test('drinkTypeLabel returns Caffe Crema', () => {
  expect(drinkTypeLabel('caffe_crema')).toBe('Caffè Crema')
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
