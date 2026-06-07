import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { useRoasters, useCreateRoaster, useUpdateRoaster, useDeleteRoaster, searchAddresses, type GeoResult } from '../hooks/useRoasters'
import { useCoffeesByRoaster } from '../hooks/useCoffees'
import { RoasterMap } from '../components/RoasterMap'
import { PhotoUpload } from '../components/PhotoUpload'
import { cardClasses, Badge, Input, FieldLabel, buttonClasses } from '../components/ui'
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
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">Roasters</h1>
        <button onClick={onNew} className="bg-coffee-accent text-coffee-bg text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-coffee-accent-soft">
          + New
        </button>
      </div>

      {withCoords.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden border border-coffee-line">
          <RoasterMap roasters={roasters} height="200px" zoom={6} />
        </div>
      )}

      {isLoading && <p className="text-coffee-muted text-sm text-center py-6">Loading...</p>}

      <div className="grid gap-2">
        {roasters.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className={`${cardClasses} p-3 flex justify-between items-center text-left w-full transition-colors hover:border-coffee-accent/40`}
          >
            <div className="flex items-center gap-3">
              {r.photo_url ? (
                <img src={r.photo_url} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-coffee-surface2 flex items-center justify-center flex-shrink-0">
                  <span className="text-coffee-muted font-bold text-sm">{r.name[0]}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-coffee-cream text-sm">{r.name}</p>
                {r.address && <p className="text-xs text-coffee-muted mt-0.5 truncate max-w-[180px]">{r.address}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.lat !== null && (
                <span className="text-coffee-muted bg-coffee-surface2 px-1.5 py-0.5 rounded inline-flex items-center">
                  <MapPin size={12} />
                </span>
              )}
              <span className="text-coffee-muted/60 text-lg">›</span>
            </div>
          </button>
        ))}
        {!isLoading && roasters.length === 0 && (
          <p className="text-center text-coffee-muted text-sm py-10">No roasters yet. Add your first!</p>
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
    if (!confirm(`Delete "${roaster.name}"?`)) return
    await deleteRoaster.mutateAsync(roaster.id)
    onDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
          <h1 className="font-display text-2xl font-semibold text-coffee-cream">{roaster.name}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-coffee-accent-soft text-sm font-semibold">Edit</button>
          <button onClick={handleDelete} className="text-coffee-muted hover:text-red-400 text-sm">Delete</button>
        </div>
      </div>

      {roaster.lat !== null && roaster.lng !== null && (
        <div className="mb-4 rounded-xl overflow-hidden border border-coffee-line">
          <RoasterMap
            roasters={[roaster]}
            center={{ lat: roaster.lat, lng: roaster.lng }}
            height="240px"
            zoom={14}
          />
        </div>
      )}

      <div className={`${cardClasses} p-4 grid gap-2`}>
        {roaster.address && (
          <div className="flex justify-between text-sm">
            <span className="text-coffee-muted">Address</span>
            <span className="text-coffee-cream text-right max-w-[200px]">{roaster.address}</span>
          </div>
        )}
        {roaster.website && (
          <div className="flex justify-between text-sm items-center">
            <span className="text-coffee-muted">Website</span>
            <a href={roaster.website} target="_blank" rel="noopener noreferrer" className="text-coffee-accent-soft text-sm truncate max-w-[200px]">
              {roaster.website.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
        )}
        {!roaster.address && !roaster.website && (
          <p className="text-coffee-muted text-sm">No additional info entered.</p>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-2">
          Coffees by this Roaster
        </p>
        {coffees.length === 0 ? (
          <p className={`${cardClasses} text-coffee-muted text-sm text-center py-4`}>
            No coffees from this roaster yet.
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
    <div className={`${cardClasses} p-3 flex justify-between items-center`}>
      <div>
        <p className="font-medium text-coffee-cream text-sm">{coffee.name}</p>
        {details && <p className="text-xs text-coffee-muted mt-0.5">{details}</p>}
      </div>
      {coffee.roast_level !== null && (
        <Badge className="whitespace-nowrap">Roast Level {coffee.roast_level}</Badge>
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(roaster?.photo_url ?? null)
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
    if (!name.trim()) { setError('Name is required.'); return }
    const payload = {
      name: name.trim(),
      address: address.trim() || null,
      lat,
      lng,
      website: website.trim() || null,
      photo_url: photoUrl,
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
          <button type="button" onClick={() => onBack()} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
          <h1 className="font-display text-2xl font-semibold text-coffee-cream">{isEdit ? 'Edit Roaster' : 'New Roaster'}</h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <FieldLabel required>Name</FieldLabel>
          <div className="flex gap-3 items-start">
            <PhotoUpload
              bucket="roaster-photos"
              value={photoUrl}
              onChange={setPhotoUrl}
              name={name}
            />
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Five Elephant"
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Address</FieldLabel>
          <div className="relative">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={e => { setQuery(e.target.value); setLat(null); setLng(null) }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Street, city..."
                className="flex-1"
              />
              {searching && <span className="self-center text-xs text-coffee-muted pr-1">…</span>}
            </div>
            {showSuggestions && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-coffee-surface border border-coffee-line rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm text-coffee-text hover:bg-coffee-surface2 border-b border-coffee-line last:border-0 inline-flex items-center gap-1.5"
                  >
                    <MapPin size={13} className="text-coffee-accent-soft shrink-0" />
                    {s.displayName.split(',').slice(0, 4).join(', ')}
                  </button>
                ))}
              </div>
            )}
          </div>
          {lat !== null && <p className="text-green-400 text-xs mt-1">✓ Location found</p>}
        </div>

        {lat !== null && lng !== null && !compact && (
          <div className="rounded-xl overflow-hidden border border-coffee-line">
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
            <FieldLabel>Website</FieldLabel>
            <Input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}
        >
          {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Roaster'}
        </button>
      </form>
    </div>
  )
}
