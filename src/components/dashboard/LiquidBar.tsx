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
      <div className="mt-2 h-3 overflow-hidden rounded-lg bg-coffee-bg shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]">
        <div
          className="h-full rounded-lg bg-gradient-to-r from-[#7a4e26] to-[#e9c987] shadow-[0_0_12px_rgba(233,201,135,0.5)]"
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  )
}
