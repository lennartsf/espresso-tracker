import { flowRate, detectStop, DEFAULT_AUTO_STOP } from '../lib/scales/autoStop'
import { espressoCurve, MockScale } from '../lib/scales/mock'
import type { ScaleReading } from '../lib/scales/types'

const at = (grams: number, ms: number): ScaleReading => ({ grams, at: ms })

// ── flowRate ───────────────────────────────────────────────────────────────

test('flow rate is grams per second over the window', () => {
  const r = [at(0, 0), at(1, 500), at(2, 1000)]
  expect(flowRate(r, 1000)).toBeCloseTo(2)
})

test('flow rate needs at least two readings inside the window', () => {
  expect(flowRate([], 600)).toBeNull()
  expect(flowRate([at(1, 0)], 600)).toBeNull()
})

test('two readings at the same timestamp give no rate instead of Infinity', () => {
  expect(flowRate([at(0, 100), at(5, 100)], 600)).toBeNull()
})

// ── detectStop: die beiden Faelle, an denen die naive Regel scheitert ───────

test('the quiet phase BEFORE the first drop does not stop the timer', () => {
  // Der wichtigste Fall: waehrend der Preinfusion aendert sich nichts. Wer nur
  // auf Stillstand prueft, stoppt sofort nach dem Start.
  const preinfusion = Array.from({ length: 30 }, (_, i) => at(0.02, i * 200))
  expect(detectStop(preinfusion).stopAt).toBeNull()
})

test('a real pull is detected after the flow dies down', () => {
  const { stopAt, grams } = detectStop(espressoCurve())
  expect(stopAt).not.toBeNull()
  // Erst nach dem Nachtropfen (~30.5 s), nicht schon beim Bezugsende.
  expect(stopAt!).toBeGreaterThan(29000)
  expect(grams!).toBeGreaterThan(37)
  expect(grams!).toBeLessThan(39)
})

test('a brief pause mid-pull does not end the shot', () => {
  // Ein Schwapper oder ein kurzer Flussrueckgang darf den Timer nicht stoppen.
  const r: ScaleReading[] = []
  for (let t = 0; t <= 8000; t += 200) r.push(at((t / 8000) * 20, t))
  for (let t = 8200; t <= 8800; t += 200) r.push(at(20, t))        // 600 ms Pause
  for (let t = 9000; t <= 16000; t += 200) r.push(at(20 + ((t - 9000) / 7000) * 18, t))
  // Pause ist kuerzer als quietMs → kein Stopp waehrend des Bezugs.
  const stop = detectStop(r)
  expect(stop.stopAt === null || stop.stopAt > 8800).toBe(true)
})

test('noise alone never triggers a stop before the minimum yield', () => {
  const r = Array.from({ length: 40 }, (_, i) => at(Math.sin(i) * 0.08, i * 200))
  expect(detectStop(r).stopAt).toBeNull()
})

test('a pull that never settles returns no stop', () => {
  const r = Array.from({ length: 60 }, (_, i) => at(i * 0.8, i * 200))
  expect(detectStop(r).stopAt).toBeNull()
})

test('a stricter quiet window postpones the stop', () => {
  const lenient = detectStop(espressoCurve(), DEFAULT_AUTO_STOP)
  const strict = detectStop(espressoCurve(), { ...DEFAULT_AUTO_STOP, quietMs: 3000 })
  expect(strict.stopAt!).toBeGreaterThan(lenient.stopAt!)
})

test('too few readings are handled, not crashed on', () => {
  expect(detectStop([])).toEqual({ stopAt: null, grams: null })
  expect(detectStop([at(10, 0)])).toEqual({ stopAt: null, grams: null })
})

// ── MockScale ──────────────────────────────────────────────────────────────

test('the mock scale replays its curve to subscribers', () => {
  const scale = new MockScale([at(0, 0), at(5, 500), at(10, 1000)])
  const seen: number[] = []
  scale.onWeight(r => seen.push(r.grams))
  scale.replay()
  expect(seen).toEqual([0, 5, 10])
})

test('unsubscribing stops delivery', () => {
  const scale = new MockScale([at(1, 0), at(2, 200)])
  const seen: number[] = []
  const off = scale.onWeight(r => seen.push(r.grams))
  off()
  scale.replay()
  expect(seen).toEqual([])
})

test('disconnect drops every listener', async () => {
  const scale = new MockScale([at(1, 0)])
  const seen: number[] = []
  scale.onWeight(r => seen.push(r.grams))
  await scale.disconnect()
  scale.replay()
  expect(seen).toEqual([])
  expect(scale.status).toBe('disconnected')
})
