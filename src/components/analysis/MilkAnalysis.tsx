import { useState } from 'react'
import { useCoffees } from '../../hooks/useCoffees'
import { useShots } from '../../hooks/useShots'
import { Select } from '../ui'
import { drinkTypeLabel } from '../../utils/drinkTypes'

export function MilkAnalysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const { data: coffees = [] } = useCoffees()
  const { data: shots = [] }   = useShots(coffeeId || undefined, undefined, 'milk')

  const byType = shots.reduce<Record<string, { count: number; ratingSum: number }>>((acc, s) => {
    if (!acc[s.drink_type]) acc[s.drink_type] = { count: 0, ratingSum: 0 }
    acc[s.drink_type].count++
    acc[s.drink_type].ratingSum += s.rating
    return acc
  }, {})

  const sorted = Object.entries(byType).sort((a, b) => b[1].count - a[1].count)

  return (
    <div>
      <Select value={coffeeId} onChange={e => setCoffeeId(e.target.value)} className="mb-4">
        <option value="">All Coffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
      </Select>

      {shots.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No milk drinks yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-coffee-surface2 border border-coffee-line rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-coffee-accent-soft">{shots.length}</p>
              <p className="text-xs text-coffee-muted mt-0.5">Drinks total</p>
            </div>
            <div className="bg-coffee-surface2 border border-coffee-line rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {(shots.reduce((s, x) => s + x.rating, 0) / shots.length).toFixed(1)}
              </p>
              <p className="text-xs text-coffee-muted mt-0.5">Avg Rating</p>
            </div>
          </div>

          <div className="bg-coffee-surface2 border border-coffee-line rounded-lg overflow-hidden">
            <p className="text-xs font-semibold text-coffee-muted uppercase tracking-wide p-3 border-b border-coffee-line">
              By Drink Type
            </p>
            {sorted.map(([type, { count, ratingSum }]) => (
              <div key={type} className="flex items-center justify-between px-4 py-3 border-b border-coffee-line last:border-0">
                <span className="text-sm text-coffee-text">{drinkTypeLabel(type)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-coffee-muted">{count}×</span>
                  <span className="text-sm font-semibold text-coffee-cream">
                    Avg {(ratingSum / count).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
