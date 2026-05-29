import { useState, useEffect, useRef } from 'react'
import { useRoasters, useCreateRoaster, useUpdateRoaster, useDeleteRoaster, searchAddresses, type GeoResult } from '../hooks/useRoasters'
import { useCoffeesByRoaster } from '../hooks/useCoffees'
import { RoasterMap } from '../components/RoasterMap'
import type { Roaster, Coffee } from '../types'

type View = 'list' | 'detail' | 'new'

export function Roasters() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Roaster | null>(null)

  if (view === 'new') return <RoasterForm onBack={() => setView('list')} />
  if (view === 'detail' && selected) {
    return (
      <RoasterDetail
        roaster={selected}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }

  return <RoasterList onSelect={r => { setSelected(r); setView('detail') }} onNew={() => setView('new')} />
}

function RoasterList({ onSelect, onNew }: { onSelect: (r: Roaster) => void; onNew: () => void }) {
  const { data: roasters = [], isLoading } = useRoasters()
  const withCoords = roasters.filter(r => r.lat !== null)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">📍 Röstereien</h1>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>

      {withCoords.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
          <RoasterMap roasters={roasters} height="200px" zoom={6} />
        </div>
      )}

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid gap-2">
        {roasters.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-left w-full hover:border-orange-300 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-800 text-sm">{r.name}</p>
              {r.address && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{r.address}</p>}
            </div>
            <div className="flex items-center gap-2">
              {r.lat !== null && <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">📍</span>}
              <span className="text-slate-300 text-lg">›</span>
            </div>
          </button>
        ))}
        {!isLoading && roasters.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Röstereien. Füge deine erste hinzu!</p>
        )}
      </div>
    </div>
  )
}

function RoasterDetail({ roaster: initial, onBack, onDelete }: { roaster: Roaster; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const deleteRoaster = useDeleteRoaster()
  const { data: roasters = [] } = useRoasters()
  const { data: coffees = [] } = useCoffeesByRoaster(initial.id)
  // Always use fresh data from cache so edits are reflected immediately
  const roaster = roasters.find(r => r.id === initial.id) ?? initial

  if (editing) return <RoasterForm roaster={roaster} onBack={() => setEditing(false)} />


  async function handleDelete() {
    if (!confirm(`"${roaster.name}" wirklich löschen?`)) return
    await deleteRoaster.mutateAsync(roaster.id)
    onDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">{roaster.name}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>

      {roaster.lat !== null && roaster.lng !== null && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
          <RoasterMap
            roasters={[roaster]}
            center={{ lat: roaster.lat, lng: roaster.lng }}
            height="240px"
            zoom={14}
          />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 grid gap-2">
        {roaster.address && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Adresse</span>
            <span className="text-slate-800 text-right max-w-[200px]">{roaster.address}</span>
          </div>
        )}
        {roaster.website && (
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-400">Website</span>
            <a href={roaster.website} target="_blank" rel="noopener noreferrer" className="text-orange-500 text-sm truncate max-w-[200px]">
              {roaster.website.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
        )}
        {!roaster.address && !roaster.website && (
          <p className="text-slate-400 text-sm">Keine weiteren Infos hinterlegt.</p>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Kaffees dieser Rösterei
        </p>
        {coffees.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4 bg-white border border-slate-200 rounded-lg">
            Noch kein Kaffee dieser Rösterei eingetragen.
          </p>
        ) : (
          <div className="grid gap-2">
            {coffees.map(c => <RoasterCoffeeCard key={c.id} coffee={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function RoasterCoffeeCard({ coffee }: { coffee: Coffee }) {
  function beanLabel() {
    if (coffee.arabica_pct !== null && coffee.robusta_pct !== null)
      return `${coffee.arabica_pct}% Arabica · ${coffee.robusta_pct}% Robusta`
    if (coffee.arabica_pct === 100) return '100% Arabica'
    if (coffee.robusta_pct === 100) return '100% Robusta'
    return null
  }

  const origin = [coffee.origin_country, coffee.origin_region].filter(Boolean).join(', ')
  const details = [beanLabel(), origin].filter(Boolean).join(' · ')

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
      <div>
        <p className="font-medium text-slate-800 text-sm">{coffee.name}</p>
        {details && <p className="text-xs text-slate-400 mt-0.5">{details}</p>}
      </div>
      {coffee.roast_level !== null && (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">
          Röstgrad {coffee.roast_level}
        </span>
      )}
    </div>
  )
}

export function RoasterForm({ roaster, onBack, compact = false }: { roaster?: Roaster; onBack: (created?: Roaster) => void; compact?: boolean }) {
  const createRoaster = useCreateRoaster()
  const updateRoaster = useUpdateRoaster()
  const isEdit = !!roaster

  const [name, setName] = useState(roaster?.name ?? '')
  const [query, setQuery] = useState(roaster?.address ?? '')
  const [address, setAddress] = useState(roaster?.address ?? '')
  const [website, setWebsite] = useState(roaster?.website ?? '')
  const [lat, setLat] = useState<number | null>(roaster?.lat ?? null)
  const [lng, setLng] = useState<number | null>(roaster?.lng ?? null)
  const [suggestions, setSuggestions] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (lat !== null) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchAddresses(query)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setSearching(false)
    }, 500)
  }, [query, lat])

  function selectSuggestion(r: GeoResult) {
    setAddress(r.displayName.split(',').slice(0, 3).join(',').trim())
    setQuery(r.displayName.split(',').slice(0, 3).join(',').trim())
    setLat(r.lat)
    setLng(r.lng)
    setSuggestions([])
    setShowSuggestions(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = {
      name: name.trim(),
      address: address.trim() || null,
      lat,
      lng,
      website: website.trim() || null,
      photo_url: null,
    }
    let result: Roaster
    if (isEdit) {
      result = await updateRoaster.mutateAsync({ id: roaster.id, ...payload })
    } else {
      result = await createRoaster.mutateAsync(payload)
    }
    onBack(result)
  }

  const isPending = createRoaster.isPending || updateRoaster.isPending

  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => onBack()} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'Rösterei bearbeiten' : 'Neue Rösterei'}</h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name *</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z.B. Five Elephant"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Adresse</label>
          <div className="relative">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setLat(null); setLng(null) }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Straße, Stadt eingeben…"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              {searching && <span className="self-center text-xs text-slate-400 pr-1">…</span>}
            </div>
            {showSuggestions && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-orange-50 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-orange-500 mr-1.5">📍</span>
                    {s.displayName.split(',').slice(0, 4).join(', ')}
                  </button>
                ))}
              </div>
            )}
          </div>
          {lat !== null && <p className="text-green-600 text-xs mt-1">✓ Standort gefunden</p>}
        </div>

        {lat !== null && lng !== null && !compact && (
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <RoasterMap
              roasters={[{ id: 'preview', name, address, lat, lng, website: null, photo_url: null, created_at: '' }]}
              center={{ lat, lng }}
              height="180px"
              zoom={14}
            />
          </div>
        )}

        {!compact && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Website</label>
            <input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://..."
              type="url"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {isPending ? 'Speichern...' : isEdit ? 'Änderungen speichern' : 'Rösterei speichern'}
        </button>
      </form>
    </div>
  )
}
