import {
  GRINDER_TYPES, FUNKTIONSWEISE_TYPES,
  grinderTypeLabel, funktionsweiseLabel,
  DEVICE_TYPES, deviceTypeLabel,
} from '../utils/equipmentTypes'

test('GRINDER_TYPES has 2 entries', () => {
  expect(GRINDER_TYPES).toHaveLength(2)
})

test('FUNKTIONSWEISE_TYPES has 4 entries', () => {
  expect(FUNKTIONSWEISE_TYPES).toHaveLength(4)
})

test('grinderTypeLabel returns Flat Burr', () => {
  expect(grinderTypeLabel('flat')).toBe('Flat Burr')
})

test('grinderTypeLabel returns Conical Burr', () => {
  expect(grinderTypeLabel('conical')).toBe('Conical Burr')
})

test('grinderTypeLabel fallback for unknown value', () => {
  expect(grinderTypeLabel('unknown')).toBe('unknown')
})

test('funktionsweiseLabel returns Single Boiler', () => {
  expect(funktionsweiseLabel('einkreiser')).toBe('Single Boiler')
})

test('funktionsweiseLabel returns Dual Boiler', () => {
  expect(funktionsweiseLabel('dualboiler')).toBe('Dual Boiler')
})

test('funktionsweiseLabel returns Heat Exchanger', () => {
  expect(funktionsweiseLabel('zweikreiser')).toBe('Heat Exchanger')
})

test('funktionsweiseLabel returns Thermoblock', () => {
  expect(funktionsweiseLabel('thermoblock')).toBe('Thermoblock')
})

test('funktionsweiseLabel fallback for unknown value', () => {
  expect(funktionsweiseLabel('unknown')).toBe('unknown')
})

test('DEVICE_TYPES has 6 entries', () => {
  expect(DEVICE_TYPES).toHaveLength(6)
})

test('deviceTypeLabel returns French Press', () => {
  expect(deviceTypeLabel('french_press')).toBe('French Press')
})

test('deviceTypeLabel returns V60', () => {
  expect(deviceTypeLabel('v60')).toBe('V60')
})

test('deviceTypeLabel fallback for unknown value', () => {
  expect(deviceTypeLabel('unknown')).toBe('unknown')
})
