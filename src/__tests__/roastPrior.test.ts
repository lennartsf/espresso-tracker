import {
  suggestStartingGrind, bestGrindFor,
  type RoastPriorShot, type RoastPriorCoffee,
} from '../utils/roastPrior'

const bean = (id: string, roast: number | null): RoastPriorCoffee =>
  ({ id, roast_level_fine: roast, roast_level: null })

const shot = (coffee: string, grind: number, time: number): RoastPriorShot =>
  ({ coffee_id: coffee, grind_setting: grind, brew_time_s: time, grinder_id: 'g1' })

/** Ein typischer Bestand: dunkel und mittel gut eingestellt, hell fehlt —
 *  genau die Lage bei jemandem, der ueberwiegend dunkel/medium trinkt.
 *  Konvention: kleiner = feiner. Dunkler ⇒ groebere Zahl. */
const DARK_AND_MEDIUM = {
  coffees: [bean('c-dark', 8.5), bean('c-mid', 6.5), bean('c-mid2', 5.5)],
  shots: [
    shot('c-dark', 15.0, 28), shot('c-dark', 13.0, 36),
    shot('c-mid', 14.0, 28), shot('c-mid', 16.0, 22),
    shot('c-mid2', 13.5, 28), shot('c-mid2', 12.0, 35),
  ],
}

// ── bestGrindFor ───────────────────────────────────────────────────────────

test('the best grind is the shot closest to target, not the average', () => {
  // Der Mittelwert wuerde die Fehlversuche vom Einstellen mit einrechnen.
  const shots = [shot('c1', 12, 20), shot('c1', 14, 28), shot('c1', 18, 40)]
  expect(bestGrindFor(shots, 'c1', 28)).toBe(14)
})

test('no usable shot yields null', () => {
  expect(bestGrindFor([], 'c1', 28)).toBeNull()
  expect(bestGrindFor([{ coffee_id: 'c1', grind_setting: null, brew_time_s: 28, grinder_id: 'g1' }], 'c1', 28)).toBeNull()
})

// ── Richtung: die Fachregel ────────────────────────────────────────────────

test('a darker bean starts coarser, a lighter one finer', () => {
  // Hell braucht feiner (groessere Oberflaeche zur Extraktion) = kleinere Zahl.
  const darker = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 9.5),
  })
  const lighter = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 4.5),
  })
  expect(darker.grind!).toBeGreaterThan(lighter.grind!)
})

test('the learned step is positive — darker means a bigger number', () => {
  const r = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7),
  })
  expect(r.basis).toBe('learned')
  expect(r.grindPerRoastStep!).toBeGreaterThan(0)
})

test('data that claims lighter needs coarser is rejected as noise', () => {
  // Das widerspricht der Extraktion — solche Steigung kommt aus Rauschen.
  const coffees = [bean('a', 3), bean('b', 6), bean('c', 9)]
  const shots = [shot('a', 18, 28), shot('b', 15, 28), shot('c', 12, 28)] // falsch herum
  const r = suggestStartingGrind({ shots, coffees, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7) })
  expect(r.basis).toBe('rule')
  expect(r.grindPerRoastStep).toBeNull()
})

// ── Der Kern: Extrapolation muss gesagt werden ─────────────────────────────

test('a light roast is flagged as outside the covered range', () => {
  // Genau der reale Fall: ueberwiegend dunkel/medium getrunken, also keine
  // Erfahrung, wie sich die Muehle bei hellen Roestungen verhaelt.
  const r = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 2.5),
  })
  expect(r.extrapolating).toBe(true)
  expect(r.coverage).toEqual({ min: 5.5, max: 8.5 })
  expect(r.message).toMatch(/only cover roast 5\.5–8\.5/)
  expect(r.message).toMatch(/guess outside/)
})

test('a roast inside the covered range is not flagged', () => {
  const r = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7),
  })
  expect(r.extrapolating).toBe(false)
  expect(r.message).not.toMatch(/guess outside/)
})

test('the range boundaries themselves count as covered', () => {
  const r = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 8.5),
  })
  expect(r.extrapolating).toBe(false)
})

// ── Zu wenig Daten ─────────────────────────────────────────────────────────

test('no dialled-in coffee at all gives no number', () => {
  const r = suggestStartingGrind({
    shots: [], coffees: [], grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7),
  })
  expect(r.grind).toBeNull()
  expect(r.basis).toBe('none')
  expect(r.beans).toBe(0)
})

test('too few beans fall back to the rule instead of a fitted line', () => {
  const coffees = [bean('a', 6), bean('b', 8)]
  const shots = [shot('a', 14, 28), shot('b', 15, 28)]
  const r = suggestStartingGrind({ shots, coffees, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7) })
  expect(r.basis).toBe('rule')
  expect(r.message).toMatch(/general rule/)
})

test('a coffee without a roast level falls back to the average, and says so', () => {
  const r = suggestStartingGrind({
    ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', null),
  })
  expect(r.grind).not.toBeNull()
  expect(r.message).toMatch(/No roast level set/)
})

test('shots from another grinder never enter the prior', () => {
  const foreign = DARK_AND_MEDIUM.shots.map(s => ({ ...s, grinder_id: 'g2' }))
  const r = suggestStartingGrind({
    shots: foreign, coffees: DARK_AND_MEDIUM.coffees,
    grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7),
  })
  expect(r.beans).toBe(0)
  expect(r.grind).toBeNull()
})

test('the coffee being started is not used as its own evidence', () => {
  const coffees = [...DARK_AND_MEDIUM.coffees, bean('new', 7)]
  const shots = [...DARK_AND_MEDIUM.shots, shot('new', 99, 28)]
  const r = suggestStartingGrind({ shots, coffees, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', 7) })
  expect(r.beans).toBe(3)
  expect(r.grind!).toBeLessThan(20)
})

test('the message never contains NaN', () => {
  for (const roast of [null, 1, 5, 10]) {
    const r = suggestStartingGrind({
      ...DARK_AND_MEDIUM, grinderId: 'g1', targetTime: 28, newCoffee: bean('new', roast),
    })
    expect(r.message).not.toMatch(/NaN|undefined/)
  }
})
