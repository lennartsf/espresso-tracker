interface Props {
  doseG: number | null
  yieldG: number | null
}

export function BrewRatioBar({ doseG, yieldG }: Props) {
  const ratio = doseG && yieldG && doseG > 0 ? yieldG / doseG : null
  const yieldFlex = ratio ?? 2

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div className="bg-orange-200" style={{ flex: 1 }} />
        <div
          className={ratio !== null ? 'bg-orange-500' : 'bg-slate-200'}
          style={{ flex: yieldFlex }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-slate-400">
          {doseG ? `${doseG}g Dose` : '—'}
        </span>
        <span className={`text-xs font-semibold ${ratio !== null ? 'text-orange-500' : 'text-slate-300'}`}>
          {ratio !== null ? `1 : ${ratio.toFixed(2)}` : '— : —'}
        </span>
        <span className="text-xs text-slate-400">
          {yieldG ? `${yieldG}g Yield` : '—'}
        </span>
      </div>
    </div>
  )
}
