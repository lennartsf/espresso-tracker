import type { RecipeStats } from '../utils/recipeCalc'
import { cardClasses } from './ui'
import { DialGauge } from './dashboard/DialGauge'
import { LiquidBar } from './dashboard/LiquidBar'

interface Props {
  stats: RecipeStats
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-coffee-line bg-coffee-surface2 p-3 text-center">
      <p className="font-display text-lg font-bold text-coffee-accent-soft">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-coffee-muted">{label}</p>
    </div>
  )
}

export function RecipeCard({ stats }: Props) {
  const range = (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`)

  return (
    <div className={`${cardClasses} p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-coffee-muted">Best Recipe</span>
        <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-300">
          {stats.shotCount} shot{stats.shotCount !== 1 ? 's' : ''} ≥8
        </span>
      </div>

      <div className="flex items-center justify-center">
        <DialGauge value={stats.avgRating} max={10} label="Avg Flavor" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Grind" value={range(stats.grindMin, stats.grindMax)} />
        {stats.brewTimeMin !== null && stats.brewTimeMax !== null && (
          <Stat label="Brew Time" value={`${range(stats.brewTimeMin, stats.brewTimeMax)}s`} />
        )}
        {stats.avgTemp !== null && <Stat label="Temp" value={`${stats.avgTemp.toFixed(0)}°C`} />}
        {stats.avgPressure !== null && <Stat label="Pressure" value={`${stats.avgPressure.toFixed(1)} bar`} />}
      </div>

      {stats.avgDose !== null && stats.avgYield !== null && (
        <div className="mt-4">
          <LiquidBar doseG={stats.avgDose} yieldG={stats.avgYield} />
        </div>
      )}
    </div>
  )
}
