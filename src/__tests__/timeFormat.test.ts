import { secondsToMMSS, MMSSToSeconds, normalizeTimeInput } from '../utils/timeFormat'

test('secondsToMMSS konvertiert 240 zu 04:00', () => {
  expect(secondsToMMSS(240)).toBe('04:00')
})

test('secondsToMMSS konvertiert 90 zu 01:30', () => {
  expect(secondsToMMSS(90)).toBe('01:30')
})

test('secondsToMMSS konvertiert 0 zu 00:00', () => {
  expect(secondsToMMSS(0)).toBe('00:00')
})

test('secondsToMMSS konvertiert 65 zu 01:05', () => {
  expect(secondsToMMSS(65)).toBe('01:05')
})

test('MMSSToSeconds gibt 240 für "04:00"', () => {
  expect(MMSSToSeconds('04:00')).toBe(240)
})

test('MMSSToSeconds gibt 90 für "01:30"', () => {
  expect(MMSSToSeconds('01:30')).toBe(90)
})

test('MMSSToSeconds interpretiert "240" als 240 Sekunden', () => {
  expect(MMSSToSeconds('240')).toBe(240)
})

test('MMSSToSeconds gibt null für leere Eingabe', () => {
  expect(MMSSToSeconds('')).toBeNull()
})

test('MMSSToSeconds gibt null für ungültige Eingabe', () => {
  expect(MMSSToSeconds('abc')).toBeNull()
})

test('normalizeTimeInput konvertiert "240" zu "04:00"', () => {
  expect(normalizeTimeInput('240')).toBe('04:00')
})

test('normalizeTimeInput lässt "04:00" unverändert', () => {
  expect(normalizeTimeInput('04:00')).toBe('04:00')
})

test('normalizeTimeInput gibt leeren String für leere Eingabe', () => {
  expect(normalizeTimeInput('')).toBe('')
})
