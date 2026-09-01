import type { ScaleReading } from './types'

/**
 * Erkennt aus dem Gewichtsverlauf, wann der Bezug vorbei ist.
 *
 * Die naive Regel „stoppe, wenn sich das Gewicht nicht mehr ändert" scheitert
 * an zwei Stellen, die beide real sind:
 *
 * 1. **Vor dem ersten Tropfen ändert sich auch nichts.** Wer nur auf Stillstand
 *    prüft, stoppt sofort nach dem Start. Deshalb muss erst ein Mindestgewicht
 *    geflossen sein, bevor überhaupt auf Stillstand geachtet wird.
 * 2. **Die Waage rauscht.** Einzelwerte schwanken um Zehntelgramm; ein
 *    Vergleich zweier aufeinanderfolgender Messungen sieht dauernd „Bewegung"
 *    oder dauernd „Stillstand", je nach Schwelle. Deshalb wird die Flussrate
 *    über ein Zeitfenster gebildet, nicht aus zwei Punkten.
 *
 * Die Erkennung ist bewusst eine reine Funktion über dem Verlauf: so lässt sie
 * sich mit aufgezeichneten Kurven testen, ohne Hardware und ohne Timer.
 */
export interface AutoStopConfig {
  /** Gramm, die geflossen sein müssen, bevor Stillstand zählt. */
  minYieldG: number
  /** Unter dieser Flussrate (g/s) gilt der Bezug als beendet. */
  stopFlowRate: number
  /** So lange muss die Rate darunter bleiben (ms). */
  quietMs: number
  /** Fenster für die Ratenbildung (ms). */
  windowMs: number
}

export const DEFAULT_AUTO_STOP: AutoStopConfig = {
  // 5 g: genug, um Preinfusion und erste Tropfen sicher zu überspringen,
  // aber deutlich unter jedem sinnvollen Ziel-Yield.
  minYieldG: 5,
  // 0.2 g/s: darunter tropft es nur noch nach.
  stopFlowRate: 0.2,
  // Eine ganze Sekunde Ruhe — kürzer und ein Schwapper stoppt den Timer.
  quietMs: 1000,
  windowMs: 600,
}

/** Flussrate in g/s über das letzte Zeitfenster. `null`, wenn zu wenig
 *  Messwerte im Fenster liegen, um eine Rate zu bilden. */
export function flowRate(readings: ScaleReading[], windowMs: number): number | null {
  if (readings.length < 2) return null
  const last = readings[readings.length - 1]
  const first = readings.find(r => last.at - r.at <= windowMs)
  if (!first || first === last) return null
  const dt = (last.at - first.at) / 1000
  if (dt <= 0) return null
  return (last.grams - first.grams) / dt
}

export interface AutoStopResult {
  /** Zeitstempel, an dem der Bezug als beendet gilt. `null`, wenn nicht. */
  stopAt: number | null
  /** Gewicht zu diesem Zeitpunkt — der Yield-Wert fürs Formular. */
  grams: number | null
}

/**
 * Sucht im Verlauf den Punkt, an dem der Bezug endete.
 *
 * Gibt `null` zurück, solange nicht beide Bedingungen erfüllt sind: genug
 * geflossen UND lange genug ruhig. Im Zweifel läuft der Timer weiter — ein zu
 * früher Stopp verdirbt die Messung, ein zu später kostet zwei Sekunden.
 */
export function detectStop(
  readings: ScaleReading[],
  cfg: AutoStopConfig = DEFAULT_AUTO_STOP,
): AutoStopResult {
  if (readings.length < 2) return { stopAt: null, grams: null }

  let quietSince: number | null = null

  for (let i = 1; i < readings.length; i++) {
    const upto = readings.slice(0, i + 1)
    const current = readings[i]

    // Bedingung 1: es muss überhaupt etwas geflossen sein.
    if (current.grams < cfg.minYieldG) {
      quietSince = null
      continue
    }

    const rate = flowRate(upto, cfg.windowMs)
    if (rate === null) continue

    if (Math.abs(rate) < cfg.stopFlowRate) {
      if (quietSince === null) quietSince = current.at
      if (current.at - quietSince >= cfg.quietMs) {
        return { stopAt: current.at, grams: current.grams }
      }
    } else {
      // Wieder Bewegung — die Ruhephase zählt von vorn.
      quietSince = null
    }
  }

  return { stopAt: null, grams: null }
}
