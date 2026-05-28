import { useState } from 'react'
import {
  useCoffees, useCreateCoffee, useDeleteCoffee,
  useRoastDates, useCreateRoastDate, useDeleteRoastDate,
} from '../hooks/useCoffees'
import { RatingInput } from '../components/RatingInput'
import type { Coffee } from '../types'

type View = 'list' | 'detail' | 'new'

export function CoffeeManager() {
  const [view, setView] = useState<View>('list')
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null)

  if (view === 'new') return <NewCoffeeForm onBack={() => setView('list')} />
  if (view === 'detail' && selectedCoffee) {
    return (
      <CoffeeDetail
        coffee={selectedCoffee}
        onBack={() => { setView('list'); setSelectedCoffee(null) }}
        onDelete={() => { setView('list'); setSelectedCoffee(null) }}
      />
    )
  }

  return <CoffeeList onSelect={c => { setSelectedCoffee(c); setView('detail') }} onNew={() => setView('new')} />
}

function CoffeeList({ onSelect, onNew }: { onSelect: (c: Coffee) => void; onNew: () => void }) {
  const { data: coffees = [], isLoading } = useCoffees()

  function beanLabel(c: Coffee) {
    if (c.arabica_pct !== null && c.robusta_pct !== null)
      return `${c.arabica_pct}% Arabica · ${c.robusta_pct}% Robusta`
    if (c.arabica_pct === 100) return '100% Arabica'
    if (c.robusta_pct === 100) return '100% Robusta'
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">☕ Kaffees</h1>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid gap-2">
        {coffees.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-left w-full hover:border-orange-300 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-800 text-sm">{c.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {[c.roaster, beanLabel(c)].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {c.roast_level && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                  Röstgrad {c.roast_level}
                </span>
              )}
              <span className="text-slate-300 text-lg">›</span>
            </div>
          </button>
        ))}
        {!isLoading && coffees.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">
            Noch keine Kaffees. Füge deinen ersten hinzu!
          </p>
        )}
      </div>
    </div>
  )
}

function CoffeeDetail({ coffee, onBack, onDelete }: { coffee: Coffee; onBack: () => void; onDelete: () => void }) {
  const deleteCoffee = useDeleteCoffee()
  const { data: roastDates = [] } = useRoastDates(coffee.id)
  const createRoastDate = useCreateRoastDate()
  const deleteRoastDate = useDeleteRoastDate()
  const [showAll, setShowAll] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [showAddDate, setShowAddDate] = useState(false)

  const displayDates = showAll ? roastDates : roastDates.slice(0, 2)

  async function handleDeleteCoffee() {
    if (!confirm(`"${coffee.name}" wirklich löschen?`)) return
    await deleteCoffee.mutateAsync(coffee.id)
    onDelete()
  }

  async function handleAddDate(e: React.FormEvent) {
    e.preventDefault()
    if (!newDate) return
    await createRoastDate.mutateAsync({ coffee_id: coffee.id, roast_date: newDate })
    setNewDate('')
    setShowAddDate(false)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">{coffee.name}</h1>
        </div>
        <button onClick={handleDeleteCoffee} className="text-slate-300 hover:text-red-400 text-sm px-2">
          Löschen
        </button>
      </div>

      {coffee.roaster && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Rösterei</p>
          <p className="text-sm text-slate-800">{coffee.roaster}</p>
        </div>
      )}

      {(coffee.arabica_pct !== null || coffee.robusta_pct !== null) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Bohnenart</p>
          <div className="flex gap-3">
            {coffee.arabica_pct !== null && (
              <span className="text-sm text-slate-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                Arabica {coffee.arabica_pct}%
              </span>
            )}
            {coffee.robusta_pct !== null && (
              <span className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                Robusta {coffee.robusta_pct}%
              </span>
            )}
          </div>
        </div>
      )}

      {coffee.roast_level !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Röstgrad</p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <div
                key={n}
                className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
                  n === coffee.roast_level ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-300 mt-1">
            <span>hell</span><span>dunkel</span>
          </div>
        </div>
      )}

      {(coffee.origin_country || coffee.origin_region || coffee.altitude_m) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Rohkaffee</p>
          <div className="grid gap-1">
            {coffee.origin_country && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Land</span>
                <span className="text-slate-800">{coffee.origin_country}</span>
              </div>
            )}
            {coffee.origin_region && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Region</span>
                <span className="text-slate-800">{coffee.origin_region}</span>
              </div>
            )}
            {coffee.altitude_m && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Anbauhöhe</span>
                <span className="text-slate-800">{coffee.altitude_m} m</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-slate-400 uppercase font-semibold">Röstdaten</p>
          <button onClick={() => setShowAddDate(v => !v)} className="text-xs text-orange-500 font-semibold">
            {showAddDate ? 'Abbrechen' : '+ Hinzufügen'}
          </button>
        </div>

        {showAddDate && (
          <form onSubmit={handleAddDate} className="flex gap-2 mb-3">
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              type="submit"
              disabled={createRoastDate.isPending}
              className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              OK
            </button>
          </form>
        )}

        {roastDates.length === 0 && !showAddDate && (
          <p className="text-slate-400 text-sm">Noch keine Röstdaten eingetragen.</p>
        )}

        <div className="grid gap-2">
          {displayDates.map((rd, i) => (
            <div key={rd.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-800">{formatDate(rd.roast_date)}</span>
                {i === 0 && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">Aktuell</span>}
              </div>
              <button
                onClick={() => deleteRoastDate.mutate({ id: rd.id, coffeeId: coffee.id })}
                className="text-slate-300 hover:text-red-400 text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {roastDates.length > 2 && (
          <button onClick={() => setShowAll(v => !v)} className="text-xs text-slate-400 mt-2 hover:text-slate-600">
            {showAll ? 'Weniger anzeigen' : `${roastDates.length - 2} weitere anzeigen`}
          </button>
        )}
      </div>
    </div>
  )
}

function NewCoffeeForm({ onBack }: { onBack: () => void }) {
  const createCoffee = useCreateCoffee()

  const [name, setName] = useState('')
  const [roaster, setRoaster] = useState('')
  const [hasArabica, setHasArabica] = useState(false)
  const [hasRobusta, setHasRobusta] = useState(false)
  const [arabicaPct, setArabicaPct] = useState('100')
  const [robustaPct, setRobustaPct] = useState('0')
  const [roastLevel, setRoastLevel] = useState<number | null>(null)
  const [originCountry, setOriginCountry] = useState('')
  const [originRegion, setOriginRegion] = useState('')
  const [altitudeM, setAltitudeM] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name ist erforderlich.'); return }

    let arabica: number | null = null
    let robusta: number | null = null
    if (hasArabica && hasRobusta) {
      arabica = parseInt(arabicaPct, 10)
      robusta = parseInt(robustaPct, 10)
    } else if (hasArabica) {
      arabica = 100
    } else if (hasRobusta) {
      robusta = 100
    }

    await createCoffee.mutateAsync({
      name: name.trim(),
      roaster: roaster.trim() || null,
      origin: null,
      roast_date: null,
      notes: null,
      arabica_pct: arabica,
      robusta_pct: robusta,
      roast_level: roastLevel,
      origin_country: originCountry.trim() || null,
      origin_region: originRegion.trim() || null,
      altitude_m: altitudeM ? parseInt(altitudeM, 10) : null,
    })
    onBack()
  }

  const isBlend = hasArabica && hasRobusta

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Neuer Kaffee</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name *"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <input
            value={roaster}
            onChange={e => setRoaster(e.target.value)}
            placeholder="Rösterei"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Bohnenart</p>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasArabica}
                onChange={e => setHasArabica(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Arabica
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasRobusta}
                onChange={e => setHasRobusta(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Robusta
            </label>
          </div>
          {isBlend && (
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Arabica %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={arabicaPct}
                  onChange={e => {
                    setArabicaPct(e.target.value)
                    setRobustaPct(String(100 - parseInt(e.target.value || '0', 10)))
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Robusta %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={robustaPct}
                  onChange={e => {
                    setRobustaPct(e.target.value)
                    setArabicaPct(String(100 - parseInt(e.target.value || '0', 10)))
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Röstgrad</p>
          <RatingInput value={roastLevel} onChange={setRoastLevel} />
          <div className="flex justify-between text-xs text-slate-300 mt-1 px-0.5">
            <span>hell</span>
            <span>dunkel</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Rohkaffee</p>
          <div className="grid gap-3">
            <input
              value={originCountry}
              onChange={e => setOriginCountry(e.target.value)}
              placeholder="Herkunft (Land)"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              value={originRegion}
              onChange={e => setOriginRegion(e.target.value)}
              placeholder="Herkunft (Region)"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={altitudeM}
                onChange={e => setAltitudeM(e.target.value)}
                placeholder="Anbauhöhe"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              <span className="text-sm text-slate-400">m ü.M.</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createCoffee.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {createCoffee.isPending ? 'Speichern...' : 'Kaffee speichern'}
        </button>
      </form>
    </div>
  )
}
