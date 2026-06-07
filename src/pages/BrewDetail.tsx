import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useBrew, useUpdateBrew, useDeleteBrew } from '../hooks/useBrews'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders, useBrewDevices } from '../hooks/useEquipment'
import { RatingInput } from '../components/RatingInput'
import { ratingBadgeClasses } from '../utils/ratingColor'
import { brewMethodLabel, BREW_METHODS, BREW_METHOD_INFO } from '../utils/brewMethods'
import { secondsToMMSS, normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'
import { cardClasses, Badge, Input, Select, Textarea, FieldLabel, InfoButton, InfoBox, buttonClasses } from '../components/ui'
import type { BrewWithCoffee } from '../hooks/useBrews'

const RATING_INFO = {
  rating:          { question: 'How good does the brew taste overall?', low: 'barely drinkable', high: 'perfect brew'    },
  acidity_score:   { question: 'How pronounced is the acidity in the brew?', low: 'very mild',   high: 'bright & lively' },
  bitterness_score:{ question: 'How strong is the bitterness in the brew?', low: 'barely bitter', high: 'very bitter'    },
}

function RatingField({
  label, required, infoKey, value, onChange,
}: {
  label: string
  required?: boolean
  infoKey: keyof typeof RATING_INFO
  value: number | null
  onChange: (v: number) => void
}) {
  const [open, setOpen] = useState(false)
  const info = RATING_INFO[infoKey]

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <InfoButton open={open} onClick={() => setOpen(v => !v)} />
        <span className="text-xs font-semibold uppercase text-coffee-muted">
          {label}{required && ' *'}
        </span>
      </div>
      {open && (
        <InfoBox>
          <p className="mb-2.5 text-coffee-cream/80">{info.question}</p>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-lg bg-coffee-bg p-2 text-center">
              <span className="mb-1 block text-base font-bold leading-none text-coffee-cream">1</span>
              <span className="text-xs leading-snug text-coffee-muted">{info.low}</span>
            </div>
            <div className="flex items-center px-1 text-xs text-coffee-muted/60">→</div>
            <div className="flex-1 rounded-lg bg-coffee-bg p-2 text-center">
              <span className="mb-1 block text-base font-bold leading-none text-coffee-cream">10</span>
              <span className="text-xs leading-snug text-coffee-muted">{info.high}</span>
            </div>
          </div>
        </InfoBox>
      )}
      <RatingInput value={value} onChange={onChange} />
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function BrewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: brew, isLoading, error } = useBrew(id ?? '')
  const { data: brewDevices = [] } = useBrewDevices()
  const deleteBrew = useDeleteBrew()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <p className="text-coffee-muted text-sm text-center py-10">Loading...</p>
  if (error || !brew) return (
    <div className="text-center py-10">
      <p className="text-coffee-muted text-sm mb-3">Brew not found.</p>
      <button onClick={() => navigate(ROUTES.brews)} className="text-coffee-accent-soft text-sm font-semibold">← Back</button>
    </div>
  )

  if (editing) return <BrewEditForm brew={brew} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Delete this brew?')) return
    await deleteBrew.mutateAsync(brew!.id)
    navigate(ROUTES.brews)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(ROUTES.brews)} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-coffee-cream">{brew.coffees?.name ?? '—'}</h1>
            <Badge>{brewMethodLabel(brew.brew_method)}</Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-coffee-accent-soft text-sm font-semibold">Edit</button>
          <button onClick={handleDelete} disabled={deleteBrew.isPending} className="text-coffee-muted hover:text-red-400 text-sm disabled:opacity-50">
            {deleteBrew.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className={`${cardClasses} p-3 mb-3 flex justify-between items-center`}>
        <span className="text-xs font-semibold text-coffee-muted uppercase">Overall Rating</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingBadgeClasses(brew.rating)}`}>{brew.rating}</span>
      </div>

      {/* Acidity + Bitterness badges */}
      {(brew.acidity_score !== null || brew.bitterness_score !== null) && (
        <div className="flex gap-2 mb-3">
          {brew.acidity_score !== null && (
            <div className={`${cardClasses} flex-1 p-2 text-center`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-0.5">Acidity</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingBadgeClasses(brew.acidity_score)}`}>{brew.acidity_score}</p>
            </div>
          )}
          {brew.bitterness_score !== null && (
            <div className={`${cardClasses} flex-1 p-2 text-center`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-0.5">Bitterness</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingBadgeClasses(brew.bitterness_score)}`}>{brew.bitterness_score}</p>
            </div>
          )}
        </div>
      )}

      {/* Device */}
      {brew.brew_device_id && (
        <div className={`${cardClasses} p-3 mb-3 flex justify-between items-center`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold">Device</p>
          <p className="text-sm font-bold text-coffee-cream">
            {brewDevices.find(d => d.id === brew.brew_device_id)?.name ?? '—'}
          </p>
        </div>
      )}

      {/* Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {brew.grind_setting !== null && (
          <div className={`${cardClasses} p-3`}>
            <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Grind Setting</p>
            <p className="text-base font-bold text-coffee-cream">{brew.grind_setting}</p>
          </div>
        )}
        {brew.dose_g !== null && (
          <div className={`${cardClasses} p-3`}>
            <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Coffee</p>
            <p className="text-base font-bold text-coffee-cream">{brew.dose_g} g</p>
          </div>
        )}
        {brew.water_ml !== null && (
          <div className={`${cardClasses} p-3`}>
            <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Water</p>
            <p className="text-base font-bold text-coffee-cream">{brew.water_ml} ml</p>
          </div>
        )}
        {brew.temp_c !== null && (
          <div className={`${cardClasses} p-3`}>
            <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Temperature</p>
            <p className="text-base font-bold text-coffee-cream">{brew.temp_c}°C</p>
          </div>
        )}
        {brew.brew_time_s !== null && (
          <div className={`${cardClasses} p-3`}>
            <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Brew Time</p>
            <p className="text-base font-bold text-coffee-cream">{secondsToMMSS(brew.brew_time_s)}</p>
          </div>
        )}
      </div>

      {/* Method-specific */}
      {brew.brew_method === 'french_press' && brew.first_stir_s !== null && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">First Stir</p>
          <p className="text-sm font-bold text-coffee-cream">{secondsToMMSS(brew.first_stir_s)}</p>
        </div>
      )}

      {brew.brew_method === 'v60' && (brew.bloom_ml !== null || brew.bloom_time_s !== null) && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Bloom</p>
          <div className="grid gap-1">
            {brew.bloom_ml !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Amount</span>
                <span className="text-coffee-cream">{brew.bloom_ml} ml</span>
              </div>
            )}
            {brew.bloom_time_s !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-coffee-muted">Time</span>
                <span className="text-coffee-cream">{secondsToMMSS(brew.bloom_time_s)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {brew.brew_method === 'aeropress' && brew.inverted && (
        <div className="flex gap-2 mb-3">
          <Badge>Inverted</Badge>
        </div>
      )}

      {/* Tasting notes */}
      {brew.tasting_notes && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Tasting Notes</p>
          <p className="text-sm text-coffee-text italic">„{brew.tasting_notes}"</p>
        </div>
      )}

      <p className="text-xs text-coffee-muted text-center mt-4">{formatDate(brew.brewed_at)}</p>
    </div>
  )
}

function BrewEditForm({
  brew, onCancel, onSaved,
}: {
  brew: BrewWithCoffee
  onCancel: () => void
  onSaved: () => void
}) {
  const updateBrew = useUpdateBrew()
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const { data: brewDevices = [] } = useBrewDevices()

  const [brewMethod, setBrewMethod] = useState(brew.brew_method)
  const [coffeeId, setCoffeeId] = useState(brew.coffee_id)
  const [grinderId, setGrinderId] = useState(brew.grinder_id ?? '')
  const [brewDeviceId, setBrewDeviceId] = useState(brew.brew_device_id ?? '')
  const [grindSetting, setGrindSetting] = useState(brew.grind_setting != null ? String(brew.grind_setting) : '')
  const [doseG, setDoseG] = useState(brew.dose_g != null ? String(brew.dose_g) : '')
  const [waterMl, setWaterMl] = useState(brew.water_ml != null ? String(brew.water_ml) : '')
  const [tempC, setTempC] = useState(brew.temp_c != null ? String(brew.temp_c) : '')
  const [brewTime, setBrewTime] = useState(brew.brew_time_s != null ? secondsToMMSS(brew.brew_time_s) : '')
  const [bloomMl, setBloomMl] = useState(brew.bloom_ml != null ? String(brew.bloom_ml) : '')
  const [bloomTime, setBloomTime] = useState(brew.bloom_time_s != null ? secondsToMMSS(brew.bloom_time_s) : '')
  const [inverted, setInverted] = useState(brew.inverted)
  const [firstStir, setFirstStir] = useState(brew.first_stir_s != null ? secondsToMMSS(brew.first_stir_s) : '')
  const [rating, setRating] = useState<number | null>(brew.rating)
  const [acidityScore, setAcidityScore] = useState<number | null>(brew.acidity_score)
  const [bitternessScore, setBitternessScore] = useState<number | null>(brew.bitterness_score)
  const [tastingNotes, setTastingNotes] = useState(brew.tasting_notes ?? '')
  const [error, setError] = useState('')
  const [showMethodInfo, setShowMethodInfo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!rating) { setError('Rating is required.'); return }

    const brewTimeS = MMSSToSeconds(brewTime)
    const firstStirS = firstStir ? MMSSToSeconds(firstStir) : null

    if (firstStirS !== null && brewTimeS !== null && firstStirS > brewTimeS) {
      setError('First stir time cannot exceed brew time.')
      return
    }

    try {
      await updateBrew.mutateAsync({
        id: brew.id,
        coffee_id: coffeeId,
        grinder_id: grinderId || null,
        brew_method: brewMethod,
        grind_setting: grindSetting ? parseFloat(grindSetting) : null,
        dose_g: doseG ? parseFloat(doseG) : null,
        water_ml: waterMl ? parseFloat(waterMl) : null,
        temp_c: tempC ? parseFloat(tempC) : null,
        brew_time_s: brewTimeS,
        rating,
        acidity_score: acidityScore,
        bitterness_score: bitternessScore,
        tasting_notes: tastingNotes.trim() || null,
        bloom_ml: brewMethod === 'v60' && bloomMl ? parseFloat(bloomMl) : null,
        bloom_time_s: brewMethod === 'v60' ? MMSSToSeconds(bloomTime) : null,
        inverted: brewMethod === 'aeropress' ? inverted : false,
        first_stir_s: brewMethod === 'french_press' ? firstStirS : null,
        brew_device_id: brewDeviceId || null,
      })
      onSaved()
    } catch {
      setError('Error saving.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={onCancel} className="text-lg text-coffee-muted hover:text-coffee-cream">←</button>
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">Edit Brew</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Brew Method */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <InfoButton open={showMethodInfo} onClick={() => setShowMethodInfo(v => !v)} />
            <label className="text-xs font-semibold uppercase text-coffee-muted">Brew Method</label>
          </div>
          {showMethodInfo && (
            <InfoBox>
              <p className="leading-relaxed text-coffee-cream/80">{BREW_METHOD_INFO[brewMethod]}</p>
            </InfoBox>
          )}
          <div className="flex flex-wrap gap-2">
            {BREW_METHODS.map(m => (
              <button key={m.value} type="button" onClick={() => setBrewMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  brewMethod === m.value ? 'bg-coffee-accent text-coffee-bg' : 'border border-coffee-line text-coffee-muted hover:bg-coffee-surface2'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coffee */}
        <div>
          <FieldLabel required>Coffee</FieldLabel>
          <Select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}>
            {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
          </Select>
        </div>

        {/* Grinder */}
        <div>
          <FieldLabel>Grinder</FieldLabel>
          <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
            <option value="">Grinder (optional)</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>)}
          </Select>
        </div>

        {/* Grind + Dose */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Grind Setting</FieldLabel>
            <Input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Coffee (g)</FieldLabel>
            <Input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)} />
          </div>
        </div>

        {/* Water + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Water (ml)</FieldLabel>
            <Input type="number" step="10" value={waterMl} onChange={e => setWaterMl(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Temp (°C)</FieldLabel>
            <Input type="number" value={tempC} onChange={e => setTempC(e.target.value)} />
          </div>
        </div>

        {/* Brew Time */}
        <div>
          <FieldLabel>Brew Time (MM:SS)</FieldLabel>
          <Input type="text" value={brewTime} onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))} />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <FieldLabel>
              First Stir (MM:SS) <span className="font-normal normal-case text-coffee-muted/60">optional</span>
            </FieldLabel>
            <Input type="text" value={firstStir} onChange={e => setFirstStir(e.target.value)}
              onBlur={e => setFirstStir(normalizeTimeInput(e.target.value))} />
          </div>
        )}

        {/* V60: Bloom */}
        {brewMethod === 'v60' && (
          <div className="rounded-xl border border-coffee-line bg-coffee-surface2 p-3">
            <FieldLabel className="text-coffee-accent-soft">Bloom</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Bloom (ml)</FieldLabel>
                <Input type="number" step="5" value={bloomMl} onChange={e => setBloomMl(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Bloom Time (MM:SS)</FieldLabel>
                <Input type="text" value={bloomTime} onChange={e => setBloomTime(e.target.value)}
                  onBlur={e => setBloomTime(normalizeTimeInput(e.target.value))} />
              </div>
            </div>
          </div>
        )}

        {/* AeroPress: Inverted */}
        {brewMethod === 'aeropress' && (
          <div>
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input type="checkbox" checked={inverted} onChange={e => setInverted(e.target.checked)}
                className="h-4 w-4 accent-coffee-accent" />
              Inverted
            </label>
          </div>
        )}

        {/* Ratings */}
        <div className="grid gap-3">
          <RatingField label="Flavor" required infoKey="rating" value={rating} onChange={setRating} />
          <RatingField label="Acidity" infoKey="acidity_score" value={acidityScore} onChange={setAcidityScore} />
          <RatingField label="Bitterness" infoKey="bitterness_score" value={bitternessScore} onChange={setBitternessScore} />
        </div>

        {/* Device */}
        {brewDevices.length > 0 && (
          <div>
            <FieldLabel>Device</FieldLabel>
            <Select value={brewDeviceId} onChange={e => setBrewDeviceId(e.target.value)}>
              <option value="">No device</option>
              {brewDevices.map(d => (
                <option key={d.id} value={d.id}>{d.name}{d.brand ? ` / ${d.brand}` : ''}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Tasting Notes */}
        <div>
          <FieldLabel>Tasting Notes</FieldLabel>
          <Textarea value={tastingNotes} onChange={e => setTastingNotes(e.target.value)} rows={2} className="resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={updateBrew.isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}>
          {updateBrew.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
