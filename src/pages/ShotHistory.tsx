import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'

type DrinkFilter = 'all' | 'espresso' | 'milk'

const DRINK_FILTER_LABELS: Record<DrinkFilter, string> = {
  all: 'Alle',
  espresso: 'Espresso',
  milk: 'Milchgetränke',
}

export function ShotHistory() {
  const [filterCoffeeId, setFilterCoffeeId] = useState('')
  const [drinkFilter, setDrinkFilter] = useState<DrinkFilter>('all')
  const { data: coffees = [] } = useCoffees()
  const { data: shots = [], isLoading } = useShots(
    filterCoffeeId || undefined,
    undefined,
    drinkFilter === 'all' ? undefined : drinkFilter,
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">📋 Shots</h1>
        <Link
          to="/shots/new"
          className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          + Neu
        </Link>
      </div>

      <div className="flex border-b border-slate-200 mb-4">
        {(['all', 'espresso', 'milk'] as const).map(f => (
          <button
            key={f}
            onClick={() => setDrinkFilter(f)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              drinkFilter === f
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {DRINK_FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <select
        value={filterCoffeeId}
        onChange={e => setFilterCoffeeId(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-4 focus:outline-none focus:border-orange-400"
      >
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {shots.map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10 md:col-span-2">Keine Shots gefunden.</p>
        )}
      </div>
    </div>
  )
}
