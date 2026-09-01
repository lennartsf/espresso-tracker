/**
 * Zielwert neben einem Eingabefeld — leuchtend, aber nicht eingetragen.
 *
 * Das ist der Kern von Paket B: ein übernommenes Rezept schreibt Dosis, Menge
 * und Zeit **nicht** in die Felder. Ein eingetragener Wert liest sich wie eine
 * Messung; du hast aber noch nichts gewogen. Der Ghost sagt „hier willst du
 * hin", das Feld bleibt deins.
 *
 * Sobald ein Ist-Wert da ist, zeigt der Ghost zusätzlich die Abweichung — und
 * zwar wertfrei: ein Delta ist keine Note, nur eine Richtung.
 */
export function TargetGhost({
  target,
  actual,
  unit,
  decimals = 0,
  /** Ab welcher Abweichung das Delta gezeigt wird. Darunter ist es Rauschen. */
  tolerance = 0.05,
}: {
  target: number | null | undefined
  actual?: number | null
  unit: string
  decimals?: number
  tolerance?: number
}) {
  if (target == null) return null

  const fmt = (n: number) => n.toFixed(decimals)
  const delta = actual != null && Number.isFinite(actual) ? actual - target : null
  const off = delta !== null && Math.abs(delta) > tolerance

  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs">
      <span className="text-coffee-muted">Target</span>
      <span className="font-semibold text-coffee-accent-soft">
        {fmt(target)} {unit}
      </span>
      {off && (
        <span className="text-coffee-muted">
          ({delta! > 0 ? '+' : '−'}{fmt(Math.abs(delta!))})
        </span>
      )}
    </p>
  )
}
