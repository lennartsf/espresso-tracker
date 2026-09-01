/**
 * Dial-in-Hilfe: aus aufgezeichneten Shots das Verhalten der Mühle lernen und
 * den nächsten Mahlgrad vorschlagen.
 *
 * **Das Modell.** Über den kleinen Bereich, in dem man dial-int, ist der
 * Zusammenhang zwischen Mahlgrad und Durchlaufzeit näherungsweise linear:
 * feiner ⇒ langsamer. Die Steigung dieser Geraden — Sekunden pro Klick — ist
 * das, was „diese Mühle" ausmacht, und sie ist über Bohnen hinweg
 * erstaunlich stabil. Was sich mit jeder neuen Tüte ändert, ist der *Offset*:
 * dieselbe Einstellung ergibt bei einer anderen Bohne eine andere Zeit.
 *
 * Daraus folgt die Aufteilung:
 * - **Steigung** aus allen Shots dieser Mühle (viele Datenpunkte, stabil).
 * - **Offset** aus den Shots dieser Bohne (wenige Punkte, aktuell).
 *
 * Genau das löst das Problem „neue Bohne, gleiche Mühle": man muss die
 * Mühlencharakteristik nicht neu lernen, nur den Startpunkt verschieben.
 *
 * **Was das Modell NICHT kennt** und was die Vorhersage verrauscht:
 * Bohnenalter (`roast_dates` gibt es), Dosis-Schwankung, Puck-Prep
 * (`used_wdt` etc.), Temperatur. Deshalb ist die Konfidenz Teil des
 * Ergebnisses und keine Zierde.
 */

export interface DialInShot {
  grind_setting: number | null
  brew_time_s: number | null
  coffee_id: string
  grinder_id: string | null
}

export type Confidence = 'none' | 'low' | 'medium' | 'high'

export interface DialInSuggestion {
  /** Vorgeschlagener Mahlgrad, oder `null` wenn zu wenig bekannt ist. */
  grind: number | null
  /** Sekunden pro Mahlgrad-Klick — das gelernte Mühlenverhalten. */
  secondsPerStep: number | null
  confidence: Confidence
  /** Wie viele Shots dieser Mühle in die Steigung eingeflossen sind. */
  grinderShots: number
  /** Wie viele Shots dieser Bohne den Offset bestimmt haben. */
  coffeeShots: number
  /** Klartext für die UI. Nie eine erfundene Zahl. */
  message: string
}

interface Point { x: number; y: number }

/** Steigung einer Ausgleichsgeraden. `null`, wenn alle x gleich sind — dann
 *  gibt es keine Steigung, nur eine senkrechte Wolke. */
export function slope(points: Point[]): number | null {
  if (points.length < 2) return null
  const n = points.length
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  let num = 0
  let den = 0
  for (const p of points) {
    num += (p.x - mx) * (p.y - my)
    den += (p.x - mx) ** 2
  }
  if (den === 0) return null
  return num / den
}

function usable(s: DialInShot): boolean {
  return (
    s.grind_setting != null && Number.isFinite(s.grind_setting) &&
    s.brew_time_s != null && Number.isFinite(s.brew_time_s) && s.brew_time_s > 0
  )
}

/** Fallback, wenn die eigene Mühle noch zu wenig hergibt.
 *  Grob: ein Klick feiner verlängert um ~1 s. Bewusst konservativ — lieber
 *  zwei kleine Schritte als einer, der über das Ziel schießt. */
const FALLBACK_SECONDS_PER_STEP = -1

/**
 * Schlägt den nächsten Mahlgrad vor, um `targetTime` zu treffen.
 *
 * `shots` sind ALLE Shots des Users; gefiltert wird hier, damit der Aufrufer
 * nicht zwei Listen jonglieren muss.
 */
export function suggestGrind({
  shots,
  coffeeId,
  grinderId,
  targetTime,
}: {
  shots: DialInShot[]
  coffeeId: string
  grinderId: string | null
  targetTime: number
}): DialInSuggestion {
  const valid = shots.filter(usable)

  // Steigung aus der Mühle: viele Punkte, über Bohnen hinweg stabil.
  const grinderShots = grinderId
    ? valid.filter(s => s.grinder_id === grinderId)
    : valid
  const learned = slope(grinderShots.map(s => ({ x: s.grind_setting!, y: s.brew_time_s! })))

  // Offset aus der Bohne: der jüngste Shot ist der beste Anker, weil die
  // Bohne mit dem Alter ausgast und ältere Shots nicht mehr gelten.
  const coffeeShots = grinderShots.filter(s => s.coffee_id === coffeeId)

  const base = {
    secondsPerStep: learned,
    grinderShots: grinderShots.length,
    coffeeShots: coffeeShots.length,
  }

  if (coffeeShots.length === 0) {
    return {
      ...base,
      grind: null,
      confidence: 'none',
      message: 'No shot with this coffee yet — start from the recipe and log one.',
    }
  }

  const last = coffeeShots[0]
  const currentGrind = last.grind_setting!
  const currentTime = last.brew_time_s!
  const gap = targetTime - currentTime

  // Eine sinnvolle Steigung ist negativ (feiner ⇒ langsamer, und die Skala
  // zählt aufwärts = gröber). Ist das Gelernte positiv oder ~0, taugt es
  // nicht — dann lieber der konservative Erfahrungswert als eine Zahl, die
  // in die falsche Richtung zeigt.
  const usableSlope = learned !== null && learned < -0.05 ? learned : FALLBACK_SECONDS_PER_STEP
  const step = gap / usableSlope
  const grind = Math.round((currentGrind + step) * 10) / 10

  // Konfidenz: die Steigung ist erst ab einer Handvoll Shots belastbar.
  let confidence: Confidence = 'low'
  if (learned !== null && learned < -0.05 && grinderShots.length >= 12) confidence = 'high'
  else if (learned !== null && learned < -0.05 && grinderShots.length >= 5) confidence = 'medium'

  if (Math.abs(gap) < 1) {
    return {
      ...base,
      grind: currentGrind,
      confidence,
      message: `Last shot hit ${currentTime}s — keep the grind where it is.`,
    }
  }

  const dir = step > 0 ? 'coarser' : 'finer'
  const guess = confidence === 'low'
    ? ' (rough guess — too few shots on this grinder yet)'
    : ''

  return {
    ...base,
    grind,
    confidence,
    message: `Last shot ran ${currentTime}s, target ${targetTime}s → go ${dir} to about ${grind}${guess}.`,
  }
}
