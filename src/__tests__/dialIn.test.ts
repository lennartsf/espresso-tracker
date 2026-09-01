import { slope, suggestGrind, type DialInShot } from '../utils/dialIn'

/** Synthetische Shot-Serie: feiner (kleinerer Wert) ⇒ langsamer. */
function series(
  grinderId: string,
  coffeeId: string,
  pairs: [grind: number, time: number][],
): DialInShot[] {
  return pairs.map(([g, t]) => ({
    grind_setting: g, brew_time_s: t, coffee_id: coffeeId, grinder_id: grinderId,
  }))
}

// ── slope ──────────────────────────────────────────────────────────────────

test('slope of a clean line is exact', () => {
  expect(slope([{ x: 0, y: 0 }, { x: 1, y: -2 }, { x: 2, y: -4 }])).toBeCloseTo(-2)
})

test('slope needs at least two points', () => {
  expect(slope([])).toBeNull()
  expect(slope([{ x: 1, y: 1 }])).toBeNull()
})

test('slope is null when every x is the same', () => {
  // Senkrechte Punktwolke — es gibt keine Steigung, nur eine Division durch 0.
  expect(slope([{ x: 5, y: 1 }, { x: 5, y: 9 }])).toBeNull()
})

// ── Zu wenig Daten: keine erfundene Zahl ───────────────────────────────────

test('no shot with this coffee yields no number at all', () => {
  const shots = series('g1', 'other', [[14, 30], [15, 28]])
  const r = suggestGrind({ shots, coffeeId: 'new-bean', grinderId: 'g1', targetTime: 28 })
  expect(r.grind).toBeNull()
  expect(r.confidence).toBe('none')
  expect(r.message).toMatch(/No shot with this coffee yet/)
})

test('shots without grind or time are ignored entirely', () => {
  const shots: DialInShot[] = [
    { grind_setting: null, brew_time_s: 30, coffee_id: 'c1', grinder_id: 'g1' },
    { grind_setting: 14, brew_time_s: null, coffee_id: 'c1', grinder_id: 'g1' },
    { grind_setting: 14, brew_time_s: 0, coffee_id: 'c1', grinder_id: 'g1' },
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(r.coffeeShots).toBe(0)
  expect(r.grind).toBeNull()
})

// ── Das gelernte Muehlenverhalten ──────────────────────────────────────────

test('the slope is learned across coffees, not just the current one', () => {
  // Der Kern des Pakets: die Muehlencharakteristik kommt aus ALLEN Bohnen,
  // damit eine neue Tuete sie nicht neu lernen muss.
  const shots = [
    ...series('g1', 'bean-a', [[12, 34], [14, 30], [16, 26]]),
    // Auf derselben Geraden (34 - 2*(g-12)), damit der Test genau EINE Sache
    // prueft: dass bean-b von der Muehlencharakteristik aus bean-a profitiert.
    ...series('g1', 'bean-b', [[13, 32]]),
  ]
  const r = suggestGrind({ shots, coffeeId: 'bean-b', grinderId: 'g1', targetTime: 29 })
  expect(r.secondsPerStep).toBeCloseTo(-2, 1)
  expect(r.grinderShots).toBe(4)
  expect(r.coffeeShots).toBe(1)
})

test('shots from a different grinder do not pollute the slope', () => {
  // Mahlgradzahlen sind zwischen Muehlen nicht vergleichbar.
  const shots = [
    ...series('g1', 'c1', [[12, 34], [14, 30], [16, 26]]),
    ...series('g2', 'c1', [[1, 20], [9, 40]]), // ganz andere Skala
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 30 })
  expect(r.secondsPerStep).toBeCloseTo(-2, 1)
  expect(r.grinderShots).toBe(3)
})

// ── Die Richtung muss stimmen ──────────────────────────────────────────────

test('too fast means go finer, too slow means go coarser', () => {
  const shots = series('g1', 'c1', [[15, 22], [12, 34], [14, 30], [16, 26]])
  // Letzter Shot ist [15, 22] → zu schnell, Ziel 28 → feiner, also KLEINER.
  const fast = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(fast.grind!).toBeLessThan(15)
  expect(fast.message).toMatch(/finer/)

  const slowShots = series('g1', 'c1', [[13, 36], [12, 34], [14, 30], [16, 26]])
  const slow = suggestGrind({ shots: slowShots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(slow.grind!).toBeGreaterThan(13)
  expect(slow.message).toMatch(/coarser/)
})

test('a shot already on target leaves the grind alone', () => {
  const shots = series('g1', 'c1', [[14, 28], [12, 34], [16, 26]])
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(r.grind).toBe(14)
  expect(r.message).toMatch(/keep the grind/)
})

test('the suggested step size follows the learned slope', () => {
  // Bei -2 s/Klick braucht eine Luecke von 4 s zwei Klicks.
  const shots = series('g1', 'c1', [[14, 26], [12, 34], [16, 26]])
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 30 })
  expect(r.secondsPerStep).toBeCloseTo(-2, 1)
  expect(r.grind).toBeCloseTo(12, 1)
})

// ── Unbrauchbare Steigung ──────────────────────────────────────────────────

test('a nonsensical positive slope falls back instead of pointing the wrong way', () => {
  // Verrauschte Daten koennen eine positive Steigung ergeben — die wuerde
  // den Vorschlag in die falsche Richtung schicken.
  const shots = series('g1', 'c1', [[14, 22], [12, 20], [16, 30]])
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(r.grind!).toBeLessThan(14)      // zu schnell → feiner, trotz kaputter Steigung
  expect(r.confidence).toBe('low')
})

test('a single shot on the coffee still gives a direction, flagged as rough', () => {
  const shots = series('g1', 'c1', [[14, 22]])
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(r.grind!).toBeLessThan(14)
  expect(r.confidence).toBe('low')
  expect(r.message).toMatch(/rough guess/)
})

// ── Konfidenz ──────────────────────────────────────────────────────────────

test('confidence grows with the number of shots on the grinder', () => {
  const line = (n: number): [number, number][] =>
    Array.from({ length: n }, (_, i) => [12 + i * 0.5, 34 - i] as [number, number])

  const few = suggestGrind({ shots: series('g1', 'c1', line(3)), coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  const some = suggestGrind({ shots: series('g1', 'c1', line(6)), coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  const many = suggestGrind({ shots: series('g1', 'c1', line(14)), coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })

  expect(few.confidence).toBe('low')
  expect(some.confidence).toBe('medium')
  expect(many.confidence).toBe('high')
})

test('the message never contains NaN or undefined', () => {
  const cases: DialInShot[][] = [
    [],
    series('g1', 'c1', [[14, 28]]),
    series('g1', 'c1', [[14, 20], [14, 40]]), // gleiche x → keine Steigung
  ]
  for (const shots of cases) {
    const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
    expect(r.message).not.toMatch(/NaN|undefined|null/)
  }
})
