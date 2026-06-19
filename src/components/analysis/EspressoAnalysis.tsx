import { useEffect, useRef, useState } from 'react'
import { useCoffees, useRoastDates } from '../../hooks/useCoffees'
import { useShots, type ShotWithCoffee } from '../../hooks/useShots'
import { useGrinders } from '../../hooks/useEquipment'
import { Select } from '../ui'
import { LEVERS, ESPRESSO_GOALS, type LeverId, type TasteMetric } from '../../utils/tasteGuide'
import { GoalSteer } from './GoalSteer'
import { ShotDiagnosis } from './ShotDiagnosis'
import { LeverExplorer, type LeverOption, type MetricOption } from './LeverExplorer'

type Mode = 'goal' | 'diagnose' | 'explore'
const MODES: { key: Mode; label: string }[] = [
  { key: 'goal',     label: 'Goal' },
  { key: 'diagnose', label: 'Diagnose' },
  { key: 'explore',  label: 'Explore' },
]

const EXPLORER_LEVERS: LeverOption[] = [
  { id: 'grind', label: 'Grind' }, { id: 'ratio', label: 'Ratio' },
  { id: 'temp', label: 'Temp' }, { id: 'time', label: 'Time' },
  { id: 'dose', label: 'Dose' }, { id: 'preinfusion', label: 'Preinfusion' },
]
const EXPLORER_METRICS: MetricOption[] = [
  { key: 'rating', label: 'Flavor', quality: true },
  { key: 'body_score', label: 'Body', quality: false },
  { key: 'acidity_score', label: 'Acidity', quality: false },
  { key: 'bitterness_score', label: 'Bitterness', quality: false },
]

const leverValue = (s: ShotWithCoffee, l: LeverId) => LEVERS[l].valueOf(s)
const metricValue = (s: ShotWithCoffee, k: TasteMetric | string) =>
  (s[k as keyof ShotWithCoffee] as number | null) ?? null

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function EspressoAnalysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const [roastDateId, setRoastDateId] = useState('')
  const [grinderId, setGrinderId] = useState('')
  const [mode, setMode] = useState<Mode>('goal')
  const userPicked = useRef(false)

  const { data: coffees = [] } = useCoffees()
  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const { data: grinders = [] } = useGrinders()
  // Alle Espresso-Shots (Default-Kaffee ableiten); danach client-seitig filtern.
  const { data: allShots = [] } = useShots(undefined, undefined, 'espresso')

  // Default = Kaffee des neuesten Shots (Shots kommen pulled_at desc).
  useEffect(() => {
    if (!userPicked.current && !coffeeId && allShots.length > 0) {
      setCoffeeId(allShots[0].coffee_id)
    }
  }, [allShots, coffeeId])

  const shots = allShots.filter(s =>
    (!coffeeId || s.coffee_id === coffeeId) &&
    (!roastDateId || s.roast_date_id === roastDateId) &&
    (!grinderId || s.grinder_id === grinderId)
  )

  return (
    <div>
      {/* Filters — per coffee */}
      <div className="grid gap-2 mb-4">
        <Select value={coffeeId} onChange={e => { userPicked.current = true; setCoffeeId(e.target.value); setRoastDateId('') }}>
          <option value="">Pick a coffee…</option>
          {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
        </Select>

        {coffeeId && roastDates.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setRoastDateId('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roastDateId === '' ? 'border-coffee-accent bg-coffee-accent/10 text-coffee-accent-soft' : 'border-coffee-line text-coffee-muted bg-coffee-bg'}`}>
              All roasts
            </button>
            {roastDates.map((rd, i) => (
              <button key={rd.id} onClick={() => setRoastDateId(rd.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roastDateId === rd.id ? 'border-coffee-accent bg-coffee-accent/10 text-coffee-accent-soft' : 'border-coffee-line text-coffee-muted bg-coffee-bg'}`}>
                {formatDate(rd.roast_date)}{i === 0 ? ' (current)' : ''}
              </button>
            ))}
          </div>
        )}

        {grinders.length > 1 && (
          <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
            <option value="">All grinders</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        )}
      </div>

      {!coffeeId ? (
        <p className="text-center text-coffee-muted text-sm py-10">
          Pick a coffee — analysis only makes sense per coffee (every coffee dials in differently; a light and a dark roast aren't comparable).
        </p>
      ) : shots.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No espresso shots for this coffee yet.</p>
      ) : (
        <>
          {/* Mode sub-tabs */}
          <div className="flex gap-1 mb-5 bg-coffee-bg rounded-lg p-1">
            {MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${mode === m.key ? 'bg-coffee-surface2 text-coffee-cream shadow-sm' : 'text-coffee-muted hover:text-coffee-text'}`}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'goal' && (
            <GoalSteer items={shots} goals={ESPRESSO_GOALS} leverValue={leverValue} metricValue={metricValue} />
          )}
          {mode === 'diagnose' && <ShotDiagnosis shots={shots} />}
          {mode === 'explore' && (
            <LeverExplorer items={shots} levers={EXPLORER_LEVERS} metrics={EXPLORER_METRICS}
              leverValue={leverValue} metricValue={metricValue} />
          )}
        </>
      )}
    </div>
  )
}
