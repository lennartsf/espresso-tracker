import { parseBookooFrame } from '../lib/scales/bookoo'
import { webBluetoothAvailable } from '../lib/scales/types'
import { createScale, SCALE_ADAPTERS } from '../lib/scales/registry'

/** Baut ein Frame nach der dokumentierten Struktur. */
function frame(grams: number, opts: { header?: [number, number] } = {}): DataView {
  const [h0, h1] = opts.header ?? [0x03, 0x0b]
  const raw = Math.round(Math.abs(grams) * 100)
  const bytes = new Uint8Array(20)
  bytes[0] = h0
  bytes[1] = h1
  bytes[6] = grams < 0 ? 0x2d : 0x2b
  bytes[7] = (raw >> 16) & 0xff
  bytes[8] = (raw >> 8) & 0xff
  bytes[9] = raw & 0xff
  return new DataView(bytes.buffer)
}

test('a weight frame decodes to grams', () => {
  expect(parseBookooFrame(frame(18.5))).toBeCloseTo(18.5)
  expect(parseBookooFrame(frame(0))).toBe(0)
  expect(parseBookooFrame(frame(38.42))).toBeCloseTo(38.42)
})

test('negative weights survive (tare with the cup lifted off)', () => {
  expect(parseBookooFrame(frame(-2.3))).toBeCloseTo(-2.3)
})

test('a frame with the wrong header is rejected', () => {
  // Sonst wuerde ein Status-Frame als Gewichtssprung durchgehen und den
  // Auto-Stopp ausloesen.
  expect(parseBookooFrame(frame(20, { header: [0x03, 0x0c] }))).toBeNull()
  expect(parseBookooFrame(frame(20, { header: [0xff, 0x0b] }))).toBeNull()
})

test('a truncated frame is rejected', () => {
  expect(parseBookooFrame(new DataView(new Uint8Array(4).buffer))).toBeNull()
})

test('an implausible weight is rejected rather than reported', () => {
  // Eine Espressowaage wiegt keine 5 kg — so ein Wert heisst, das Layout
  // stimmt nicht.
  const bytes = new Uint8Array(20)
  bytes[0] = 0x03; bytes[1] = 0x0b; bytes[6] = 0x2b
  bytes[7] = 0xff; bytes[8] = 0xff; bytes[9] = 0xff
  expect(parseBookooFrame(new DataView(bytes.buffer))).toBeNull()
})

// ── Registry ───────────────────────────────────────────────────────────────

test('the registry hands out a fresh instance each time', () => {
  // Zwei Verbindungsversuche duerfen sich keinen Zustand teilen.
  const a = createScale('bookoo')
  const b = createScale('bookoo')
  expect(a).not.toBeNull()
  expect(a).not.toBe(b)
})

test('an unknown scale id yields null, not a crash', () => {
  expect(createScale('acaia')).toBeNull()
})

test('every registered adapter declares what the UI needs', () => {
  for (const entry of SCALE_ADAPTERS) {
    const s = entry.create()
    expect(s.id).toBe(entry.id)
    expect(s.name.length).toBeGreaterThan(0)
    expect(s.serviceUuids.length).toBeGreaterThan(0)
    expect(s.namePrefixes.length).toBeGreaterThan(0)
  }
})

test('web bluetooth is correctly reported as absent in jsdom', () => {
  // jsdom hat kein navigator.bluetooth — dieselbe Lage wie in Safari.
  expect(webBluetoothAvailable()).toBe(false)
})
