interface Props {
  doseG: number | null
  yieldG: number | null
}

export function BrewRatioBar({ doseG, yieldG }: Props) {
  const ratio = doseG && yieldG && doseG > 0 ? yieldG / doseG : null
  const yieldFlex = ratio ?? 2

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-coffee-bg">
        <div className="bg-coffee-accent/30" style={{ flex: 1 }} />
        <div
          className={ratio !== null ? 'bg-coffee-accent' : 'bg-coffee-surface2'}
          style={{ flex: yieldFlex }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-coffee-muted">
          {doseG ? `${doseG}g Dose` : '—'}
        </span>
        <span className={`text-xs font-semibold ${ratio !== null ? 'text-coffee-accent-soft' : 'text-coffee-muted/60'}`}>
          {ratio !== null ? `1 : ${ratio.toFixed(2)}` : '— : —'}
        </span>
        <span className="text-xs text-coffee-muted">
          {yieldG ? `${yieldG}g Yield` : '—'}
        </span>
      </div>
    </div>
  )
}
