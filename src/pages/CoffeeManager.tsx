import { useState } from 'react'
import {
  useCoffees, useCreateCoffee, useUpdateCoffee, useDeleteCoffee,
  useRoastDates, useCreateRoastDate, useDeleteRoastDate,
} from '../hooks/useCoffees'
import { useRoasters } from '../hooks/useRoasters'
import { RoasterForm } from './Roasters'
import { RatingInput } from '../components/RatingInput'
import { PhotoUpload } from '../components/PhotoUpload'
import { RoasterRecipeFields, initialRecipe, recipePayload } from '../components/RoasterRecipeFields'
import { cardClasses, Badge, Input, Select, buttonClasses, EmptyState } from '../components/ui'
import type { Coffee, Roaster } from '../types'

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
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">Coffees</h1>
        <button onClick={onNew} className="bg-coffee-accent text-coffee-bg text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-coffee-accent-soft">
          + New
        </button>
      </div>

      {isLoading && <p className="text-coffee-muted text-sm text-center py-6">Loading...</p>}

      <div className="grid gap-2">
        {coffees.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`${cardClasses} p-3 flex justify-between items-center text-left w-full transition-colors hover:border-coffee-accent/40`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {c.photo_url ? (
                <img src={c.photo_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-coffee-surface2 flex items-center justify-center flex-shrink-0">
                  <span className="text-coffee-muted font-bold text-sm">{c.name[0]}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-coffee-cream text-sm">{c.name}</p>
                <p className="text-xs text-coffee-muted mt-0.5">
                  {[c.roaster, beanLabel(c)].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {c.roast_level && (
                <Badge className="whitespace-nowrap">Roast {c.roast_level}</Badge>
              )}
              <span className="text-coffee-muted/60 text-lg">›</span>
            </div>
          </button>
        ))}
        {!isLoading && coffees.length === 0 && (
          <EmptyState
            headline="Add a bag to start dialling in."
            description="Every shot needs its bean."
            action={
              <button onClick={onNew} className="mt-2 rounded-xl bg-coffee-accent px-5 py-2.5 text-sm font-semibold text-coffee-bg hover:bg-coffee-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent-soft">
                + New Coffee
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}

function CoffeeDetail({ coffee, onBack, onDelete }: { coffee: Coffee; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <EditCoffeeForm coffee={coffee} onBack={() => setEditing(false)} />
  }

  return <CoffeeDetailView coffee={coffee} onBack={onBack} onDelete={onDelete} onEdit={() => setEditing(true)} />
}

function CoffeeDetailView({
  coffee, onBack, onDelete, onEdit,
}: { coffee: Coffee; onBack: () => void; onDelete: () => void; onEdit: () => void }) {
  const deleteCoffee = useDeleteCoffee()
  const { data: roastDates = [] } = useRoastDates(coffee.id)
  const createRoastDate = useCreateRoastDate()
  const deleteRoastDate = useDeleteRoastDate()
  const [showAll, setShowAll] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [showAddDate, setShowAddDate] = useState(false)

  const displayDates = showAll ? roastDates : roastDates.slice(0, 2)

  async function handleDeleteCoffee() {
    if (!confirm(`Delete "${coffee.name}"?`)) return
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
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
          <h1 className="font-display text-2xl font-semibold text-coffee-cream">{coffee.name}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={onEdit} className="text-coffee-accent-soft text-sm font-semibold">
            Edit
          </button>
          <button onClick={handleDeleteCoffee} className="text-coffee-muted hover:text-red-400 text-sm">
            Delete
          </button>
        </div>
      </div>

      {coffee.roaster && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Roaster</p>
          <p className="text-sm text-coffee-cream">{coffee.roaster}</p>
        </div>
      )}

      {(coffee.arabica_pct !== null || coffee.robusta_pct !== null) && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Bean Type</p>
          <div className="flex gap-3">
            {coffee.arabica_pct !== null && (
              <Badge>Arabica {coffee.arabica_pct}%</Badge>
            )}
            {coffee.robusta_pct !== null && (
              <Badge>Robusta {coffee.robusta_pct}%</Badge>
            )}
          </div>
        </div>
      )}

      {coffee.roast_level !== null && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Roast Level</p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <div
                key={n}
                className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
                  n === coffee.roast_level ? 'bg-coffee-accent text-coffee-bg' : 'bg-coffee-surface2 text-coffee-muted'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-coffee-muted/60 mt-1">
            <span>light</span><span>dark</span>
          </div>
        </div>
      )}

      {(coffee.origin_country || coffee.origin_region || coffee.altitude_m) && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Origin</p>
          <div className="grid gap-1">
            {coffee.origin_country && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Country</span>
                <span className="text-coffee-cream">{coffee.origin_country}</span>
              </div>
            )}
            {coffee.origin_region && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Region</span>
                <span className="text-coffee-cream">{coffee.origin_region}</span>
              </div>
            )}
            {coffee.altitude_m && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Altitude</span>
                <span className="text-coffee-cream">{coffee.altitude_m} m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(coffee.rec_dose_g != null || coffee.rec_yield_g != null || coffee.rec_temp_c != null || coffee.rec_time_s != null || coffee.rec_grind_note) && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Roaster Recipe</p>
          <div className="grid gap-1">
            {coffee.rec_dose_g != null && coffee.rec_yield_g != null && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Ratio</span>
                <span className="text-coffee-cream">{coffee.rec_dose_g}g → {coffee.rec_yield_g}g</span>
              </div>
            )}
            {coffee.rec_temp_c != null && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Temperature</span>
                <span className="text-coffee-cream">{coffee.rec_temp_c} °C</span>
              </div>
            )}
            {coffee.rec_time_s != null && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Time</span>
                <span className="text-coffee-cream">{coffee.rec_time_s}s</span>
              </div>
            )}
            {coffee.rec_grind_note && (
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-coffee-muted">Grind</span>
                <span className="text-coffee-cream text-right">{coffee.rec_grind_note}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`${cardClasses} p-3`}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-coffee-muted uppercase font-semibold">Roast Dates</p>
          <button onClick={() => setShowAddDate(v => !v)} className="text-xs text-coffee-accent-soft font-semibold">
            {showAddDate ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showAddDate && (
          <form onSubmit={handleAddDate} className="flex gap-2 mb-3">
            <Input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="flex-1 py-1.5"
            />
            <button
              type="submit"
              disabled={createRoastDate.isPending}
              className="bg-coffee-accent text-coffee-bg text-sm px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              OK
            </button>
          </form>
        )}

        {roastDates.length === 0 && !showAddDate && (
          <p className="text-coffee-muted text-sm">No roast dates yet.</p>
        )}

        <div className="grid gap-2">
          {displayDates.map((rd, i) => (
            <div key={rd.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-coffee-cream">{formatDate(rd.roast_date)}</span>
                {i === 0 && <Badge>Current</Badge>}
              </div>
              <button
                onClick={() => deleteRoastDate.mutate({ id: rd.id, coffeeId: coffee.id })}
                className="text-coffee-muted hover:text-red-400 text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {roastDates.length > 2 && (
          <button onClick={() => setShowAll(v => !v)} className="text-xs text-coffee-muted mt-2 hover:text-coffee-cream">
            {showAll ? 'Show less' : `Show ${roastDates.length - 2} more`}
          </button>
        )}
      </div>
    </div>
  )
}

function EditCoffeeForm({ coffee, onBack }: { coffee: Coffee; onBack: () => void }) {
  const updateCoffee = useUpdateCoffee()
  const { data: roasters = [] } = useRoasters()

  const [name, setName] = useState(coffee.name)
  const [roasterId, setRoasterId] = useState(coffee.roaster_id ?? '')
  const [hasArabica, setHasArabica] = useState(coffee.arabica_pct !== null)
  const [hasRobusta, setHasRobusta] = useState(coffee.robusta_pct !== null)
  const [arabicaPct, setArabicaPct] = useState(String(coffee.arabica_pct ?? 100))
  const [robustaPct, setRobustaPct] = useState(String(coffee.robusta_pct ?? 0))
  const [roastLevel, setRoastLevel] = useState<number | null>(coffee.roast_level)
  const [originCountry, setOriginCountry] = useState(coffee.origin_country ?? '')
  const [originRegion, setOriginRegion] = useState(coffee.origin_region ?? '')
  const [altitudeM, setAltitudeM] = useState(coffee.altitude_m ? String(coffee.altitude_m) : '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(coffee.photo_url ?? null)
  const [recipe, setRecipe] = useState(initialRecipe(coffee))
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }

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

    const selectedRoaster = roasters.find(r => r.id === roasterId)
    await updateCoffee.mutateAsync({
      id: coffee.id,
      name: name.trim(),
      roaster_id: roasterId || null,
      roaster: selectedRoaster?.name ?? null,
      arabica_pct: arabica,
      robusta_pct: robusta,
      roast_level: roastLevel,
      origin_country: originCountry.trim() || null,
      origin_region: originRegion.trim() || null,
      altitude_m: altitudeM ? parseInt(altitudeM, 10) : null,
      photo_url: photoUrl,
      ...recipePayload(recipe),
    })
    onBack()
  }

  const isBlend = hasArabica && hasRobusta

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">Edit Coffee</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-3">
          <div className="flex gap-3 items-start">
            <PhotoUpload
              bucket="coffee-photos"
              value={photoUrl}
              onChange={setPhotoUrl}
              name={name}
            />
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name *"
              className="flex-1"
            />
          </div>
          <Select value={roasterId} onChange={e => setRoasterId(e.target.value)}>
            <option value="">No roaster</option>
            {roasters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          {roasters.length === 0 && (
            <p className="text-xs text-coffee-muted mt-1">No roasters yet — add one in the Roasters tab.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Bean Type</p>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input type="checkbox" checked={hasArabica} onChange={e => setHasArabica(e.target.checked)} className="h-4 w-4 accent-coffee-accent" />
              Arabica
            </label>
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input type="checkbox" checked={hasRobusta} onChange={e => setHasRobusta(e.target.checked)} className="h-4 w-4 accent-coffee-accent" />
              Robusta
            </label>
          </div>
          {isBlend && (
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs text-coffee-muted mb-1 block">Arabica %</label>
                <Input
                  type="number" min="0" max="100" value={arabicaPct}
                  onChange={e => { setArabicaPct(e.target.value); setRobustaPct(String(100 - parseInt(e.target.value || '0', 10))) }}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-coffee-muted mb-1 block">Robusta %</label>
                <Input
                  type="number" min="0" max="100" value={robustaPct}
                  onChange={e => { setRobustaPct(e.target.value); setArabicaPct(String(100 - parseInt(e.target.value || '0', 10))) }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Roast Level</p>
          <RatingInput value={roastLevel} onChange={setRoastLevel} />
          <div className="flex justify-between text-xs text-coffee-muted/60 mt-1 px-0.5">
            <span>light</span><span>dark</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Origin</p>
          <div className="grid gap-3">
            <Input value={originCountry} onChange={e => setOriginCountry(e.target.value)} placeholder="Country" />
            <Input value={originRegion} onChange={e => setOriginRegion(e.target.value)} placeholder="Region" />
            <div className="flex items-center gap-2">
              <Input type="number" value={altitudeM} onChange={e => setAltitudeM(e.target.value)} placeholder="Altitude" className="flex-1" />
              <span className="text-sm text-coffee-muted">m</span>
            </div>
          </div>
        </div>

        <RoasterRecipeFields value={recipe} onChange={setRecipe} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={updateCoffee.isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}
        >
          {updateCoffee.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function NewCoffeeForm({ onBack }: { onBack: () => void }) {
  const createCoffee = useCreateCoffee()
  const { data: roasters = [] } = useRoasters()

  const [name, setName] = useState('')
  const [roasterId, setRoasterId] = useState('')
  const [showNewRoaster, setShowNewRoaster] = useState(false)
  const [hasArabica, setHasArabica] = useState(false)
  const [hasRobusta, setHasRobusta] = useState(false)
  const [arabicaPct, setArabicaPct] = useState('100')
  const [robustaPct, setRobustaPct] = useState('0')
  const [roastLevel, setRoastLevel] = useState<number | null>(null)
  const [originCountry, setOriginCountry] = useState('')
  const [originRegion, setOriginRegion] = useState('')
  const [altitudeM, setAltitudeM] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [recipe, setRecipe] = useState(initialRecipe())
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }

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

    const selectedRoaster = roasters.find(r => r.id === roasterId)
    await createCoffee.mutateAsync({
      name: name.trim(),
      roaster_id: roasterId || null,
      roaster: selectedRoaster?.name ?? null,
      origin: null,
      roast_date: null,
      notes: null,
      arabica_pct: arabica,
      robusta_pct: robusta,
      roast_level: roastLevel,
      origin_country: originCountry.trim() || null,
      origin_region: originRegion.trim() || null,
      altitude_m: altitudeM ? parseInt(altitudeM, 10) : null,
      photo_url: photoUrl,
      ...recipePayload(recipe),
    })
    onBack()
  }

  const isBlend = hasArabica && hasRobusta

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">New Coffee</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-3">
          <div className="flex gap-3 items-start">
            <PhotoUpload
              bucket="coffee-photos"
              value={photoUrl}
              onChange={setPhotoUrl}
              name={name}
            />
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name *"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roasterId} onChange={e => setRoasterId(e.target.value)} className="flex-1">
              <option value="">No roaster</option>
              {roasters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            <button
              type="button"
              onClick={() => setShowNewRoaster(v => !v)}
              className="px-3 py-2 border border-coffee-line rounded-lg text-sm text-coffee-muted hover:bg-coffee-surface2 whitespace-nowrap"
            >
              {showNewRoaster ? 'Cancel' : '+ New'}
            </button>
          </div>
          {showNewRoaster && (
            <div className="mt-2 border border-coffee-line rounded-lg p-3 bg-coffee-surface2">
              <p className="text-xs font-semibold text-coffee-accent-soft uppercase mb-2">New Roaster</p>
              <RoasterForm
                compact
                onBack={(created?: Roaster) => {
                  if (created) setRoasterId(created.id)
                  setShowNewRoaster(false)
                }}
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Bean Type</p>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input
                type="checkbox"
                checked={hasArabica}
                onChange={e => setHasArabica(e.target.checked)}
                className="h-4 w-4 accent-coffee-accent"
              />
              Arabica
            </label>
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input
                type="checkbox"
                checked={hasRobusta}
                onChange={e => setHasRobusta(e.target.checked)}
                className="h-4 w-4 accent-coffee-accent"
              />
              Robusta
            </label>
          </div>
          {isBlend && (
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs text-coffee-muted mb-1 block">Arabica %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={arabicaPct}
                  onChange={e => {
                    setArabicaPct(e.target.value)
                    setRobustaPct(String(100 - parseInt(e.target.value || '0', 10)))
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-coffee-muted mb-1 block">Robusta %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={robustaPct}
                  onChange={e => {
                    setRobustaPct(e.target.value)
                    setArabicaPct(String(100 - parseInt(e.target.value || '0', 10)))
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Roast Level</p>
          <RatingInput value={roastLevel} onChange={setRoastLevel} />
          <div className="flex justify-between text-xs text-coffee-muted/60 mt-1 px-0.5">
            <span>light</span>
            <span>dark</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Origin</p>
          <div className="grid gap-3">
            <Input value={originCountry} onChange={e => setOriginCountry(e.target.value)} placeholder="Country" />
            <Input value={originRegion} onChange={e => setOriginRegion(e.target.value)} placeholder="Region" />
            <div className="flex items-center gap-2">
              <Input type="number" value={altitudeM} onChange={e => setAltitudeM(e.target.value)} placeholder="Altitude" className="flex-1" />
              <span className="text-sm text-coffee-muted">m</span>
            </div>
          </div>
        </div>

        <RoasterRecipeFields value={recipe} onChange={setRecipe} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createCoffee.isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}
        >
          {createCoffee.isPending ? 'Saving...' : 'Save Coffee'}
        </button>
      </form>
    </div>
  )
}
