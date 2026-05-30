import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders } from '../hooks/useEquipment'
import { useCreateBrew } from '../hooks/useBrews'
import { RatingInput } from '../components/RatingInput'
import { BREW_METHODS, BREW_METHOD_INFO } from '../utils/brewMethods'
import { normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'

export function NewBrew() {
  const navigate = useNavigate()
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const createBrew = useCreateBrew()

  const [brewMethod, setBrewMethod] = useState('french_press')
  const [coffeeId, setCoffeeId] = useState('')
  const [grinderId, setGrinderId] = useState('')
  const [grindSetting, setGrindSetting] = useState('')
  const [doseG, setDoseG] = useState('')
  const [waterMl, setWaterMl] = useState('')
  const [tempC, setTempC] = useState('')
  const [brewTime, setBrewTime] = useState('')
  const [bloomMl, setBloomMl] = useState('')
  const [bloomTime, setBloomTime] = useState('')
  const [inverted, setInverted] = useState(false)
  const [firstStir, setFirstStir] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [tastingNotes, setTastingNotes] = useState('')
  const [error, setError] = useState('')
  const [showMethodInfo, setShowMethodInfo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!coffeeId) { setError('Bitte einen Kaffee auswählen.'); return }
    if (!rating) { setError('Bitte den Brew bewerten.'); return }

    const brewTimeS = MMSSToSeconds(brewTime)
    const firstStirS = firstStir ? MMSSToSeconds(firstStir) : null

    if (firstStirS !== null && brewTimeS !== null && firstStirS > brewTimeS) {
      setError('1. Umrühren darf die Brühzeit nicht überschreiten.')
      return
    }

    try {
      await createBrew.mutateAsync({
        coffee_id: coffeeId,
        grinder_id: grinderId || null,
        brew_method: brewMethod,
        grind_setting: grindSetting ? parseFloat(grindSetting) : null,
        dose_g: doseG ? parseFloat(doseG) : null,
        water_ml: waterMl ? parseFloat(waterMl) : null,
        temp_c: tempC ? parseFloat(tempC) : null,
        brew_time_s: brewTimeS,
        rating,
        tasting_notes: tastingNotes.trim() || null,
        bloom_ml: brewMethod === 'v60' && bloomMl ? parseFloat(bloomMl) : null,
        bloom_time_s: brewMethod === 'v60' ? MMSSToSeconds(bloomTime) : null,
        inverted: brewMethod === 'aeropress' ? inverted : false,
        first_stir_s: brewMethod === 'french_press' ? firstStirS : null,
        brewed_at: new Date().toISOString(),
      })
      navigate('/brews')
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Neuer Brew</h1>
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
              <button
                key={m.value}
                type="button"
                onClick={() => setBrewMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  brewMethod === m.value
                    ? 'bg-orange-500 text-white'
                    : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
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
          <select
            value={coffeeId}
            onChange={e => setCoffeeId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="">Kaffee wählen...</option>
            {coffees.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>
            ))}
          </select>
        </div>

        {/* Mühle */}
        {grinders.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mühle</label>
            <select
              value={grinderId}
              onChange={e => setGrinderId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="">Mühle (optional)</option>
              {grinders.map(g => (
                <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Mahlgrad + Kaffee g */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad</label>
            <input
              type="number" step="0.5" value={grindSetting}
              onChange={e => setGrindSetting(e.target.value)}
              placeholder="20"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee (g)</label>
            <input
              type="number" step="0.1" value={doseG}
              onChange={e => setDoseG(e.target.value)}
              placeholder="15"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Wasser + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Wasser (ml)</label>
            <input
              type="number" step="10" value={waterMl}
              onChange={e => setWaterMl(e.target.value)}
              placeholder="250"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input
              type="number" value={tempC}
              onChange={e => setTempC(e.target.value)}
              placeholder="93"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Brühzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit (MM:SS)</label>
          <input
            type="text" value={brewTime}
            onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))}
            placeholder="04:00"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              1. Umrühren (MM:SS) <span className="text-slate-300 normal-case font-normal">optional</span>
            </label>
            <input
              type="text" value={firstStir}
              onChange={e => setFirstStir(e.target.value)}
              onBlur={e => setFirstStir(normalizeTimeInput(e.target.value))}
              placeholder="00:30"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        )}

        {/* V60: Bloom */}
        {brewMethod === 'v60' && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
            <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Bloom</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom (ml)</label>
                <input
                  type="number" step="5" value={bloomMl}
                  onChange={e => setBloomMl(e.target.value)}
                  placeholder="30"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom-Zeit (MM:SS)</label>
                <input
                  type="text" value={bloomTime}
                  onChange={e => setBloomTime(e.target.value)}
                  onBlur={e => setBloomTime(normalizeTimeInput(e.target.value))}
                  placeholder="00:45"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* AeroPress: Inverted */}
        {brewMethod === 'aeropress' && (
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox" checked={inverted}
                onChange={e => setInverted(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Inverted
            </label>
          </div>
        )}

        {/* Bewertung */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bewertung *</label>
          <RatingInput value={rating} onChange={setRating} />
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notizen</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Fruchtig, nussig..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createBrew.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {createBrew.isPending ? 'Speichern...' : 'Brew speichern'}
        </button>
      </form>
    </div>
  )
}
