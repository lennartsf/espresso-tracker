import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders, useBrewDevices, useEquipmentDefaults } from '../hooks/useEquipment'
import { useCreateBrew } from '../hooks/useBrews'
import { RatingInput } from '../components/RatingInput'
import { BREW_METHODS, BREW_METHOD_INFO } from '../utils/brewMethods'
import { normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'
import { Input, Select, Textarea, FieldLabel, InfoButton, InfoBox, buttonClasses } from '../components/ui'

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
      navigate(ROUTES.brews)
    } catch {
      setError('Error saving.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-lg text-coffee-muted hover:text-coffee-cream">←</button>
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">New Brew</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Brühmethode */}
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
              <button
                key={m.value}
                type="button"
                onClick={() => setBrewMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  brewMethod === m.value
                    ? 'bg-coffee-accent text-coffee-bg'
                    : 'border border-coffee-line text-coffee-muted hover:bg-coffee-surface2'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kaffee */}
        <div>
          <FieldLabel required>Coffee</FieldLabel>
          <Select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}>
            <option value="">Select coffee...</option>
            {coffees.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>
            ))}
          </Select>
        </div>

        {/* Mühle */}
        {grinders.length > 0 && (
          <div>
            <FieldLabel>Grinder</FieldLabel>
            <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
              <option value="">Grinder (optional)</option>
              {grinders.map(g => (
                <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Gerät */}
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

        {/* Mahlgrad + Kaffee g */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Grind Setting</FieldLabel>
            <Input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)} placeholder="20" />
          </div>
          <div>
            <FieldLabel>Coffee (g)</FieldLabel>
            <Input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)} placeholder="15" />
          </div>
        </div>

        {/* Wasser + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Water (ml)</FieldLabel>
            <Input type="number" step="10" value={waterMl} onChange={e => setWaterMl(e.target.value)} placeholder="250" />
          </div>
          <div>
            <FieldLabel>Temp (°C)</FieldLabel>
            <Input type="number" value={tempC} onChange={e => setTempC(e.target.value)} placeholder="93" />
          </div>
        </div>

        {/* Brühzeit */}
        <div>
          <FieldLabel>Brew Time (MM:SS)</FieldLabel>
          <Input
            type="text" value={brewTime}
            onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))}
            placeholder="04:00"
          />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <FieldLabel>
              First Stir (MM:SS) <span className="font-normal normal-case text-coffee-muted/60">optional</span>
            </FieldLabel>
            <Input
              type="text" value={firstStir}
              onChange={e => setFirstStir(e.target.value)}
              onBlur={e => setFirstStir(normalizeTimeInput(e.target.value))}
              placeholder="00:30"
            />
          </div>
        )}

        {/* V60: Bloom */}
        {brewMethod === 'v60' && (
          <div className="rounded-xl border border-coffee-line bg-coffee-surface2 p-3">
            <FieldLabel className="text-coffee-accent-soft">Bloom</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Bloom (ml)</FieldLabel>
                <Input type="number" step="5" value={bloomMl} onChange={e => setBloomMl(e.target.value)} placeholder="30" />
              </div>
              <div>
                <FieldLabel>Bloom Time (MM:SS)</FieldLabel>
                <Input
                  type="text" value={bloomTime}
                  onChange={e => setBloomTime(e.target.value)}
                  onBlur={e => setBloomTime(normalizeTimeInput(e.target.value))}
                  placeholder="00:45"
                />
              </div>
            </div>
          </div>
        )}

        {/* AeroPress: Inverted */}
        {brewMethod === 'aeropress' && (
          <div>
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input
                type="checkbox" checked={inverted}
                onChange={e => setInverted(e.target.checked)}
                className="h-4 w-4 accent-coffee-accent"
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
          <FieldLabel>Tasting Notes</FieldLabel>
          <Textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Fruity, nutty..."
            className="resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createBrew.isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}
        >
          {createBrew.isPending ? 'Saving...' : 'Save Brew'}
        </button>
      </form>
    </div>
  )
}
