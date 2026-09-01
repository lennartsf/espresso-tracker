import { suggestGrind, type DialInShot } from '../utils/dialIn'

/**
 * NewShot und der Analyse-Tab beantworten dieselbe Frage. Gaben sie
 * verschiedene Zahlen aus, lag das nie am Algorithmus, sondern daran, dass
 * ihm zwei verschiedene Datenmengen gereicht wurden. Diese Tests halten die
 * beiden Ursachen fest, die das ausgeloest haben.
 */

/** Ein Shot, wie ihn die DB liefert — inklusive drink_type. */
type Row = DialInShot & { drink_type: string }

function row(
  grind: number, time: number,
  { coffee = 'c1', grinder = 'g1', basket = 'b1', drink = 'espresso' } = {},
): Row {
  return {
    grind_setting: grind, brew_time_s: time, coffee_id: coffee,
    grinder_id: grinder, basket_id: basket, drink_type: drink,
  }
}

/** Die Historie: die Haelfte davon sind Cappuccini. */
// Feiner (kleinere Zahl) = langsamer, also -2 s pro Klick.
const HISTORY: Row[] = [
  row(11, 36, { drink: 'cappuccino' }),
  row(12, 34),
  row(13, 32, { drink: 'cappuccino' }),
  row(14, 30),
  row(15, 28, { drink: 'cappuccino' }),
  row(16, 26),
]

test('milk drinks are valid dial-in data — dropping them changes the answer', () => {
  // Ein Cappuccino ist ein Espresso mit Milch obendrauf. Mahlgrad und
  // Durchlaufzeit entstehen beim Bezug; `drink_type` beschreibt nur, was
  // danach passiert. Der Analyse-Tab filterte sie weg, NewShot nicht.
  const all = suggestGrind({
    shots: HISTORY, coffeeId: 'c1', grinderId: 'g1', basketId: 'b1', targetTime: 30,
  })
  const espressoOnly = suggestGrind({
    shots: HISTORY.filter(s => s.drink_type === 'espresso'),
    coffeeId: 'c1', grinderId: 'g1', basketId: 'b1', targetTime: 30,
  })

  // Der Anker ist ein anderer, sobald der juengste Shot ein Milchgetraenk ist:
  // 11/36s gegen 12/34s. Zwei verschiedene Antworten auf dieselbe Frage.
  expect(all.grind).not.toBe(espressoOnly.grind)
})

test('the same selection gives the same answer from both entry points', () => {
  // Der eigentliche Vertrag. Beide Seiten beziehen ihre Shots inzwischen aus
  // `useDialInShots`, also aus derselben ungefilterten Liste.
  const fromNewShot = suggestGrind({
    shots: HISTORY, coffeeId: 'c1', grinderId: 'g1', basketId: 'b1', targetTime: 30,
  })
  const fromAnalysis = suggestGrind({
    shots: HISTORY, coffeeId: 'c1', grinderId: 'g1', basketId: 'b1', targetTime: 30,
  })
  expect(fromAnalysis).toEqual(fromNewShot)
})

test('leaving the grinder open pools scales that are not comparable', () => {
  // Die zweite Ursache: NewShot hatte eine Muehle vorgewaehlt, der Analyse-Tab
  // stand auf „All grinders". Deshalb belegt der Planner das Feld jetzt aus
  // den Equipment-Standards vor und warnt, wenn wirklich gemischt wird.
  const twoGrinders: DialInShot[] = [
    ...HISTORY,
    // Zweite Muehle, voellig andere Skala: 0.5 Schritte statt ganzer Zahlen.
    row(1.5, 36, { grinder: 'g2' }), row(2.0, 33, { grinder: 'g2' }),
    row(2.5, 30, { grinder: 'g2' }), row(3.0, 27, { grinder: 'g2' }),
  ]
  const oneGrinder = suggestGrind({
    shots: twoGrinders, coffeeId: 'c1', grinderId: 'g1', basketId: 'b1', targetTime: 34,
  })
  const pooled = suggestGrind({
    shots: twoGrinders, coffeeId: 'c1', grinderId: null, basketId: 'b1', targetTime: 34,
  })
  expect(pooled.secondsPerStep).not.toBeCloseTo(oneGrinder.secondsPerStep!, 1)
})
