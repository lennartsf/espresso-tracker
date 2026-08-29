/** Tactile Brew-Ratio-Bar: Gold-Verlauf + Inset-Schatten („flüssig"). */
export function LiquidBar({ doseG, yieldG }: { doseG: number | null; yieldG: number | null }) {
  const ratio = doseG && yieldG && doseG > 0 ? yieldG / doseG : null
  const fillPct = ratio !== null ? Math.min(100, (ratio / 3) * 100) : 0

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wide text-coffee-muted">Ø Brew Ratio</span>
        <span className={`text-2xl font-extrabold ${ratio !== null ? 'text-coffee-accent-soft' : 'text-coffee-muted/60'}`}>
          {ratio !== null ? `1 : ${ratio.toFixed(2)}` : '— : —'}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-lg bg-coffee-surface2 shadow-track">
        <div
          className="h-full rounded-lg shadow-liquid"
          style={{ width: `${fillPct}%`, background: 'var(--coffee-liquid)' }}
        />
      </div>
    </div>
  )
}
