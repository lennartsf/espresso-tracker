import { slope } from './dialIn'

/**
 * Startwert für eine Bohne, mit der noch kein Shot gezogen wurde.
 *
 * `suggestGrind` kann für eine neue Tüte nichts sagen — ihm fehlt der Offset.
 * Genau da setzt das hier an: es lernt aus **deinen** Shots, wie der Röstgrad
 * den brauchbaren Mahlgrad verschiebt, und sagt damit einen Startpunkt voraus.
 *
 * ## Richtungskonvention
 * Auf der Mühlenskala ist **kleiner = feiner**. Fachlich gilt:
 * - **Hell geröstet braucht feiner** — die Bohne ist dichter und weniger
 *   löslich, man braucht die größere Oberfläche, um überhaupt genug zu
 *   extrahieren. Also *kleinere* Zahl.
 * - **Dunkel geröstet kommt gröber aus** — poröser, löslicher, ohnehin
 *   intensiver; zu fein gemahlen wird es schnell bitter. Also *größere* Zahl.
 *
 * Erwartete Steigung von `grind ~ roast` ist damit **positiv**.
 *
 * ## Warum trotzdem gelernt statt fest verdrahtet
 * Die Regel gibt die Richtung vor, nicht den Betrag — wie *stark* der Röstgrad
 * bei einer konkreten Mühle durchschlägt, weiß nur die Mühle. Deshalb wird die
 * Steigung aus den eigenen Daten geschätzt und die Fachregel nur benutzt, um
 * ein widersinniges Ergebnis zu erkennen.
 *
 * ## Der Punkt, auf den es hier wirklich ankommt
 * Wer überwiegend dunkel und mittel trinkt, hat **keine Daten über helle
 * Röstungen**. Eine Vorhersage dorthin ist Extrapolation, und das muss die
 * Ausgabe sagen — sonst klingt eine geratene Zahl wie eine gemessene. Deshalb
 * meldet das Ergebnis immer mit, welchen Röstbereich die Daten abdecken und ob
 * die neue Bohne darin liegt.
 */

export interface RoastPriorShot {
  grind_setting: number | null
  brew_time_s: number | null
  coffee_id: string
  grinder_id: string | null
}

/** Nur was der Prior braucht — hält ihn testbar ohne die volle Coffee-Form. */
export interface RoastPriorCoffee {
  id: string
  roast_level_fine: number | null
  roast_level: number | null
}

export type PriorBasis = 'learned' | 'rule' | 'none'

export interface RoastPrior {
  /** Vorgeschlagener Startwert, `null` wenn nicht einmal ein Anker existiert. */
  grind: number | null
  basis: PriorBasis
  /** Mahlgrad-Schritte pro Röstgrad-Stufe. Nur bei `basis: 'learned'`. */
  grindPerRoastStep: number | null
  /** Röstbereich, den die eigenen Shots abdecken. */
  coverage: { min: number; max: number } | null
  /** Liegt die neue Bohne außerhalb dieses Bereichs? */
  extrapolating: boolean
  /** Wie viele Bohnen mit Röstgrad und Shots eingeflossen sind. */
  beans: number
  message: string
}

/** Fachlich erwartete Richtung: dunkler ⇒ gröber ⇒ größere Zahl. */
const EXPECTED_SIGN = 1

/** Konservativer Betrag, wenn die eigenen Daten die Steigung nicht hergeben.
 *  Bewusst klein: lieber zu nah am Bekannten starten als daneben. */
const FALLBACK_GRIND_PER_ROAST = 0.4

const roastOf = (c: RoastPriorCoffee): number | null =>
  c.roast_level_fine ?? c.roast_level

/**
 * Der Mahlgrad, der bei dieser Bohne am besten getroffen hat.
 *
 * „Am besten" heißt: der Shot mit der kleinsten Abweichung zur Zielzeit. Den
 * Mittelwert aller Shots zu nehmen wäre falsch — darin stecken auch die
 * Fehlversuche vom Einstellen.
 */
export function bestGrindFor(
  shots: RoastPriorShot[],
  coffeeId: string,
  targetTime: number,
): number | null {
  const usable = shots.filter(
    s => s.coffee_id === coffeeId &&
      s.grind_setting != null && Number.isFinite(s.grind_setting) &&
      s.brew_time_s != null && s.brew_time_s > 0,
  )
  if (usable.length === 0) return null
  let best = usable[0]
  for (const s of usable) {
    if (Math.abs(s.brew_time_s! - targetTime) < Math.abs(best.brew_time_s! - targetTime)) best = s
  }
  return best.grind_setting
}

export function suggestStartingGrind({
  shots,
  coffees,
  grinderId,
  targetTime,
  newCoffee,
}: {
  shots: RoastPriorShot[]
  coffees: RoastPriorCoffee[]
  grinderId: string | null
  targetTime: number
  newCoffee: RoastPriorCoffee
}): RoastPrior {
  const onGrinder = grinderId ? shots.filter(s => s.grinder_id === grinderId) : shots

  // Ein Punkt je Bohne: Röstgrad → bester Mahlgrad. Bohnen ohne Röstgrad
  // fallen raus, sie tragen zu dieser Frage nichts bei.
  const points: { x: number; y: number }[] = []
  for (const c of coffees) {
    if (c.id === newCoffee.id) continue
    const roast = roastOf(c)
    if (roast == null) continue
    const grind = bestGrindFor(onGrinder, c.id, targetTime)
    if (grind == null) continue
    points.push({ x: roast, y: grind })
  }

  const empty: RoastPrior = {
    grind: null, basis: 'none', grindPerRoastStep: null,
    coverage: null, extrapolating: false, beans: 0,
    message: 'Not enough dialled-in coffees yet to guess a starting point.',
  }
  if (points.length === 0) return empty

  const coverage = {
    min: Math.min(...points.map(p => p.x)),
    max: Math.max(...points.map(p => p.x)),
  }
  const beans = points.length
  const targetRoast = roastOf(newCoffee)

  if (targetRoast == null) {
    // Ohne Röstgrad an der neuen Bohne bleibt nur der Durchschnitt der
    // bisherigen Startwerte — ehrlicher als eine Rechnung mit erfundenem x.
    const mean = points.reduce((s, p) => s + p.y, 0) / beans
    return {
      grind: Math.round(mean * 10) / 10,
      basis: 'none', grindPerRoastStep: null, coverage, extrapolating: false, beans,
      message: `No roast level set for this coffee — starting from your average of ${Math.round(mean * 10) / 10}.`,
    }
  }

  const extrapolating = targetRoast < coverage.min || targetRoast > coverage.max
  const learned = slope(points)

  // Die Fachregel prüft das Vorzeichen, nicht den Betrag: eine gelernte
  // Steigung, die "heller ⇒ gröber" behauptet, widerspricht der Extraktion
  // und kommt aus Rauschen, nicht aus der Mühle.
  const learnedUsable =
    learned !== null && beans >= 3 && Math.sign(learned) === EXPECTED_SIGN

  const perStep = learnedUsable ? learned! : FALLBACK_GRIND_PER_ROAST
  const basis: PriorBasis = learnedUsable ? 'learned' : 'rule'

  // Anker ist die Bohne mit dem nächstliegenden Röstgrad — von dort aus wird
  // korrigiert. Das hält den Fehler klein, auch wenn die Steigung grob ist.
  const anchor = points.reduce((a, p) =>
    Math.abs(p.x - targetRoast) < Math.abs(a.x - targetRoast) ? p : a)
  const grind = Math.round((anchor.y + (targetRoast - anchor.x) * perStep) * 10) / 10

  const direction = targetRoast > anchor.x ? 'coarser' : 'finer'
  const parts: string[] = []
  parts.push(`Closest bean you know sits at roast ${anchor.x.toFixed(1)} on ${anchor.y}.`)
  if (Math.abs(targetRoast - anchor.x) >= 0.3) {
    parts.push(`This one is ${targetRoast > anchor.x ? 'darker' : 'lighter'}, so start a bit ${direction}: ${grind}.`)
  } else {
    parts.push(`This one is about the same roast — start at ${grind}.`)
  }
  if (extrapolating) {
    // Der wichtigste Satz der ganzen Ausgabe.
    parts.push(
      `Careful: your shots only cover roast ${coverage.min.toFixed(1)}–${coverage.max.toFixed(1)}, so this is a guess outside what your grinder has shown.`,
    )
  }
  if (basis === 'rule') {
    parts.push('Based on the general rule (lighter needs finer), not yet on your own data.')
  }

  return {
    grind,
    basis,
    grindPerRoastStep: learnedUsable ? Math.round(learned! * 100) / 100 : null,
    coverage,
    extrapolating,
    beans,
    message: parts.join(' '),
  }
}
