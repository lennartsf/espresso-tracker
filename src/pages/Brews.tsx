import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useBrews } from '../hooks/useBrews'
import { BrewCard } from '../components/BrewCard'

type MethodFilter = 'all' | 'french_press' | 'v60' | 'aeropress' | 'moka_pot'

const METHOD_FILTER_LABELS: Record<MethodFilter, string> = {
  all: 'Alle',
  french_press: 'French Press',
  v60: 'V60',
  aeropress: 'AeroPress',
  moka_pot: 'Moka Pot',
}

export function Brews() {
  const [filterCoffeeId, setFilterCoffeeId] = useState('')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const { data: coffees = [] } = useCoffees()
  const { data: brews = [], isLoading } = useBrews(
    filterCoffeeId || undefined,
    methodFilter === 'all' ? undefined : methodFilter,
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">🫖 Brühen</h1>
        <Link to="/brews/new" className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </Link>
      </div>

      <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
        {(['all', 'french_press', 'v60', 'aeropress', 'moka_pot'] as const).map(f => (
          <button
            key={f}
            onClick={() => setMethodFilter(f)}
            className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              methodFilter === f
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {METHOD_FILTER_LABELS[f]}
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
        {brews.map(brew => <BrewCard key={brew.id} brew={brew} />)}
        {!isLoading && brews.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10 md:col-span-2">
            Noch keine Brews. Füge deinen ersten hinzu!
          </p>
        )}
      </div>
    </div>
  )
}
