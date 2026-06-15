import type { RecipeStats } from '../utils/recipeCalc'

interface Props {
  stats: RecipeStats
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-coffee-muted">{label}</span>
      <span className="font-semibold text-coffee-cream">{value}</span>
    </div>
  )
}

export function RecipeCard({ stats }: Props) {
  return (
    <div className="bg-coffee-surface2 border border-coffee-line rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-coffee-muted uppercase tracking-wide">
          Best Recipe
        </span>
        <span className="text-xs font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
          Avg {stats.avgRating.toFixed(1)} · {stats.shotCount} Shots
        </span>
      </div>
      <div className="grid gap-2">
        <Row label="Grind" value={`${stats.grindMin}–${stats.grindMax}`} />
        {stats.avgDose !== null && stats.avgYield !== null && (
          <Row label="Ratio" value={`${stats.avgDose.toFixed(0)}g → ${stats.avgYield.toFixed(0)}g`} />
        )}
        {stats.brewTimeMin !== null && stats.brewTimeMax !== null && (
          <Row label="Brew Time" value={`${stats.brewTimeMin}–${stats.brewTimeMax}s`} />
        )}
        {stats.avgTemp !== null && (
          <Row label="Temperature" value={`${stats.avgTemp.toFixed(0)}°C`} />
        )}
        {stats.avgPressure !== null && (
          <Row label="Pressure" value={`${stats.avgPressure.toFixed(1)} bar`} />
        )}
      </div>
    </div>
  )
}
