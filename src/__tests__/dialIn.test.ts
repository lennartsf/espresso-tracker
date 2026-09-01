import {
  slope, suggestGrind, learnGrinder, learnPerBasket, compareBaskets, type DialInShot,
} from '../utils/dialIn'

/** Synthetische Shot-Serie: feiner (kleinerer Wert) ⇒ langsamer. */
function series(
  grinderId: string,
  coffeeId: string,
  pairs: [grind: number, time: number][],
  basketId: string | null = 'b1',
): DialInShot[] {
  return pairs.map(([g, t]) => ({
    grind_setting: g, brew_time_s: t, coffee_id: coffeeId,
    grinder_id: grinderId, basket_id: basketId,
  }))
}

/** Saubere Gerade um einen Arbeitspunkt: time = t0 + perStep * (g - g0). */
function line(
  g0: number, t0: number, perStep: number, offsets: number[],
): [number, number][] {
  return offsets.map(d => [g0 + d, t0 + perStep * d])
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

// ── Der gemeldete Fehler ───────────────────────────────────────────────────

test('REGRESSION: a grind of 10.1 never turns into a suggestion of -3', () => {
  // Der gemeldete Fall. 45 Shots ueber neun Bohnen, jede mit eigenem
  // Arbeitspunkt. Gepoolt verwaessert das die Steigung gegen null, und die
  // alte Fassung teilte durch diese Fast-Null: aus 3 s Luecke wurden 15
  // Klicks und aus 10.1 ein Vorschlag von -3.
  const shots: DialInShot[] = []
  const beans = [
    [9.0, 24], [10.5, 27], [11.5, 23], [8.5, 30], [12.0, 26],
    [9.8, 29], [11.0, 25], [10.2, 31], [12.4, 28],
  ]
  beans.forEach(([g0, t0], i) => {
    shots.push(...series('g1', `bean-${i}`, line(g0, t0, -1.2, [-0.4, -0.2, 0, 0.2, 0.4])))
  })
  // Der juengste Shot der aktuellen Bohne: 10.1 und 25 s, Ziel 28 s.
  shots.unshift(...series('g1', 'current', [[10.1, 25]]))

  const r = suggestGrind({
    shots, coffeeId: 'current', grinderId: 'g1', basketId: 'b1', targetTime: 28,
  })

  expect(r.grind).not.toBeNull()
  // Kein negativer Mahlgrad, und ueberhaupt nichts ausserhalb dessen, was
  // diese Muehle je gesehen hat.
  expect(r.grind!).toBeGreaterThan(0)
  expect(r.grind!).toBeGreaterThan(7)
  expect(r.grind!).toBeLessThan(10.1)   // zu schnell → feiner
  expect(r.message).not.toMatch(/-\d/)
})

test('pooling across coffees would flatten the slope — fixed effects do not', () => {
  // Dieselben Daten wie oben, ohne die aktuelle Bohne. Die wahre Steigung ist
  // -1.2; eine Regression ueber alle Punkte zusammen findet sie nicht.
  const shots: DialInShot[] = []
  const beans = [[9.0, 24], [10.5, 27], [11.5, 23], [8.5, 30], [12.0, 26]]
  beans.forEach(([g0, t0], i) => {
    shots.push(...series('g1', `bean-${i}`, line(g0, t0, -1.2, [-0.5, -0.25, 0, 0.25, 0.5])))
  })

  const pooled = slope(shots.map(s => ({ x: s.grind_setting!, y: s.brew_time_s! })))!
  const model = learnGrinder(shots)

  expect(Math.abs(pooled)).toBeLessThan(1)        // verwaessert
  expect(model.basis).toBe('learned')
  expect(model.secondsPerStep).toBeCloseTo(-1.2, 1)  // wiederhergestellt
})

test('a suggestion never leaves the range the grinder has actually seen', () => {
  // Selbst bei einer absurd grossen Luecke bleibt der Vorschlag im Rahmen.
  const shots = series('g1', 'c1', line(14, 28, -2, [-2, -1, 0, 1, 2]))
  const r = suggestGrind({
    shots: [...series('g1', 'c1', [[14, 5]]), ...shots],
    coffeeId: 'c1', grinderId: 'g1', targetTime: 60,
  })
  expect(r.grind!).toBeGreaterThanOrEqual(11)
  expect(r.grind!).toBeLessThanOrEqual(19)
  expect(r.clamped).toBe(true)
  expect(r.message).toMatch(/Capped to the range/)
})

// ── Wann das Modell schweigt ───────────────────────────────────────────────

test('always grinding at the same setting teaches nothing', () => {
  // Ohne Variation im Mahlgrad gibt es keine Information darueber, was ein
  // Klick bewirkt — egal wie viele Shots es sind.
  const shots = series('g1', 'c1', Array.from({ length: 20 }, (_, i) =>
    [10 + (i % 2) * 0.1, 27 + (i % 3)] as [number, number]))
  const model = learnGrinder(shots)
  expect(model.basis).toBe('fallback')
  expect(model.rejected).toBe('no-spread')
})

test('shot times too noisy to read give a rough guess, not a precise one', () => {
  // Signal (ein Klick) kleiner als das Rauschen (Puck-Prep). Genau die Lage,
  // aus der die alte Fassung eine scharfe Zahl gemacht hat.
  const noise = [3.1, -2.8, 2.4, -3.3, 1.9, -2.1, 3.4, -1.7, 2.6, -3.0]
  const shots = series('g1', 'c1', noise.map((n, i) =>
    [10 + i * 0.1, 28 + n] as [number, number]))
  const model = learnGrinder(shots)
  expect(model.basis).toBe('fallback')
  expect(model.rejected).toBe('noisy')
})

test('a positive slope is rejected — finer must mean slower', () => {
  const shots = series('g1', 'c1', line(14, 28, +2, [-1.5, -0.5, 0.5, 1.5, 2]))
  const model = learnGrinder(shots)
  expect(model.basis).toBe('fallback')
  expect(model.rejected).toBe('wrong-sign')
})

test('too few shots is its own reason', () => {
  expect(learnGrinder(series('g1', 'c1', [[14, 30], [15, 28]])).rejected).toBe('too-few')
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
    { grind_setting: null, brew_time_s: 30, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
    { grind_setting: 14, brew_time_s: null, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
    { grind_setting: 14, brew_time_s: 0, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(r.coffeeShots).toBe(0)
  expect(r.grind).toBeNull()
})

// ── Das gelernte Muehlenverhalten ──────────────────────────────────────────

test('the slope is learned across coffees, not just the current one', () => {
  // Der Kern: die Muehlencharakteristik kommt aus ALLEN Bohnen, damit eine
  // neue Tuete sie nicht neu lernen muss.
  const shots = [
    ...series('g1', 'bean-b', [[13, 32]]),
    ...series('g1', 'bean-a', line(14, 30, -2, [-2, -1, 0, 1, 2])),
  ]
  const r = suggestGrind({ shots, coffeeId: 'bean-b', grinderId: 'g1', targetTime: 29 })
  expect(r.secondsPerStep).toBeCloseTo(-2, 1)
  expect(r.coffeeShots).toBe(1)
})

test('shots from a different grinder do not pollute the slope', () => {
  // Mahlgradzahlen sind zwischen Muehlen nicht vergleichbar.
  const shots = [
    ...series('g1', 'c1', line(14, 30, -2, [-2, -1, 0, 1, 2])),
    ...series('g2', 'c1', [[1, 20], [9, 40], [3, 22], [7, 38]]), // ganz andere Skala
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 30 })
  expect(r.secondsPerStep).toBeCloseTo(-2, 1)
  expect(r.grinderShots).toBe(5)
})

// ── Das Sieb ───────────────────────────────────────────────────────────────

test('the anchor prefers a shot from the same basket', () => {
  // Ein anderer Korb verschiebt die Zeit wie eine andere Bohne. Der juengste
  // Shot ist hier der mit dem FALSCHEN Sieb — der Anker muss trotzdem der
  // passende sein.
  const shots = [
    ...series('g1', 'c1', [[9, 20]], 'other-basket'),
    ...series('g1', 'c1', line(14, 28, -2, [-2, -1, 0, 1, 2]), 'b1'),
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', basketId: 'b1', targetTime: 30 })
  expect(r.sameBasket).toBe(true)
  // Anker ist [12, 32] (erster b1-Shot), nicht [9, 20].
  expect(r.grind!).toBeGreaterThan(9)
})

test('using a basket you have no history with is called out', () => {
  const shots = series('g1', 'c1', line(14, 28, -2, [-2, -1, 0, 1, 2]), 'b1')
  const r = suggestGrind({
    shots, coffeeId: 'c1', grinderId: 'g1', basketId: 'brand-new', targetTime: 31,
  })
  expect(r.sameBasket).toBe(false)
  expect(r.message).toMatch(/different basket/)
})

test('the basket separates the groups when the slope is learned', () => {
  // Gleiche Bohne, zwei Siebe mit deutlich verschiedenem Offset. Ohne das Sieb
  // im Gruppenschluessel wuerde derselbe Verwaesserungseffekt auftreten wie
  // bei den Bohnen.
  const shots = [
    ...series('g1', 'c1', line(14, 26, -2, [-1, -0.5, 0, 0.5, 1]), 'b1'),
    ...series('g1', 'c1', line(14, 36, -2, [-1, -0.5, 0, 0.5, 1]), 'b2'),
  ]
  expect(learnGrinder(shots).secondsPerStep).toBeCloseTo(-2, 1)
})

// ── Die Richtung muss stimmen ──────────────────────────────────────────────

test('too fast means go finer, too slow means go coarser', () => {
  const base = line(14, 30, -2, [-2, -1, 0, 1, 2])
  const fast = suggestGrind({
    shots: [...series('g1', 'c1', [[15, 22]]), ...series('g1', 'c1', base)],
    coffeeId: 'c1', grinderId: 'g1', targetTime: 28,
  })
  expect(fast.grind!).toBeLessThan(15)
  expect(fast.message).toMatch(/finer/)

  const slow = suggestGrind({
    shots: [...series('g1', 'c1', [[13, 36]]), ...series('g1', 'c1', base)],
    coffeeId: 'c1', grinderId: 'g1', targetTime: 28,
  })
  expect(slow.grind!).toBeGreaterThan(13)
  expect(slow.message).toMatch(/coarser/)
})

test('a shot already on target leaves the grind alone', () => {
  const shots = [
    ...series('g1', 'c1', [[14, 28]]),
    ...series('g1', 'c1', line(14, 30, -2, [-2, -1, 1, 2])),
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
  expect(r.grind).toBe(14)
  expect(r.message).toMatch(/keep the grind/)
})

test('the suggested step size follows the learned slope', () => {
  // Bei -2 s/Klick braucht eine Luecke von 4 s zwei Klicks.
  const shots = [
    ...series('g1', 'c1', [[14, 26]]),
    ...series('g1', 'c1', line(14, 30, -2, [-2, -1, 0, 1, 2])),
  ]
  const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 30 })
  expect(r.secondsPerStep).toBeCloseTo(-2, 1)
  expect(r.grind).toBeCloseTo(12, 1)
})

// ── Konfidenz ──────────────────────────────────────────────────────────────

test('confidence reflects the model, not the raw shot count', () => {
  // 20 Shots ohne Variation sagen weniger als 12 mit. Vorher haing die
  // Konfidenz an der blossen Anzahl — und stand deshalb auf "high", waehrend
  // der Vorschlag Unsinn war.
  const flat = suggestGrind({
    shots: series('g1', 'c1', Array.from({ length: 20 }, (_, i) =>
      [10, 26 + (i % 3)] as [number, number])),
    coffeeId: 'c1', grinderId: 'g1', targetTime: 30,
  })
  expect(flat.confidence).toBe('low')

  const varied = suggestGrind({
    shots: series('g1', 'c1', line(14, 30, -2,
      [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3, 3.5])),
    coffeeId: 'c1', grinderId: 'g1', targetTime: 26,
  })
  expect(varied.confidence).toBe('high')
})

test('the message never contains NaN or undefined', () => {
  const cases: DialInShot[][] = [
    [],
    series('g1', 'c1', [[14, 28]]),
    series('g1', 'c1', [[14, 20], [14, 40]]), // gleiche x → keine Steigung
    series('g1', 'c1', line(14, 30, -2, [-2, -1, 0, 1, 2])),
  ]
  for (const shots of cases) {
    const r = suggestGrind({ shots, coffeeId: 'c1', grinderId: 'g1', targetTime: 28 })
    expect(r.message).not.toMatch(/NaN|undefined|null/)
  }
})

// ── Was das Sieb ausmacht ──────────────────────────────────────────────────

test('a basket effect is only measured within the same coffee', () => {
  // Sieb b2 laeuft bei GLEICHER Bohne 4 s laenger als b1.
  const shots = [
    ...series('g1', 'c1', line(14, 28, -2, [-1, 0, 1]), 'b1'),
    ...series('g1', 'c1', line(14, 32, -2, [-1, 0, 1]), 'b2'),
  ]
  const [fast, slow] = compareBaskets(shots, () => -2)
  expect(fast.basketId).toBe('b1')
  expect(slow.basketId).toBe('b2')
  expect(slow.offsetS - fast.offsetS).toBeCloseTo(4, 1)
})

test('a basket used for only one coffee is not reported', () => {
  // Sonst misst man die Bohne und nennt es Sieb.
  const shots = [
    ...series('g1', 'c1', line(14, 28, -2, [-1, 0, 1]), 'b1'),
    ...series('g1', 'c2', line(14, 40, -2, [-1, 0, 1]), 'b2'),
  ]
  expect(compareBaskets(shots, () => -2)).toHaveLength(0)
})

test('the basket effect is corrected for grind before comparing', () => {
  // Im grossen Sieb wurde durchgehend groeber gemahlen. Ohne Bereinigung
  // wuerde dieser Mahlgradunterschied als Siebeffekt gezaehlt.
  const shots = [
    ...series('g1', 'c1', [[13, 30], [13.5, 29], [14, 28]], 'b1'),
    // Selbes Verhalten, nur 2 Klicks groeber gezogen: -2 s/Klick => 4 s kuerzer
    ...series('g1', 'c1', [[15, 26], [15.5, 25], [16, 24]], 'b2'),
  ]
  const effects = compareBaskets(shots, () => -2)
  const spread = Math.abs(effects[0].offsetS - effects[1].offsetS)
  expect(spread).toBeLessThan(0.5)   // kein Siebeffekt, nur Mahlgrad
})

test('the basket effect is also given in grind steps', () => {
  const shots = [
    ...series('g1', 'c1', line(14, 28, -2, [-1, 0, 1]), 'b1'),
    ...series('g1', 'c1', line(14, 32, -2, [-1, 0, 1]), 'b2'),
  ]
  const [fast, slow] = compareBaskets(shots, () => -2)
  // 4 s Unterschied bei 2 s pro Klick = 2 Klicks.
  expect(slow.offsetSteps! - fast.offsetSteps!).toBeCloseTo(2, 1)
})

test('without a learned slope there are no step numbers, only seconds', () => {
  const shots = [
    ...series('g1', 'c1', line(14, 28, -2, [-1, 0, 1]), 'b1'),
    ...series('g1', 'c1', line(14, 32, -2, [-1, 0, 1]), 'b2'),
  ]
  expect(compareBaskets(shots, () => null)[0].offsetSteps).toBeNull()
})

// ── Das Sieb aendert nicht nur den Offset, sondern die Steigung ────────────

/** Zwei Siebe mit unterschiedlichem Durchfluss, gleiche Bohnen. */
function twoBaskets(): DialInShot[] {
  const out: DialInShot[] = []
  const beans: [number, number][] = [[10, 26], [11, 29], [12, 25], [10.5, 31]]
  beans.forEach(([g0, t0], i) => {
    // Enger Korb: steil. Offener Korb: traege.
    out.push(...series('g1', `bean-${i}`, line(g0, t0, -1.6, [-2, -1, 0, 1, 2]), 'tight'))
    out.push(...series('g1', `bean-${i}`, line(g0, t0 + 3, -0.7, [-2, -1, 0, 1, 2]), 'open'))
  })
  return out
}

test('the slope is learned per basket, not pooled across them', () => {
  const shots = twoBaskets()
  // Gepoolt kaeme ein Mittelwert heraus, der zu keinem der beiden Koerbe passt.
  const pooled = learnGrinder(shots).secondsPerStep!
  expect(pooled).toBeGreaterThan(-1.6)
  expect(pooled).toBeLessThan(-0.7)

  expect(learnGrinder(shots, 'tight').secondsPerStep).toBeCloseTo(-1.6, 1)
  expect(learnGrinder(shots, 'open').secondsPerStep).toBeCloseTo(-0.7, 1)
})

test('a per-basket model says which basket it came from', () => {
  const m = learnGrinder(twoBaskets(), 'tight')
  expect(m.scope).toBe('basket')
  expect(m.basketId).toBe('tight')
})

test('the suggestion differs between baskets for the same gap', () => {
  // Derselbe Rueckstand, aber der traege Korb braucht mehr Klicks. Genau das
  // ging verloren, solange eine gemeinsame Steigung benutzt wurde.
  const shots = twoBaskets()
  const anchorTight = series('g1', 'c-new', [[11, 26]], 'tight')
  const anchorOpen = series('g1', 'c-new', [[11, 26]], 'open')

  const tight = suggestGrind({
    shots: [...anchorTight, ...shots], coffeeId: 'c-new',
    grinderId: 'g1', basketId: 'tight', targetTime: 28,
  })
  const open = suggestGrind({
    shots: [...anchorOpen, ...shots], coffeeId: 'c-new',
    grinderId: 'g1', basketId: 'open', targetTime: 28,
  })
  // 2 s Rueckstand: der steile Korb braucht ~1.25 Klicks, der traege ~2.9.
  expect(tight.grind!).toBeCloseTo(9.8, 1)
  expect(open.grind!).toBeCloseTo(8.1, 1)
  expect(open.grind!).toBeLessThan(tight.grind!)
})

test('too little data in the chosen basket falls back — and says so', () => {
  const shots = [
    ...series('g1', 'c1', line(14, 28, -2, [-2, -1, 0, 1, 2]), 'b1'),
    ...series('g1', 'c1', line(14, 33, -2, [-2, -1, 0, 1, 2]), 'b2'),
    // Neuer Korb, ein einziger Shot — daraus ist keine Steigung zu lernen.
    ...series('g1', 'c1', [[14, 31]], 'brand-new'),
  ]
  const m = learnGrinder(shots, 'brand-new')
  expect(m.basis).toBe('learned')       // die gepoolte Schaetzung traegt
  expect(m.scope).toBe('all-baskets')   // aber sie ist als gepoolt markiert

  const r = suggestGrind({
    shots, coffeeId: 'c1', grinderId: 'g1', basketId: 'brand-new', targetTime: 35,
  })
  // Eine gepoolte Steigung darf sich nicht als Kennzahl dieses Siebs ausgeben.
  expect(r.message).toMatch(/averaged over all your baskets/)
})

test('a fully learned basket model does not claim to be pooled', () => {
  const r = suggestGrind({
    shots: [...series('g1', 'c-new', [[11, 26]], 'tight'), ...twoBaskets()],
    coffeeId: 'c-new', grinderId: 'g1', basketId: 'tight', targetTime: 30,
  })
  expect(r.model.scope).toBe('basket')
  expect(r.message).not.toMatch(/averaged over all your baskets/)
})

test('learnPerBasket reports every basket, including the ones it could not learn', () => {
  const shots = [
    ...twoBaskets(),
    ...series('g1', 'c1', [[14, 31]], 'brand-new'),
  ]
  const models = learnPerBasket(shots)
  expect(models.map(m => m.basketId).sort()).toEqual(['brand-new', 'open', 'tight'])
  // „Zu wenig Daten" ist auch eine Auskunft und darf nicht einfach fehlen.
  const thin = models.find(m => m.basketId === 'brand-new')!
  expect(thin.basis).toBe('fallback')
  expect(thin.rejected).toBe('too-few')
})

test('the basket offset is corrected with each basket own slope', () => {
  // Beide Koerbe laufen bei gleichem Mahlgrad gleich lang, aber sie wurden auf
  // verschiedenen Mahlgraden gezogen UND reagieren unterschiedlich stark.
  // Mit EINER gemeinsamen Steigung bliebe ein Rest stehen und wuerde als
  // Siebeffekt gezaehlt.
  const shots = [
    ...series('g1', 'c1', [[13, 28 + 1.6], [14, 28], [15, 28 - 1.6]], 'tight'),
    ...series('g1', 'c1', [[13, 28 + 0.7], [14, 28], [15, 28 - 0.7]], 'open'),
  ]
  const slopeFor = (id: string) => (id === 'tight' ? -1.6 : -0.7)
  const effects = compareBaskets(shots, slopeFor)
  const spread = Math.abs(effects[0].offsetS - effects[1].offsetS)
  expect(spread).toBeLessThan(0.2)
})
