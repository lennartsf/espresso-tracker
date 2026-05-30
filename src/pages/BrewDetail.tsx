import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBrew, useUpdateBrew, useDeleteBrew } from '../hooks/useBrews'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders, useBrewDevices } from '../hooks/useEquipment'
import { RatingInput } from '../components/RatingInput'
import { ratingColor } from '../utils/ratingColor'
import { brewMethodLabel, BREW_METHODS, BREW_METHOD_INFO } from '../utils/brewMethods'
import { secondsToMMSS, normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'
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
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={`w-4 h-4 rounded-full text-[10px] font-bold flex-shrink-0 flex items-center justify-center transition-colors ${
            open ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
          }`}
        >
          i
        </button>
        <span className="text-xs font-semibold text-slate-400 uppercase">
          {label}{required && ' *'}
        </span>
      </div>
      {open && (
        <div className="mb-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <p className="text-xs text-slate-600 mb-2.5">{info.question}</p>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <span className="block text-base font-bold text-slate-700 leading-none mb-1">1</span>
              <span className="text-xs text-slate-500 leading-snug">{info.low}</span>
            </div>
            <div className="flex items-center text-slate-300 text-xs px-1">→</div>
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <span className="block text-base font-bold text-slate-700 leading-none mb-1">10</span>
              <span className="text-xs text-slate-500 leading-snug">{info.high}</span>
            </div>
          </div>
        </div>
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

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Loading...</p>
  if (error || !brew) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Brew not found.</p>
      <button onClick={() => navigate('/brews')} className="text-orange-500 text-sm font-semibold">← Back</button>
    </div>
  )

  if (editing) return <BrewEditForm brew={brew} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Delete this brew?')) return
    await deleteBrew.mutateAsync(brew!.id)
    navigate('/brews')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/brews')} className="text-slate-400 text-lg">←</button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">{brew.coffees?.name ?? '—'}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
              {brewMethodLabel(brew.brew_method)}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Edit</button>
          <button onClick={handleDelete} disabled={deleteBrew.isPending} className="text-slate-300 hover:text-red-400 text-sm disabled:opacity-50">
            {deleteBrew.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Overall Rating</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingColor(brew.rating)}`}>{brew.rating}</span>
      </div>

      {/* Acidity + Bitterness badges */}
      {(brew.acidity_score !== null || brew.bitterness_score !== null) && (
        <div className="flex gap-2 mb-3">
          {brew.acidity_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Acidity</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(brew.acidity_score)}`}>{brew.acidity_score}</p>
            </div>
          )}
          {brew.bitterness_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Bitterness</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(brew.bitterness_score)}`}>{brew.bitterness_score}</p>
            </div>
          )}
        </div>
      )}

      {/* Device */}
      {brew.brew_device_id && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 flex justify-between items-center">
          <p className="text-xs text-slate-400 uppercase font-semibold">Device</p>
          <p className="text-sm font-bold text-slate-800">
            {brewDevices.find(d => d.id === brew.brew_device_id)?.name ?? '—'}
          </p>
        </div>
      )}

      {/* Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {brew.grind_setting !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Grind Setting</p>
            <p className="text-base font-bold text-slate-800">{brew.grind_setting}</p>
          </div>
        )}
        {brew.dose_g !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Coffee</p>
            <p className="text-base font-bold text-slate-800">{brew.dose_g} g</p>
          </div>
        )}
        {brew.water_ml !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Water</p>
            <p className="text-base font-bold text-slate-800">{brew.water_ml} ml</p>
          </div>
        )}
        {brew.temp_c !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperature</p>
            <p className="text-base font-bold text-slate-800">{brew.temp_c}°C</p>
          </div>
        )}
        {brew.brew_time_s !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Brew Time</p>
            <p className="text-base font-bold text-slate-800">{secondsToMMSS(brew.brew_time_s)}</p>
          </div>
        )}
      </div>

      {/* Method-specific */}
      {brew.brew_method === 'french_press' && brew.first_stir_s !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">First Stir</p>
          <p className="text-sm font-bold text-slate-800">{secondsToMMSS(brew.first_stir_s)}</p>
        </div>
      )}

      {brew.brew_method === 'v60' && (brew.bloom_ml !== null || brew.bloom_time_s !== null) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Bloom</p>
          <div className="grid gap-1">
            {brew.bloom_ml !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Amount</span>
                <span className="text-slate-800">{brew.bloom_ml} ml</span>
              </div>
            )}
            {brew.bloom_time_s !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="text-slate-800">{secondsToMMSS(brew.bloom_time_s)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {brew.brew_method === 'aeropress' && brew.inverted && (
        <div className="flex gap-2 mb-3">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">Inverted</span>
        </div>
      )}

      {/* Tasting notes */}
      {brew.tasting_notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Tasting Notes</p>
          <p className="text-sm text-slate-700 italic">„{brew.tasting_notes}"</p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-4">{formatDate(brew.brewed_at)}</p>
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
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onCancel} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Edit Brew</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Brew Method */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setShowMethodInfo(v => !v)}
              className={`w-4 h-4 rounded-full text-[10px] font-bold flex-shrink-0 flex items-center justify-center transition-colors ${
                showMethodInfo ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }`}
            >
              i
            </button>
            <label className="text-xs font-semibold text-slate-400 uppercase">Brew Method</label>
          </div>
          {showMethodInfo && (
            <div className="mb-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <p className="text-xs text-slate-500 leading-relaxed">{BREW_METHOD_INFO[brewMethod]}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {BREW_METHODS.map(m => (
              <button key={m.value} type="button" onClick={() => setBrewMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  brewMethod === m.value ? 'bg-orange-500 text-white' : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Coffee *</label>
          <select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
          </select>
        </div>

        {/* Grinder */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Grinder</label>
          <select value={grinderId} onChange={e => setGrinderId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            <option value="">Grinder (optional)</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>)}
          </select>
        </div>

        {/* Grind + Dose */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Grind Setting</label>
            <input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Coffee (g)</label>
            <input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Water + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Water (ml)</label>
            <input type="number" step="10" value={waterMl} onChange={e => setWaterMl(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input type="number" value={tempC} onChange={e => setTempC(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Brew Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brew Time (MM:SS)</label>
          <input type="text" value={brewTime} onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              First Stir (MM:SS) <span className="text-slate-300 normal-case font-normal">optional</span>
            </label>
            <input type="text" value={firstStir} onChange={e => setFirstStir(e.target.value)}
              onBlur={e => setFirstStir(normalizeTimeInput(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        )}

        {/* V60: Bloom */}
        {brewMethod === 'v60' && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
            <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Bloom</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom (ml)</label>
                <input type="number" step="5" value={bloomMl} onChange={e => setBloomMl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom Time (MM:SS)</label>
                <input type="text" value={bloomTime} onChange={e => setBloomTime(e.target.value)}
                  onBlur={e => setBloomTime(normalizeTimeInput(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>
        )}

        {/* AeroPress: Inverted */}
        {brewMethod === 'aeropress' && (
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={inverted} onChange={e => setInverted(e.target.checked)}
                className="w-4 h-4 accent-orange-500" />
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
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Device</label>
            <select
              value={brewDeviceId}
              onChange={e => setBrewDeviceId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="">No device</option>
              {brewDevices.map(d => (
                <option key={d.id} value={d.id}>{d.name}{d.brand ? ` / ${d.brand}` : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tasting Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tasting Notes</label>
          <textarea value={tastingNotes} onChange={e => setTastingNotes(e.target.value)} rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={updateBrew.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {updateBrew.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
