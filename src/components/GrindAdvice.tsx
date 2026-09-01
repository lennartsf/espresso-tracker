import type { ReactNode } from 'react'
import { buttonClasses } from './ui'

/**
 * Der Hinweiskasten unter den Brühparametern — Röst-Prior oder Dial-in.
 *
 * **Warum quer und nicht hoch.** Er stand vorher IN der Mahlgrad-Spalte, also
 * auf einem Drittel der Breite. Zwei Sätze Text brachen dort auf fünf Zeilen
 * um und schoben Temperatur und Druck optisch nach oben; auf dem Mac sah die
 * Zeile aus, als fehle rechts etwas. Jetzt sitzt er unter dem ganzen Raster
 * und läuft von „Grind setting" bis „Pressure" durch: Text links, Aktion
 * rechts, in die Breite statt in die Tiefe.
 *
 * **Warum er aussieht wie ein Feld.** Vorher trug er eine getönte Akzentfläche
 * und war damit das Auffälligste im Formular — obwohl er nur ein Vorschlag
 * ist. Jetzt nimmt er Fläche und Kante der Eingabefelder (`--coffee-surface-2`
 * / `--coffee-field-border`), nur mit doppelt so dicker Kante, damit er als
 * eigener Block lesbar bleibt und nicht als weiteres Eingabefeld.
 */
export function GrindAdvice({
  message,
  detail,
  warning = false,
  actionLabel,
  onApply,
}: {
  message: ReactNode
  /** Zweite Zeile: das gelernte Mühlenverhalten, Datengrundlage. Optional. */
  detail?: ReactNode
  /** Hebt den Kasten als „mit Vorsicht" hervor — ohne die Fläche zu wechseln. */
  warning?: boolean
  actionLabel?: string
  onApply?: () => void
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border-2 border-coffee-field bg-coffee-surface2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-coffee-text">
          {warning && (
            <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200 ring-1 ring-amber-400/50">
              Rough
            </span>
          )}
          {message}
        </p>
        {detail && <p className="mt-1 text-xs text-coffee-muted">{detail}</p>}
      </div>

      {onApply && actionLabel && (
        <button
          type="button"
          onClick={onApply}
          className={buttonClasses('secondary', 'flex-shrink-0 px-4 py-1.5')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
