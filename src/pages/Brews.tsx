import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useCoffees } from '../hooks/useCoffees'
import { useBrews } from '../hooks/useBrews'
import { BrewCard } from '../components/BrewCard'
import { Select, EmptyState, PageHeader } from '../components/ui'

type MethodFilter = 'all' | 'french_press' | 'v60' | 'aeropress' | 'moka_pot'

const METHOD_FILTER_LABELS: Record<MethodFilter, string> = {
  all: 'All',
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
      <PageHeader
        eyebrow="Filter & pour-over"
        title="Brews"
        action={
          <Link to={ROUTES.brewNew} className="bg-coffee-accent text-coffee-bg text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-coffee-accent-soft">
            + New
          </Link>
        }
      />

      <div className="flex border-b border-coffee-line mb-4 overflow-x-auto">
        {(['all', 'french_press', 'v60', 'aeropress', 'moka_pot'] as const).map(f => (
          <button
            key={f}
            onClick={() => setMethodFilter(f)}
            className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              methodFilter === f
                ? 'text-coffee-accent-soft border-b-2 border-coffee-accent -mb-px'
                : 'text-coffee-muted hover:text-coffee-cream'
            }`}
          >
            {METHOD_FILTER_LABELS[f]}
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
        {brews.map(brew => <BrewCard key={brew.id} brew={brew} />)}
        {!isLoading && brews.length === 0 && (
          filterCoffeeId || methodFilter !== 'all' ? (
            <p className="text-center text-coffee-muted text-sm py-10 md:col-span-2">No brews match this filter.</p>
          ) : (
            <EmptyState
              className="md:col-span-2"
              headline="Time to bloom."
              description="Log a filter brew to start tracking."
              ctaLabel="+ New Brew"
              ctaTo={ROUTES.brewNew}
            />
          )
        )}
      </div>
    </div>
  )
}
