import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders, useBrewDevices, useEquipmentDefaults } from '../hooks/useEquipment'
import { useCreateBrew } from '../hooks/useBrews'
import { RatingInput } from '../components/RatingInput'
import { BREW_METHODS, BREW_METHOD_INFO } from '../utils/brewMethods'
import { normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'

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

export function NewBrew() {
  const navigate = useNavigate()
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const { data: brewDevices = [] } = useBrewDevices()
  const { data: defaults = [], isLoading: defaultsLoading } = useEquipmentDefaults()
  const createBrew = useCreateBrew()

  const [brewMethod, setBrewMethod] = useState('french_press')

  const [coffeeId, setCoffeeId] = useState('')
  const [grinderId, setGrinderId] = useState('')
  const [brewDeviceId, setBrewDeviceId] = useState('')
  const [grindSetting, setGrindSetting] = useState('')

  const lastAppliedMethod = useRef<string | null>(null)
  useEffect(() => {
    if (defaultsLoading) return
    if (lastAppliedMethod.current === brewMethod) return
    const d = defaults.find(d => d.method === brewMethod)
    setGrinderId(d?.grinder_id ?? '')
    setBrewDeviceId(d?.brew_device_id ?? '')
    lastAppliedMethod.current = brewMethod
  }, [defaults, defaultsLoading, brewMethod])
  const [doseG, setDoseG] = useState('')
  const [waterMl, setWaterMl] = useState('')
  const [tempC, setTempC] = useState('')
  const [brewTime, setBrewTime] = useState('')
  const [bloomMl, setBloomMl] = useState('')
  const [bloomTime, setBloomTime] = useState('')
  const [inverted, setInverted] = useState(false)
  const [firstStir, setFirstStir] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [acidityScore, setAcidityScore] = useState<number | null>(null)
  const [bitternessScore, setBitternessScore] = useState<number | null>(null)
  const [tastingNotes, setTastingNotes] = useState('')
  const [error, setError] = useState('')
  const [showMethodInfo, setShowMethodInfo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!coffeeId) { setError('Please select a coffee.'); return }
    if (!rating) { setError('Rating is required.'); return }

    const brewTimeS = MMSSToSeconds(brewTime)
    const firstStirS = firstStir ? MMSSToSeconds(firstStir) : null

    if (firstStirS !== null && brewTimeS !== null && firstStirS > brewTimeS) {
      setError('First stir time cannot exceed brew time.')
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
        acidity_score: acidityScore,
        bitterness_score: bitternessScore,
        tasting_notes: tastingNotes.trim() || null,
        bloom_ml: brewMethod === 'v60' && bloomMl ? parseFloat(bloomMl) : null,
        bloom_time_s: brewMethod === 'v60' ? MMSSToSeconds(bloomTime) : null,
        inverted: brewMethod === 'aeropress' ? inverted : false,
        first_stir_s: brewMethod === 'french_press' ? firstStirS : null,
        brew_device_id: brewDeviceId || null,
        brewed_at: new Date().toISOString(),
      })
      navigate('/brews')
    } catch {
      setError('Error saving.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">New Brew</h1>
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
            <label className="text-xs font-semibold text-slate-400 uppercase">Brew Method</label>
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
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Coffee *</label>
          <select
            value={coffeeId}
            onChange={e => setCoffeeId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="">Select coffee...</option>
            {coffees.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>
            ))}
          </select>
        </div>

        {/* Mühle */}
        {grinders.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Grinder</label>
            <select
              value={grinderId}
              onChange={e => setGrinderId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="">Grinder (optional)</option>
              {grinders.map(g => (
                <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Gerät */}
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

        {/* Mahlgrad + Kaffee g */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Grind Setting</label>
            <input
              type="number" step="0.5" value={grindSetting}
              onChange={e => setGrindSetting(e.target.value)}
              placeholder="20"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Coffee (g)</label>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Water (ml)</label>
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
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brew Time (MM:SS)</label>
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
              First Stir (MM:SS) <span className="text-slate-300 normal-case font-normal">optional</span>
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
                <label className="block text-xs text-slate-500 mb-1">Bloom Time (MM:SS)</label>
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
        <div className="grid gap-3">
          <RatingField label="Flavor" required infoKey="rating" value={rating} onChange={setRating} />
          <RatingField label="Acidity" infoKey="acidity_score" value={acidityScore} onChange={setAcidityScore} />
          <RatingField label="Bitterness" infoKey="bitterness_score" value={bitternessScore} onChange={setBitternessScore} />
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tasting Notes</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Fruity, nutty..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createBrew.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {createBrew.isPending ? 'Saving...' : 'Save Brew'}
        </button>
      </form>
    </div>
  )
}
