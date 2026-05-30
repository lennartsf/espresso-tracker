import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBrew, useUpdateBrew, useDeleteBrew } from '../hooks/useBrews'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders } from '../hooks/useEquipment'
import { RatingInput } from '../components/RatingInput'
import { ratingColor } from '../utils/ratingColor'
import { brewMethodLabel, BREW_METHODS, BREW_METHOD_INFO } from '../utils/brewMethods'
import { secondsToMMSS, normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'
import type { BrewWithCoffee } from '../hooks/useBrews'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function BrewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: brew, isLoading, error } = useBrew(id ?? '')
  const deleteBrew = useDeleteBrew()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Laden...</p>
  if (error || !brew) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Brew nicht gefunden.</p>
      <button onClick={() => navigate('/brews')} className="text-orange-500 text-sm font-semibold">← Zurück</button>
    </div>
  )

  if (editing) return <BrewEditForm brew={brew} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Brew wirklich löschen?')) return
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
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} disabled={deleteBrew.isPending} className="text-slate-300 hover:text-red-400 text-sm disabled:opacity-50">
            {deleteBrew.isPending ? 'Löschen...' : 'Löschen'}
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Bewertung</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingColor(brew.rating)}`}>{brew.rating}</span>
      </div>

      {/* Acidity + Bitterness badges */}
      {(brew.acidity_score !== null || brew.bitterness_score !== null) && (
        <div className="flex gap-2 mb-3">
          {brew.acidity_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Säure</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(brew.acidity_score)}`}>{brew.acidity_score}</p>
            </div>
          )}
          {brew.bitterness_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Bitterkeit</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(brew.bitterness_score)}`}>{brew.bitterness_score}</p>
            </div>
          )}
        </div>
      )}

      {/* Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {brew.grind_setting !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Mahlgrad</p>
            <p className="text-base font-bold text-slate-800">{brew.grind_setting}</p>
          </div>
        )}
        {brew.dose_g !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Kaffee</p>
            <p className="text-base font-bold text-slate-800">{brew.dose_g} g</p>
          </div>
        )}
        {brew.water_ml !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Wasser</p>
            <p className="text-base font-bold text-slate-800">{brew.water_ml} ml</p>
          </div>
        )}
        {brew.temp_c !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperatur</p>
            <p className="text-base font-bold text-slate-800">{brew.temp_c}°C</p>
          </div>
        )}
        {brew.brew_time_s !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Brühzeit</p>
            <p className="text-base font-bold text-slate-800">{secondsToMMSS(brew.brew_time_s)}</p>
          </div>
        )}
      </div>

      {/* Method-specific */}
      {brew.brew_method === 'french_press' && brew.first_stir_s !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">1. Umrühren</p>
          <p className="text-sm font-bold text-slate-800">{secondsToMMSS(brew.first_stir_s)}</p>
        </div>
      )}

      {brew.brew_method === 'v60' && (brew.bloom_ml !== null || brew.bloom_time_s !== null) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Bloom</p>
          <div className="grid gap-1">
            {brew.bloom_ml !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Menge</span>
                <span className="text-slate-800">{brew.bloom_ml} ml</span>
              </div>
            )}
            {brew.bloom_time_s !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Zeit</span>
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
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
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

  const [brewMethod, setBrewMethod] = useState(brew.brew_method)
  const [coffeeId, setCoffeeId] = useState(brew.coffee_id)
  const [grinderId, setGrinderId] = useState(brew.grinder_id ?? '')
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
    if (!rating) { setError('Bitte den Brew bewerten.'); return }

    const brewTimeS = MMSSToSeconds(brewTime)
    const firstStirS = firstStir ? MMSSToSeconds(firstStir) : null

    if (firstStirS !== null && brewTimeS !== null && firstStirS > brewTimeS) {
      setError('1. Umrühren darf die Brühzeit nicht überschreiten.')
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
      })
      onSaved()
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onCancel} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Brew bearbeiten</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Brühmethode */}
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
            <label className="text-xs font-semibold text-slate-400 uppercase">Brühmethode</label>
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

        {/* Kaffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
          <select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
          </select>
        </div>

        {/* Mühle */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mühle</label>
          <select value={grinderId} onChange={e => setGrinderId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            <option value="">Mühle (optional)</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>)}
          </select>
        </div>

        {/* Mahlgrad + Dose */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad</label>
            <input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee (g)</label>
            <input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Wasser + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Wasser (ml)</label>
            <input type="number" step="10" value={waterMl} onChange={e => setWaterMl(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input type="number" value={tempC} onChange={e => setTempC(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Brühzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit (MM:SS)</label>
          <input type="text" value={brewTime} onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              1. Umrühren (MM:SS) <span className="text-slate-300 normal-case font-normal">optional</span>
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
                <label className="block text-xs text-slate-500 mb-1">Bloom-Zeit (MM:SS)</label>
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

        {/* Bewertung */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bewertung *</label>
          <RatingInput value={rating} onChange={setRating} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Säure</label>
          <RatingInput value={acidityScore} onChange={setAcidityScore} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bitterkeit</label>
          <RatingInput value={bitternessScore} onChange={setBitternessScore} />
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notizen</label>
          <textarea value={tastingNotes} onChange={e => setTastingNotes(e.target.value)} rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={updateBrew.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {updateBrew.isPending ? 'Speichern...' : 'Änderungen speichern'}
        </button>
      </form>
    </div>
  )
}
