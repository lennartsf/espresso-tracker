import { suggestGrind, type DialInShot, type DialInSuggestion } from './dialIn'
import {
  suggestStartingGrind, type RoastPriorCoffee, type RoastPrior,
} from './roastPrior'

/**
 * Welcher Mahlgrad-Vorschlag gilt — die EINE Entscheidung für alle Aufrufer.
 *
 * Es gibt zwei Quellen, und sie schließen einander aus:
 *
 * - **Dial-in** (`suggestGrind`): braucht mindestens einen eigenen Shot dieser
 *   Bohne als Anker. Das ist der genaue Fall.
 * - **Röst-Prior** (`suggestStartingGrind`): springt genau dann ein, wenn es
 *   diesen Anker NICHT gibt. Er leitet den Startwert aus dem Röstgrad und den
 *   bereits eingestellten Bohnen ab — grob, aber besser als ein leeres Feld.
 *
 * **Warum als eigene Funktion.** Die Regel „Prior nur bei `confidence: 'none'`"
 * stand nur in NewShot. Der Analyse-Tab kannte sie nicht und zeigte bei einer
 * neuen Bohne schlicht „No shot with this coffee yet" — dieselbe Frage, zwei
 * verschiedene Antworten. Genau so war schon die Shot-Auswahl auseinander-
 * gelaufen (siehe `useDialInShots`). Eine Regel, die an zwei Stellen steht,
 * driftet.
 */
export interface GrindPlan {
  /** Der genaue Vorschlag aus eigenen Shots dieser Bohne, sonst `null`. */
  dialIn: DialInSuggestion | null
  /** Der Startwert für eine Bohne ohne eigene Shots, sonst `null`. */
  startPrior: RoastPrior | null
}

export function planGrind({
  shots,
  coffees,
  coffeeId,
  grinderId,
  basketId,
  targetTime,
}: {
  shots: DialInShot[]
  coffees: RoastPriorCoffee[]
  coffeeId: string
  grinderId: string | null
  basketId: string | null
  /** `null` heißt: es gibt kein Ziel, also auch nichts vorzuschlagen. */
  targetTime: number | null
}): GrindPlan {
  if (!coffeeId || targetTime == null) return { dialIn: null, startPrior: null }

  const dialIn = suggestGrind({ shots, coffeeId, grinderId, basketId, targetTime })
  if (dialIn.confidence !== 'none') return { dialIn, startPrior: null }

  const newCoffee = coffees.find(c => c.id === coffeeId)
  if (!newCoffee) return { dialIn, startPrior: null }

  // Der Prior bekommt bewusst DIESELBE Shot-Liste wie der Dial-in, ungefiltert
  // nach Sieb. Er kennt das Sieb nicht — er sucht je Bohne den Mahlgrad, der
  // die Zielzeit am besten getroffen hat, und braucht dafür jede Bohne, die
  // überhaupt eingestellt wurde. Nach Sieb zu filtern würde die meisten
  // Ankerbohnen wegnehmen und aus einer groben Schätzung eine leere machen.
  return { dialIn, startPrior: suggestStartingGrind({ shots, coffees, grinderId, targetTime, newCoffee }) }
}
