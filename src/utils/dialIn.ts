/**
 * Dial-in-Hilfe: aus aufgezeichneten Shots das Verhalten der Mühle lernen und
 * den nächsten Mahlgrad vorschlagen.
 *
 * ## Das Modell
 *
 * Über den kleinen Bereich, in dem man dial-int, ist der Zusammenhang zwischen
 * Mahlgrad und Durchlaufzeit näherungsweise linear: feiner ⇒ langsamer. Auf
 * dieser Skala zählt „feiner" ABWÄRTS (kleinere Zahl = feiner), die Steigung
 * ist also negativ. Sekunden pro Klick ist das, was „diese Mühle" ausmacht.
 *
 * Was sich mit jeder Tüte ändert, ist der *Offset*: dieselbe Einstellung ergibt
 * bei einer anderen Bohne eine andere Zeit. Dasselbe gilt fürs Sieb — ein
 * anderer Korb hat andere Lochung und andere Nenndosis und verschiebt die
 * Zeit spürbar, ohne dass sich an der Mühle etwas geändert hätte.
 *
 * Daraus folgt: **Steigung** aus allen Shots dieser Mühle, **Offset** aus den
 * Shots dieser Bohne in diesem Sieb.
 *
 * ## Warum die erste Fassung Unsinn ausgab
 *
 * Sie hat die Steigung über ALLE Shots der Mühle in einer einzigen Regression
 * geschätzt — quer über die Bohnen. Jede Bohne bringt aber ihren eigenen
 * Offset mit, und die Offsets streuen stärker als das, was ein Klick ausmacht.
 * Die Regression sieht dann vor allem die Streuung ZWISCHEN den Bohnen und
 * verwässert die Steigung gegen null. Gemessen an echten Daten: eine wahre
 * Steigung von −1.2 s/Klick kam als −0.2 heraus.
 *
 * Der zweite Fehler war fatal: durch diese fast-null wurde geteilt. Aus
 * 3 s Lücke ÷ (−0.2) wurden −15 Klicks, und aus Mahlgrad 10.1 wurde ein
 * Vorschlag von −3 — eine Zahl, die es auf keiner Mühle gibt.
 *
 * ## Was jetzt anders ist
 *
 * 1. **Fixed Effects statt Pooling.** Jede (Bohne, Sieb)-Gruppe wird auf ihren
 *    eigenen Mittelwert zentriert, erst dann wird gemeinsam geschätzt. Damit
 *    fällt der Offset heraus und übrig bleibt der Effekt des Klickens.
 * 2. **Die Schätzung muss etwas taugen.** Geprüft wird die Spannweite der
 *    Mahlgrade und der Standardfehler der Steigung. Wer immer auf demselben
 *    Wert mahlt, hat keine Information darüber geliefert, was ein Klick tut —
 *    und bekommt dann auch keine erfundene Zahl.
 * 3. **Es wird nie durch eine kleine Zahl geteilt.** Die Steigung wird in ein
 *    plausibles Band gezwungen, der Schritt begrenzt, und das Ergebnis auf den
 *    Bereich zurückgeholt, den der Nutzer auf dieser Mühle je benutzt hat.
 *
 * **Was das Modell weiter nicht kennt:** Bohnenalter, Dosis-Schwankung,
 * Puck-Prep, Temperatur. Deshalb ist die Konfidenz Teil des Ergebnisses.
 */

export interface DialInShot {
  grind_setting: number | null
  brew_time_s: number | null
  coffee_id: string
  grinder_id: string | null
  /** Das Sieb verschiebt die Zeit wie eine andere Bohne — es gehört in den
   *  Gruppenschlüssel, nicht ins Rauschen. */
  basket_id: string | null
}

export type Confidence = 'none' | 'low' | 'medium' | 'high'

export interface GrinderModel {
  /** Sekunden pro Mahlgrad-Klick. Negativ: feiner (kleinere Zahl) = langsamer. */
  secondsPerStep: number | null
  /** Wurde die Steigung gelernt oder ist es der Erfahrungswert? */
  basis: 'learned' | 'fallback'
  /** Punkte, die in die Schätzung eingegangen sind. */
  points: number
  /** Warum die gelernte Steigung verworfen wurde, falls sie es wurde. */
  rejected: 'too-few' | 'no-spread' | 'noisy' | 'wrong-sign' | 'implausible' | null
  /** Der Mahlgradbereich, den diese Mühle je gesehen hat. */
  range: { min: number; max: number } | null
}

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
  /** Stützt sich der Offset auf dasselbe Sieb? Sonst ist er ungenauer. */
  sameBasket: boolean
  /** Wurde der Vorschlag auf den benutzten Bereich zurückgeholt? */
  clamped: boolean
  /** Klartext für die UI. Nie eine erfundene Zahl. */
  message: string
  /** Das gelernte Mühlenmodell — auch für die Erklärung in der Analyse. */
  model: GrinderModel
}

interface Point { x: number; y: number }

/** Steigung einer Ausgleichsgeraden. `null`, wenn alle x gleich sind — dann
 *  gibt es keine Steigung, nur eine senkrechte Wolke. */
export function slope(points: Point[]): number | null {
  return fit(points)?.slope ?? null
}

/** Steigung samt Standardfehler. Der Standardfehler ist der Punkt: ohne ihn
 *  lässt sich „−0.2 aus verrauschten Daten" nicht von „−0.2, sauber gemessen"
 *  unterscheiden — und nur im zweiten Fall darf man damit rechnen. */
function fit(points: Point[]): { slope: number; stdErr: number } | null {
  const n = points.length
  if (n < 2) return null
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  let sxy = 0
  let sxx = 0
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my)
    sxx += (p.x - mx) ** 2
  }
  if (sxx === 0) return null
  const slope = sxy / sxx
  if (n < 3) return { slope, stdErr: Infinity }

  const intercept = my - slope * mx
  let sse = 0
  for (const p of points) sse += (p.y - (slope * p.x + intercept)) ** 2
  const stdErr = Math.sqrt(sse / (n - 2) / sxx)
  return { slope, stdErr }
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

/** Mindestspannweite der Mahlgrade, damit eine Steigung überhaupt bestimmbar
 *  ist. Wer nur zwischen 10.0 und 10.2 variiert hat, hat über den Effekt eines
 *  Klicks nichts ausgesagt — die Gerade läge dann auf dem Rauschen. */
const MIN_SPREAD = 0.8

/** Die Steigung muss deutlicher sein als ihre eigene Unsicherheit. Faktor 2
 *  entspricht grob dem üblichen „signifikant" und hält genau die Schätzungen
 *  heraus, die den Unsinn erzeugt haben. */
const MIN_SIGNAL_TO_NOISE = 2

/** Plausibles Band, ausgedrückt über den benutzten Bereich statt in absoluten
 *  Sekunden pro Klick: eine Mühle mit 0–10er Skala und eine mit 0–100er sagen
 *  dasselbe mit sehr verschiedenen Zahlen. Über den ganzen benutzten Bereich
 *  soll die vorhergesagte Zeitänderung zwischen 2 s und 90 s liegen. */
const MIN_EFFECT_OVER_RANGE = 2
const MAX_EFFECT_OVER_RANGE = 90

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/**
 * Lernt aus den Shots EINER Mühle, was ein Mahlgrad-Klick bewirkt.
 *
 * Zentriert jede (Bohne, Sieb)-Gruppe auf ihren eigenen Mittelwert, damit der
 * Offset der Bohne und der des Siebs herausfallen — sonst misst die Regression
 * vor allem den Unterschied zwischen den Tüten.
 */
export function learnGrinder(shots: DialInShot[]): GrinderModel {
  const valid = shots.filter(usable)
  const settings = valid.map(s => s.grind_setting!)
  const range = settings.length
    ? { min: Math.min(...settings), max: Math.max(...settings) }
    : null

  const reject = (reason: GrinderModel['rejected']): GrinderModel => ({
    secondsPerStep: FALLBACK_SECONDS_PER_STEP,
    basis: 'fallback',
    points: valid.length,
    rejected: reason,
    range,
  })

  if (valid.length < 4) return reject('too-few')

  // Fixed Effects: pro (Bohne, Sieb) zentrieren. Gruppen mit nur einem Shot
  // tragen nach dem Zentrieren nur (0,0) bei und fliegen deshalb raus.
  const groups = new Map<string, DialInShot[]>()
  for (const s of valid) {
    const key = `${s.coffee_id}|${s.basket_id ?? 'none'}`
    const g = groups.get(key)
    if (g) g.push(s)
    else groups.set(key, [s])
  }

  const centred: Point[] = []
  for (const g of groups.values()) {
    if (g.length < 2) continue
    const mx = g.reduce((s, x) => s + x.grind_setting!, 0) / g.length
    const my = g.reduce((s, x) => s + x.brew_time_s!, 0) / g.length
    for (const x of g) centred.push({ x: x.grind_setting! - mx, y: x.brew_time_s! - my })
  }

  if (centred.length < 4) return reject('too-few')

  const xs = centred.map(p => p.x)
  const spread = Math.max(...xs) - Math.min(...xs)
  if (spread < MIN_SPREAD) return reject('no-spread')

  const f = fit(centred)
  if (!f) return reject('no-spread')
  if (!Number.isFinite(f.stdErr) || Math.abs(f.slope) < MIN_SIGNAL_TO_NOISE * f.stdErr) {
    return reject('noisy')
  }
  // Feiner (kleinere Zahl) muss langsamer heissen. Ein positives Ergebnis ist
  // kein Mühlenverhalten, sondern ein Artefakt.
  if (f.slope >= 0) return reject('wrong-sign')

  if (range) {
    const span = range.max - range.min
    if (span > 0) {
      const effect = Math.abs(f.slope) * span
      if (effect < MIN_EFFECT_OVER_RANGE || effect > MAX_EFFECT_OVER_RANGE) {
        return reject('implausible')
      }
    }
  }

  return {
    secondsPerStep: f.slope,
    basis: 'learned',
    points: centred.length,
    rejected: null,
    range,
  }
}

/** Auf welchen Bereich ein Vorschlag zurückgeholt wird.
 *  Ein Viertel des benutzten Bereichs als Rand lässt Luft für eine neue Bohne,
 *  ohne in Regionen zu führen, die die Mühle vielleicht gar nicht hat. */
function allowedRange(range: GrinderModel['range']): { lo: number; hi: number } | null {
  if (!range) return null
  const span = range.max - range.min
  const margin = Math.max(1, span * 0.25)
  return { lo: range.min - margin, hi: range.max + margin }
}

/**
 * Schlägt den nächsten Mahlgrad vor, um `targetTime` zu treffen.
 *
 * `shots` sind ALLE Shots des Users; gefiltert wird hier, damit der Aufrufer
 * nicht mehrere Listen jonglieren muss. `shots` muss neueste zuerst sortiert
 * sein — der jüngste Shot ist der Anker.
 */
export function suggestGrind({
  shots,
  coffeeId,
  grinderId,
  basketId = null,
  targetTime,
}: {
  shots: DialInShot[]
  coffeeId: string
  grinderId: string | null
  basketId?: string | null
  targetTime: number
}): DialInSuggestion {
  const valid = shots.filter(usable)
  const grinderShots = grinderId ? valid.filter(s => s.grinder_id === grinderId) : valid
  const model = learnGrinder(grinderShots)

  const coffeeShots = grinderShots.filter(s => s.coffee_id === coffeeId)
  // Anker: gleiche Bohne UND gleiches Sieb ist der saubere Fall. Sonst die
  // Bohne allein — mit Hinweis, denn ein anderer Korb verschiebt die Zeit.
  const sameBasketShots = basketId
    ? coffeeShots.filter(s => s.basket_id === basketId)
    : []
  const anchorPool = sameBasketShots.length > 0 ? sameBasketShots : coffeeShots
  const sameBasket = sameBasketShots.length > 0

  const base = {
    secondsPerStep: model.secondsPerStep,
    grinderShots: grinderShots.length,
    coffeeShots: coffeeShots.length,
    sameBasket,
    model,
  }

  if (anchorPool.length === 0) {
    return {
      ...base,
      grind: null,
      confidence: 'none',
      clamped: false,
      message: 'No shot with this coffee yet — start from the recipe and log one.',
    }
  }

  const last = anchorPool[0]
  const currentGrind = last.grind_setting!
  const currentTime = last.brew_time_s!
  const gap = targetTime - currentTime

  // Konfidenz haengt daran, ob die Steigung gelernt ist — nicht daran, wie
  // viele Shots insgesamt herumliegen. 45 Shots ohne Variation im Mahlgrad
  // sagen ueber einen Klick genauso wenig wie vier.
  let confidence: Confidence = 'low'
  if (model.basis === 'learned') confidence = model.points >= 12 ? 'high' : 'medium'

  if (Math.abs(gap) < 1) {
    return {
      ...base,
      grind: currentGrind,
      confidence,
      clamped: false,
      message: `Last shot hit ${currentTime}s — keep the grind where it is.`,
    }
  }

  const perStep = model.secondsPerStep ?? FALLBACK_SECONDS_PER_STEP
  const bounds = allowedRange(model.range)

  // Schritt begrenzen: hoechstens der halbe benutzte Bereich auf einmal.
  // Dial-in geht in Schritten, nicht in Spruengen — und ein zu grosser
  // Schritt ist der sichtbare Teil des alten Fehlers.
  const rawStep = gap / perStep
  const span = model.range ? model.range.max - model.range.min : 0
  const maxStep = Math.max(1, span * 0.5)
  const step = clamp(rawStep, -maxStep, maxStep)

  const wanted = currentGrind + step
  const bounded = bounds ? clamp(wanted, bounds.lo, bounds.hi) : wanted
  const grind = Math.round(bounded * 10) / 10
  const clamped = Math.abs(bounded - (currentGrind + rawStep)) > 0.05

  const dir = grind < currentGrind ? 'finer' : 'coarser'
  const why =
    model.basis === 'learned'
      ? ''
      : model.rejected === 'no-spread'
        ? ' (rough guess — you have always ground at nearly the same setting, so there is nothing to learn from yet)'
        : model.rejected === 'noisy'
          ? ' (rough guess — your shot times vary too much to read a clear pattern)'
          : ' (rough guess — too few shots on this grinder yet)'
  const basketNote = !sameBasket && basketId
    ? ' Heads up: your last shot of this coffee used a different basket.'
    : ''
  const capNote = clamped
    ? ' Capped to the range you actually use — take it one step at a time.'
    : ''

  return {
    ...base,
    grind,
    confidence,
    clamped,
    message: `Last shot ran ${currentTime}s, target ${targetTime}s → go ${dir} to about ${grind}${why}.${capNote}${basketNote}`,
  }
}
