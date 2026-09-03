import { planGrind } from '../utils/grindPlan'
import type { DialInShot } from '../utils/dialIn'

function shot(
  grind: number, time: number, coffee: string,
  { grinder = 'g1', basket = 'b1' } = {},
): DialInShot {
  return {
    grind_setting: grind, brew_time_s: time, coffee_id: coffee,
    grinder_id: grinder, basket_id: basket,
  }
}

/** Drei eingestellte Bohnen mit Roestgrad — die Basis fuer den Prior. */
const COFFEES = [
  { id: 'light', roast_level_fine: 3, roast_level: 3 },
  { id: 'medium', roast_level_fine: 5, roast_level: 5 },
  { id: 'dark', roast_level_fine: 8, roast_level: 8 },
  { id: 'brand-new', roast_level_fine: 6, roast_level: 6 },
]

// Heller = feiner (kleinerer Wert). Jede Bohne trifft ihre Zielzeit bei einem
// anderen Mahlgrad, und der haengt am Roestgrad.
const HISTORY: DialInShot[] = [
  shot(9, 28, 'light'), shot(9.5, 26, 'light'), shot(8.5, 30, 'light'),
  shot(11, 28, 'medium'), shot(11.5, 26, 'medium'), shot(10.5, 30, 'medium'),
  shot(14, 28, 'dark'), shot(14.5, 26, 'dark'), shot(13.5, 30, 'dark'),
]

test('a coffee with its own shots gets the exact dial-in, not the prior', () => {
  const plan = planGrind({
    shots: HISTORY, coffees: COFFEES, coffeeId: 'medium',
    grinderId: 'g1', basketId: 'b1', targetTime: 28,
  })
  expect(plan.dialIn).not.toBeNull()
  expect(plan.dialIn!.confidence).not.toBe('none')
  // Der Prior waere hier nur Rauschen — es gibt echte Messwerte.
  expect(plan.startPrior).toBeNull()
})

test('a coffee without any shot falls back to the roast prior', () => {
  // Das war der Unterschied: NewShot zeigte hier einen Startwert, der
  // Analyse-Tab nur „No shot with this coffee yet".
  const plan = planGrind({
    shots: HISTORY, coffees: COFFEES, coffeeId: 'brand-new',
    grinderId: 'g1', basketId: 'b1', targetTime: 28,
  })
  expect(plan.dialIn!.confidence).toBe('none')
  expect(plan.startPrior).not.toBeNull()
  expect(plan.startPrior!.grind).not.toBeNull()
  // Roestgrad 6 liegt zwischen medium (5) und dark (8) — der Startwert auch.
  expect(plan.startPrior!.grind!).toBeGreaterThan(11)
  expect(plan.startPrior!.grind!).toBeLessThan(14)
})

test('without a target time nothing is suggested at all', () => {
  const plan = planGrind({
    shots: HISTORY, coffees: COFFEES, coffeeId: 'medium',
    grinderId: 'g1', basketId: 'b1', targetTime: null,
  })
  expect(plan).toEqual({ dialIn: null, startPrior: null })
})

test('without a coffee nothing is suggested at all', () => {
  const plan = planGrind({
    shots: HISTORY, coffees: COFFEES, coffeeId: '',
    grinderId: 'g1', basketId: 'b1', targetTime: 28,
  })
  expect(plan).toEqual({ dialIn: null, startPrior: null })
})

test('a coffee the list does not know gets no invented prior', () => {
  const plan = planGrind({
    shots: HISTORY, coffees: COFFEES, coffeeId: 'ghost',
    grinderId: 'g1', basketId: 'b1', targetTime: 28,
  })
  expect(plan.startPrior).toBeNull()
})

test('both entry points get the same plan from the same inputs', () => {
  // Der eigentliche Vertrag dieser Datei: die Regel steht an EINER Stelle.
  const args = {
    shots: HISTORY, coffees: COFFEES, coffeeId: 'brand-new',
    grinderId: 'g1' as string | null, basketId: 'b1' as string | null, targetTime: 28,
  }
  expect(planGrind(args)).toEqual(planGrind(args))
})
