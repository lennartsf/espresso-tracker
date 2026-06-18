import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useCoffees } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'
import { Select, EmptyState, PageHeader } from '../components/ui'

type DrinkFilter = 'all' | 'espresso' | 'milk'

const DRINK_FILTER_LABELS: Record<DrinkFilter, string> = {
  all: 'All',
  espresso: 'Espresso',
  milk: 'Milk Drinks',
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
      <PageHeader
        eyebrow="Your pulls"
        title="Shots"
        action={
          <Link
            to={ROUTES.shotNew}
            className="bg-coffee-accent text-coffee-bg text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-coffee-accent-soft"
          >
            + New
          </Link>
        }
      />

      <div className="flex border-b border-coffee-line mb-4">
        {(['all', 'espresso', 'milk'] as const).map(f => (
          <button
            key={f}
            onClick={() => setDrinkFilter(f)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              drinkFilter === f
                ? 'text-coffee-accent-soft border-b-2 border-coffee-accent -mb-px'
                : 'text-coffee-muted hover:text-coffee-cream'
            }`}
          >
            {DRINK_FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <Select
        value={filterCoffeeId}
        onChange={e => setFilterCoffeeId(e.target.value)}
        className="mb-4"
      >
        <option value="">All Coffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>

      {isLoading && <p className="text-coffee-muted text-sm text-center py-6">Loading...</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {shots.map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          filterCoffeeId || drinkFilter !== 'all' ? (
            <p className="text-center text-coffee-muted text-sm py-10 md:col-span-2">No shots match this filter.</p>
          ) : (
            <EmptyState
              className="md:col-span-2"
              headline="Your first pull awaits."
              description="Log a shot to start dialling in."
              ctaLabel="+ New Shot"
              ctaTo={ROUTES.shotNew}
            />
          )
        )}
      </div>
    </div>
  )
}
