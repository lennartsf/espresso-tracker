import type { Shot } from '../types'
import { pearsonR, hasEnoughForCorrelation } from './correlation'
import type { RecipeStats } from './recipeCalc'

/* ──────────────────────────────────────────────────────────────────────────
   Geschmacks-Steuerung — eingebautes Extraktions-Wissen (universell) +
   Daten-Overlay (kaffee-spezifisch). Modell (SCA/Hoffmann):
     • Säure   ↔ UNTER-Extraktion  (acidity_score ↑ wenn Extraktion ↓)
     • Bitter  ↔ ÜBER-Extraktion   (bitterness_score ↑ wenn Extraktion ↑)
     • Körper  ↔ Konzentration     (body_score ↑ wenn Ratio ↓ / Dose ↑)
   Raw-Hebel die Extraktion erhöhen: Temp ↑, Zeit ↑, Ratio ↑, Preinfusion ↑,
   feiner mahlen. Mahlgrad-ZAHL ist mühlenabhängig (mal ↑=feiner, mal ↓=feiner)
   → für Grind KEIN universelles Vorzeichen behaupten (expectedSign = null).
   ────────────────────────────────────────────────────────────────────────── */

export type LeverId = 'grind' | 'ratio' | 'temp' | 'time' | 'dose' | 'preinfusion'
export type TasteMetric = 'acidity_score' | 'bitterness_score' | 'body_score'
export type Direction =
  | 'finer' | 'coarser' | 'higher' | 'lower' | 'longer' | 'shorter' | 'more' | 'less'

export interface Lever {
  id: LeverId
  label: string
  unit: string
  /** Liest den Roh-Hebelwert aus einem Shot (Ratio = yield/dose). null = fehlt. */
  valueOf: (s: Shot) => number | null
}

export const LEVERS: Record<LeverId, Lever> = {
  grind:       { id: 'grind',       label: 'Grind',       unit: '',    valueOf: s => s.grind_setting ?? null },
  ratio:       { id: 'ratio',       label: 'Ratio',       unit: ':1',  valueOf: s => ratioOf(s) },
  temp:        { id: 'temp',        label: 'Temp',        unit: '°C',  valueOf: s => s.temp_c ?? null },
  time:        { id: 'time',        label: 'Time',        unit: 's',   valueOf: s => s.brew_time_s ?? null },
  dose:        { id: 'dose',        label: 'Dose',        unit: 'g',   valueOf: s => s.dose_g ?? null },
  preinfusion: { id: 'preinfusion', label: 'Preinfusion', unit: 's',   valueOf: s => s.preinfusion_s ?? null },
}

/** Brew-Ratio = yield/dose. Nutzt brew_ratio-Feld, sonst aus dose/yield berechnet. */
export function ratioOf(s: Shot): number | null {
  if (s.brew_ratio != null && s.brew_ratio > 0) return s.brew_ratio
  if (s.dose_g != null && s.dose_g > 0 && s.yield_g != null) return s.yield_g / s.dose_g
  return null
}

export interface Adjustment {
  lever: LeverId
  direction: Direction
  reason: string
  /** Vorzeichen der erwarteten Korrelation corr(leverRohwert, goal.metric).
   *  null = nicht behauptbar (Grind, mühlenabhängig). */
  expectedSign: -1 | 1 | null
}

export interface TasteGoal {
  id: string
  label: string
  metric: TasteMetric
  adjustments: Adjustment[]
}

// Höhere Extraktion → weniger Säure. Reihenfolge = stärkster Hebel zuerst.
const RAISE_EXTRACTION: Adjustment[] = [
  { lever: 'grind', direction: 'finer',  reason: 'Finer grind extracts more — cuts sourness.', expectedSign: null },
  { lever: 'temp',  direction: 'higher', reason: 'Hotter water extracts more.',                 expectedSign: -1 },
  { lever: 'ratio', direction: 'longer', reason: 'More water pulls more out of the puck.',       expectedSign: -1 },
  { lever: 'preinfusion', direction: 'longer', reason: 'Longer pre-infusion evens out extraction.', expectedSign: -1 },
]

const LOWER_EXTRACTION_ACID: Adjustment[] = [
  { lever: 'grind', direction: 'coarser', reason: 'Coarser grind extracts less — lifts acidity.', expectedSign: null },
  { lever: 'temp',  direction: 'lower',   reason: 'Cooler water extracts less.',                   expectedSign: 1 },
  { lever: 'ratio', direction: 'shorter', reason: 'Less water keeps it brighter.',                 expectedSign: 1 },
]

const LOWER_EXTRACTION_BITTER: Adjustment[] = [
  { lever: 'grind', direction: 'coarser', reason: 'Coarser grind extracts less — cuts bitterness.', expectedSign: null },
  { lever: 'temp',  direction: 'lower',   reason: 'Cooler water extracts less.',                     expectedSign: 1 },
  { lever: 'ratio', direction: 'shorter', reason: 'Stop the pull earlier (less water).',             expectedSign: 1 },
  { lever: 'time',  direction: 'shorter', reason: 'Shorter pull avoids over-extraction.',            expectedSign: 1 },
]

const RAISE_BODY: Adjustment[] = [
  { lever: 'ratio', direction: 'shorter', reason: 'Less water = more concentrated, thicker body.', expectedSign: -1 },
  { lever: 'dose',  direction: 'higher',  reason: 'More coffee in the basket builds body.',         expectedSign: 1 },
  { lever: 'grind', direction: 'finer',   reason: 'Finer grind raises concentration slightly.',     expectedSign: null },
]

const LOWER_BODY: Adjustment[] = [
  { lever: 'ratio', direction: 'longer',  reason: 'More water thins out a heavy shot.',  expectedSign: 1 },
  { lever: 'dose',  direction: 'lower',   reason: 'Less coffee lightens the body.',       expectedSign: -1 },
  { lever: 'grind', direction: 'coarser', reason: 'Coarser grind lowers concentration.',  expectedSign: null },
]

export const ESPRESSO_GOALS: TasteGoal[] = [
  { id: 'less-acidity', label: 'Less acidity (too sour)', metric: 'acidity_score',    adjustments: RAISE_EXTRACTION },
  { id: 'more-acidity', label: 'More acidity (flat)',     metric: 'acidity_score',    adjustments: LOWER_EXTRACTION_ACID },
  { id: 'less-bitter',  label: 'Less bitterness',         metric: 'bitterness_score', adjustments: LOWER_EXTRACTION_BITTER },
  { id: 'more-body',    label: 'More body',               metric: 'body_score',       adjustments: RAISE_BODY },
  { id: 'less-body',    label: 'Less body',               metric: 'body_score',       adjustments: LOWER_BODY },
]

// Brews: keine body_score-Spalte → nur Säure/Bitterness-Ziele.
export const BREW_GOALS: TasteGoal[] = [
  { id: 'less-acidity', label: 'Less acidity (too sour)', metric: 'acidity_score',    adjustments: RAISE_EXTRACTION },
  { id: 'more-acidity', label: 'More acidity (flat)',     metric: 'acidity_score',    adjustments: LOWER_EXTRACTION_ACID },
  { id: 'less-bitter',  label: 'Less bitterness',         metric: 'bitterness_score', adjustments: LOWER_EXTRACTION_BITTER },
]

/* ── Daten-Overlay: stimmen DEINE Shots mit der Regel überein? ───────────── */

export type Strength = 'strong' | 'moderate' | 'weak' | 'none'

export interface Agreement {
  enough: boolean             // genug Datenpunkte (≥ MIN_SHOTS_FOR_CORRELATION)
  agrees: boolean | null      // null = nicht behauptbar (expectedSign null) oder zu wenig Daten
  r: number
  strength: Strength
}

function strengthOf(r: number): Strength {
  const a = Math.abs(r)
  if (a >= 0.6) return 'strong'
  if (a >= 0.3) return 'moderate'
  if (a > 0)    return 'weak'
  return 'none'
}

/** Bewertet corr(leverRohwert, metric) gegen das erwartete Vorzeichen. */
export function evaluateAgreement(
  points: { x: number; y: number }[],
  expectedSign: -1 | 1 | null,
): Agreement {
  if (!hasEnoughForCorrelation(points.length)) {
    return { enough: false, agrees: null, r: 0, strength: 'none' }
  }
  const r = pearsonR(points)
  const strength = strengthOf(r)
  const agrees = expectedSign == null
    ? null
    : Math.sign(r) === expectedSign && strength !== 'none' && strength !== 'weak'
  return { enough: true, agrees, r, strength }
}

/* ── Shot-Diagnose: Ist-Werte vs. Best-Shot-Fenster bzw. Theorie ─────────── */

export interface Window { min: number; max: number }

/** Theorie-Fallback wenn (noch) keine eigenen Best-Shots da sind. */
export const ESPRESSO_THEORY: { ratio: Window; time: Window; temp: Window } = {
  ratio: { min: 2, max: 2.5 },
  time:  { min: 25, max: 32 },
  temp:  { min: 92, max: 94 },
}

export type DevStatus = 'low' | 'ok' | 'high'

export interface Deviation {
  lever: LeverId
  label: string
  value: number
  window: Window
  status: DevStatus
  /** Tipp wenn außerhalb — Richtung zum Idealfenster. */
  hint: string | null
  source: 'your-best' | 'theory'
}

function classify(value: number, w: Window): DevStatus {
  if (value < w.min) return 'low'
  if (value > w.max) return 'high'
  return 'ok'
}

/**
 * Vergleicht Ratio/Zeit/Temp eines Shots mit dem eigenen Best-Shot-Fenster
 * (aus calcBestRecipe, rating ≥ 8) — fällt auf Theorie zurück wenn keine da.
 */
export function diagnoseShot(shot: Shot, best: RecipeStats | null): Deviation[] {
  const out: Deviation[] = []

  const ratio = ratioOf(shot)
  if (ratio != null) {
    const haveBest = best?.avgYield != null && best?.avgDose != null && best.avgDose > 0
    const bestRatio = haveBest ? best!.avgYield! / best!.avgDose! : null
    const window: Window = bestRatio != null
      ? { min: bestRatio - 0.15, max: bestRatio + 0.15 }
      : ESPRESSO_THEORY.ratio
    const status = classify(ratio, window)
    out.push({
      lever: 'ratio', label: 'Ratio', value: ratio, window, status,
      source: bestRatio != null ? 'your-best' : 'theory',
      hint: status === 'low'  ? 'Short ratio → can taste sour/thin. Let it run longer or grind finer.'
          : status === 'high' ? 'Long ratio → can taste bitter/watery. Stop earlier or grind coarser.'
          : null,
    })
  }

  if (shot.brew_time_s != null) {
    const window: Window = best?.brewTimeMin != null && best?.brewTimeMax != null
      ? { min: best.brewTimeMin, max: best.brewTimeMax }
      : ESPRESSO_THEORY.time
    const status = classify(shot.brew_time_s, window)
    out.push({
      lever: 'time', label: 'Brew time', value: shot.brew_time_s, window, status,
      source: best?.brewTimeMin != null ? 'your-best' : 'theory',
      hint: status === 'low'  ? 'Fast pull → under-extracted/sour. Grind finer.'
          : status === 'high' ? 'Slow pull → over-extracted/bitter. Grind coarser.'
          : null,
    })
  }

  if (shot.temp_c != null) {
    const window: Window = best?.avgTemp != null
      ? { min: best.avgTemp - 1, max: best.avgTemp + 1 }
      : ESPRESSO_THEORY.temp
    const status = classify(shot.temp_c, window)
    out.push({
      lever: 'temp', label: 'Temp', value: shot.temp_c, window, status,
      source: best?.avgTemp != null ? 'your-best' : 'theory',
      hint: status === 'low'  ? 'Cool → can taste sour. Bump temperature.'
          : status === 'high' ? 'Hot → can taste bitter. Drop temperature.'
          : null,
    })
  }

  return out
}
