import {
  GRINDER_TYPES, FUNKTIONSWEISE_TYPES,
  grinderTypeLabel, funktionsweiseLabel,
  DEVICE_TYPES, deviceTypeLabel,
} from '../utils/equipmentTypes'

test('GRINDER_TYPES enthält 2 Einträge', () => {
  expect(GRINDER_TYPES).toHaveLength(2)
})

test('FUNKTIONSWEISE_TYPES enthält 4 Einträge', () => {
  expect(FUNKTIONSWEISE_TYPES).toHaveLength(4)
})

test('grinderTypeLabel gibt Flachscheibe zurück', () => {
  expect(grinderTypeLabel('flat')).toBe('Flachscheibe')
})

test('grinderTypeLabel gibt Kegelscheibe zurück', () => {
  expect(grinderTypeLabel('conical')).toBe('Kegelscheibe')
})

test('grinderTypeLabel Fallback für unbekannten Wert', () => {
  expect(grinderTypeLabel('unknown')).toBe('unknown')
})

test('funktionsweiseLabel gibt Einkreiser zurück', () => {
  expect(funktionsweiseLabel('einkreiser')).toBe('Einkreiser')
})

test('funktionsweiseLabel gibt Dualboiler zurück', () => {
  expect(funktionsweiseLabel('dualboiler')).toBe('Dualboiler')
})

test('funktionsweiseLabel gibt Zweikreiser zurück', () => {
  expect(funktionsweiseLabel('zweikreiser')).toBe('Zweikreiser')
})

test('funktionsweiseLabel gibt Thermoblock zurück', () => {
  expect(funktionsweiseLabel('thermoblock')).toBe('Thermoblock')
})

test('funktionsweiseLabel Fallback für unbekannten Wert', () => {
  expect(funktionsweiseLabel('unknown')).toBe('unknown')
})

test('DEVICE_TYPES hat 6 Einträge', () => {
  expect(DEVICE_TYPES).toHaveLength(6)
})

test('deviceTypeLabel gibt French Press zurück', () => {
  expect(deviceTypeLabel('french_press')).toBe('French Press')
})

test('deviceTypeLabel gibt V60 zurück', () => {
  expect(deviceTypeLabel('v60')).toBe('V60')
})

test('deviceTypeLabel Fallback für unbekannten Wert', () => {
  expect(deviceTypeLabel('unknown')).toBe('unknown')
})
