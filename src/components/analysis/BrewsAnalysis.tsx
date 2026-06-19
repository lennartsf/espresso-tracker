import { useEffect, useRef, useState } from 'react'
import { useCoffees } from '../../hooks/useCoffees'
import { useBrews, type BrewWithCoffee } from '../../hooks/useBrews'
import { Select } from '../ui'
import { BREW_GOALS, type LeverId, type TasteMetric } from '../../utils/tasteGuide'
import { BREW_METHODS } from '../../utils/brewMethods'
import { GoalSteer } from './GoalSteer'
import { LeverExplorer, type LeverOption, type MetricOption } from './LeverExplorer'

type Mode = 'goal' | 'explore'
const MODES: { key: Mode; label: string }[] = [
  { key: 'goal', label: 'Goal' },
  { key: 'explore', label: 'Explore' },
]

const EXPLORER_LEVERS: LeverOption[] = [
  { id: 'grind', label: 'Grind' }, { id: 'ratio', label: 'Ratio' },
  { id: 'temp', label: 'Temp' }, { id: 'time', label: 'Time' }, { id: 'dose', label: 'Dose' },
]
const EXPLORER_METRICS: MetricOption[] = [
  { key: 'rating', label: 'Flavor', quality: true },
  { key: 'acidity_score', label: 'Acidity', quality: false },
  { key: 'bitterness_score', label: 'Bitterness', quality: false },
]

// Brews tracken water_ml statt yield → Ratio = water/dose; keine Preinfusion/Body.
const leverValue = (b: BrewWithCoffee, l: LeverId): number | null => {
  switch (l) {
    case 'grind': return b.grind_setting ?? null
    case 'ratio': return b.dose_g && b.dose_g > 0 && b.water_ml != null ? b.water_ml / b.dose_g : null
    case 'temp':  return b.temp_c ?? null
    case 'time':  return b.brew_time_s ?? null
    case 'dose':  return b.dose_g ?? null
    default:      return null
  }
}
const metricValue = (b: BrewWithCoffee, k: TasteMetric | string) =>
  (b[k as keyof BrewWithCoffee] as number | null) ?? null

export function BrewsAnalysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const [brewMethod, setBrewMethod] = useState('')
  const [mode, setMode] = useState<Mode>('goal')
  const userPicked = useRef(false)

  const { data: coffees = [] } = useCoffees()
  const { data: allBrews = [] } = useBrews(undefined, brewMethod || undefined)

  useEffect(() => {
    if (!userPicked.current && !coffeeId && allBrews.length > 0) {
      setCoffeeId(allBrews[0].coffee_id)
    }
  }, [allBrews, coffeeId])

  const brews = allBrews.filter(b => !coffeeId || b.coffee_id === coffeeId)

  return (
    <div>
      <div className="grid gap-2 mb-4">
        <Select value={coffeeId} onChange={e => { userPicked.current = true; setCoffeeId(e.target.value) }}>
          <option value="">Pick a coffee…</option>
          {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
        </Select>
        <Select value={brewMethod} onChange={e => setBrewMethod(e.target.value)}>
          <option value="">All methods</option>
          {BREW_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
      </div>

      {!coffeeId ? (
        <p className="text-center text-coffee-muted text-sm py-10">
          Pick a coffee — analysis only makes sense per coffee.
        </p>
      ) : brews.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No brews for this coffee yet.</p>
      ) : (
        <>
          <div className="flex gap-1 mb-5 bg-coffee-bg rounded-lg p-1">
            {MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${mode === m.key ? 'bg-coffee-surface2 text-coffee-cream shadow-sm' : 'text-coffee-muted hover:text-coffee-text'}`}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'goal' && (
            <GoalSteer items={brews} goals={BREW_GOALS} leverValue={leverValue} metricValue={metricValue} />
          )}
          {mode === 'explore' && (
            <LeverExplorer items={brews} levers={EXPLORER_LEVERS} metrics={EXPLORER_METRICS}
              leverValue={leverValue} metricValue={metricValue} />
          )}
        </>
      )}
    </div>
  )
}
