import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoffees, useCreateCoffee, useRoastDates } from '../hooks/useCoffees'
import { useCreateShot } from '../hooks/useShots'
import { RatingInput } from '../components/RatingInput'
import { BrewTimer } from '../components/BrewTimer'

const RATING_INFO = {
  rating:       { question: 'Wie gut schmeckt der Shot insgesamt?', low: 'kaum trinkbar',       high: 'perfekter Espresso'    },
  body_score:   { question: 'Wie voll und cremig fühlt sich der Espresso an?', low: 'cremig & vollmundig', high: 'dünn & wässrig' },
  acidity_score:{ question: 'Wie ausgeprägt ist die Säure im Shot?', low: 'sehr mild',           high: 'stark & spritzig'      },
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

export function NewShot() {
  const navigate = useNavigate()
  const { data: coffees = [] } = useCoffees()
  const createShot = useCreateShot()
  const createCoffee = useCreateCoffee()

  const [coffeeId, setCoffeeId] = useState('')
  const [showNewCoffee, setShowNewCoffee] = useState(false)
  const [newCoffeeName, setNewCoffeeName] = useState('')
  const [roastDateId, setRoastDateId] = useState('')
  const [grindSetting, setGrindSetting] = useState('')
  const [doseG, setDoseG] = useState('')
  const [yieldG, setYieldG] = useState('')
  const [brewTimeS, setBrewTimeS] = useState('')
  const [tempC, setTempC] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [bodyScore, setBodyScore] = useState<number | null>(null)
  const [acidityScore, setAcidityScore] = useState<number | null>(null)
  const [tastingNotes, setTastingNotes] = useState('')
  const [error, setError] = useState('')

  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const recentDates = roastDates.slice(0, 2)

  // Auto-calculate brew ratio
  const doseNum = parseFloat(doseG)
  const yieldNum = parseFloat(yieldG)
  const brewRatio = doseNum > 0 && yieldNum > 0 ? yieldNum / doseNum : null

  function handleCoffeeChange(id: string) {
    setCoffeeId(id)
    setRoastDateId('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!coffeeId && !newCoffeeName.trim()) {
      setError('Bitte einen Kaffee auswählen oder eingeben.')
      return
    }
    if (!grindSetting) {
      setError('Mahlgrad ist erforderlich.')
      return
    }
    if (!rating) {
      setError('Bitte den Shot bewerten.')
      return
    }

    let resolvedCoffeeId = coffeeId
    if (!coffeeId && newCoffeeName.trim()) {
      const coffee = await createCoffee.mutateAsync({
        name: newCoffeeName.trim(),
        roaster: null,
        roaster_id: null,
        origin: null,
        roast_date: null,
        notes: null,
        arabica_pct: null,
        robusta_pct: null,
        roast_level: null,
        origin_country: null,
        origin_region: null,
        altitude_m: null,
      })
      resolvedCoffeeId = coffee.id
    }

    await createShot.mutateAsync({
      coffee_id: resolvedCoffeeId,
      roast_date_id: roastDateId || null,
      grind_setting: parseFloat(grindSetting),
      dose_g: doseG ? parseFloat(doseG) : null,
      yield_g: yieldG ? parseFloat(yieldG) : null,
      brew_ratio: brewRatio,
      brew_time_s: brewTimeS ? parseInt(brewTimeS, 10) : null,
      temp_c: tempC ? parseFloat(tempC) : null,
      rating,
      body_score: bodyScore,
      acidity_score: acidityScore,
      tasting_notes: tastingNotes.trim() || null,
      pulled_at: new Date().toISOString(),
    })

    navigate('/')
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Neuer Shot</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Coffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
          {!showNewCoffee ? (
            <div className="flex gap-2">
              <select
                value={coffeeId}
                onChange={e => handleCoffeeChange(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
              >
                <option value="">Kaffee wählen...</option>
                {coffees.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.roaster ? ` / ${c.roaster}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => { setShowNewCoffee(true); handleCoffeeChange('') }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-white hover:bg-slate-50"
              >
                + Neu
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newCoffeeName}
                onChange={e => setNewCoffeeName(e.target.value)}
                placeholder="Kaffee-Name"
                className="flex-1 border border-orange-400 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewCoffee(false)}
                className="px-3 py-2 text-sm text-slate-400 hover:text-slate-600"
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>

        {/* Roast date */}
        {coffeeId && recentDates.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Röstdatum</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoastDateId('')}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  roastDateId === '' ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold' : 'border-slate-200 text-slate-500 bg-white'
                }`}
              >
                Keine Angabe
              </button>
              {recentDates.map((rd, i) => (
                <button
                  key={rd.id}
                  type="button"
                  onClick={() => setRoastDateId(rd.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors text-center ${
                    roastDateId === rd.id ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold' : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  {formatDate(rd.roast_date)}
                  {i === 0 && <span className="block text-xs text-slate-400 font-normal">Aktuell</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grind + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad *</label>
            <input
              type="number" step="0.5" value={grindSetting}
              onChange={e => setGrindSetting(e.target.value)}
              placeholder="12"
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

        {/* Dose + Yield + Ratio */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Einwaage (g)</label>
              <input
                type="number" step="0.1" value={doseG}
                onChange={e => setDoseG(e.target.value)}
                placeholder="18"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ausbeute (g)</label>
              <input
                type="number" step="0.1" value={yieldG}
                onChange={e => setYieldG(e.target.value)}
                placeholder="36"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
          {brewRatio !== null && (
            <p className="text-xs text-slate-500 text-right">
              Verhältnis <span className="font-semibold text-orange-500">1 : {brewRatio.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Brew time */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit</label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="number" value={brewTimeS}
                onChange={e => setBrewTimeS(e.target.value)}
                placeholder="28"
                className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              <span className="text-sm text-slate-400">s</span>
            </div>
            <BrewTimer onTime={s => setBrewTimeS(String(s))} />
          </div>
        </div>

        {/* Ratings */}
        <div className="grid gap-3">
          <RatingField label="Geschmack" required infoKey="rating" value={rating} onChange={setRating} />
          <RatingField label="Körper" infoKey="body_score" value={bodyScore} onChange={setBodyScore} />
          <RatingField label="Säure" infoKey="acidity_score" value={acidityScore} onChange={setAcidityScore} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Geschmacksnotizen</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Schokolade, Nuss, leicht säuerlich..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createShot.isPending || createCoffee.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {createShot.isPending ? 'Speichern...' : 'Shot speichern'}
        </button>
      </form>
    </div>
  )
}
