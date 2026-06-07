import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useCoffees, useCreateCoffee, useRoastDates } from '../hooks/useCoffees'
import { useCreateShot } from '../hooks/useShots'
import { useGrinders, useMachines, useBaskets, useEquipmentDefaults } from '../hooks/useEquipment'
import { DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'
import { RatingInput } from '../components/RatingInput'
import { BrewTimer } from '../components/BrewTimer'
import { BrewRatioBar } from '../components/BrewRatioBar'
import { Input, Select, Textarea, FieldLabel, InfoButton, InfoBox, buttonClasses } from '../components/ui'

const RATING_INFO = {
  rating:          { question: 'How good does the shot taste overall?', low: 'barely drinkable',  high: 'perfect espresso'   },
  body_score:      { question: 'How full and creamy does the espresso feel?', low: 'thin & watery', high: 'rich & creamy'    },
  acidity_score:   { question: 'How pronounced is the acidity in the shot?', low: 'very mild',     high: 'bright & lively'   },
  bitterness_score:{ question: 'How strong is the bitterness in the shot?', low: 'barely bitter',  high: 'very bitter'       },
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
  const [bitternessScore, setBitternessScore] = useState<number | null>(null)
  const [preinfusion, setPreinfusion] = useState(false)
  const [preinfusionS, setPreinfusionS] = useState('')
  const [tastingNotes, setTastingNotes] = useState('')
  const [pressureBar, setPressureBar] = useState('9')
  const [usedRdt, setUsedRdt] = useState(false)
  const [usedWdt, setUsedWdt] = useState(false)
  const [usedLeveler, setUsedLeveler] = useState(false)
  const [drinkType, setDrinkType] = useState('espresso')
  const [milkType, setMilkType] = useState('')
  const [milkMl, setMilkMl] = useState('')
  const [grinderId, setGrinderId] = useState('')
  const [machineId, setMachineId] = useState('')
  const [basketId, setBasketId] = useState('')
  const [error, setError] = useState('')

  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const { data: grinders = [] } = useGrinders()
  const { data: machines = [] } = useMachines()
  const { data: baskets = [] } = useBaskets()
  const recentDates = roastDates.slice(0, 2)
  const { data: defaults = [], isLoading: defaultsLoading } = useEquipmentDefaults()
  const defaultsApplied = useRef(false)

  useEffect(() => {
    if (defaultsApplied.current) return
    if (defaultsLoading) return
    const d = defaults.find(d => d.method === 'espresso')
    const targetGrinder = d?.grinder_id ?? grinders.find(g => g.is_favorite)?.id
    const targetMachine = d?.machine_id ?? machines.find(m => m.is_favorite)?.id
    const targetBasket  = d?.basket_id  ?? baskets.find(b => b.is_favorite)?.id
    if (targetGrinder) setGrinderId(targetGrinder)
    if (targetMachine) setMachineId(targetMachine)
    if (targetBasket)  setBasketId(targetBasket)
    defaultsApplied.current = true
  }, [defaults, defaultsLoading, grinders, machines, baskets])

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
      setError('Please select or enter a coffee.')
      return
    }
    if (!grindSetting) {
      setError('Grind setting is required.')
      return
    }
    if (!rating) {
      setError('Please rate the shot.')
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
        photo_url: null,
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
      pressure_bar: pressureBar ? parseFloat(pressureBar) : null,
      brew_time_s: brewTimeS ? parseInt(brewTimeS, 10) : null,
      temp_c: tempC ? parseFloat(tempC) : null,
      rating,
      body_score: bodyScore,
      acidity_score: acidityScore,
      bitterness_score: bitternessScore,
      preinfusion_s: preinfusion && preinfusionS ? parseFloat(preinfusionS) : null,
      tasting_notes: tastingNotes.trim() || null,
      used_rdt: usedRdt,
      used_wdt: usedWdt,
      used_leveler: usedLeveler,
      grinder_id: grinderId || null,
      machine_id: machineId || null,
      basket_id: basketId || null,
      drink_type: drinkType,
      milk_type: drinkType !== 'espresso' ? (milkType || null) : null,
      milk_ml: drinkType !== 'espresso' ? (milkMl ? parseFloat(milkMl) : null) : null,
      pulled_at: new Date().toISOString(),
    })

    navigate(ROUTES.app)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-lg text-coffee-muted hover:text-coffee-cream">←</button>
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">New Shot</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Getränketyp */}
        <div>
          <FieldLabel>Drink Type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {DRINK_TYPES.map(dt => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setDrinkType(dt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  drinkType === dt.value
                    ? 'bg-coffee-accent text-coffee-bg'
                    : 'border border-coffee-line text-coffee-muted hover:bg-coffee-surface2'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coffee */}
        <div>
          <FieldLabel required>Coffee</FieldLabel>
          {!showNewCoffee ? (
            <div className="flex gap-2">
              <Select
                value={coffeeId}
                onChange={e => handleCoffeeChange(e.target.value)}
                className="flex-1"
              >
                <option value="">Select coffee...</option>
                {coffees.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.roaster ? ` / ${c.roaster}` : ''}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => { setShowNewCoffee(true); handleCoffeeChange('') }}
                className="rounded-lg border border-coffee-line px-3 py-2 text-sm text-coffee-muted hover:bg-coffee-surface2"
              >
                + New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={newCoffeeName}
                onChange={e => setNewCoffeeName(e.target.value)}
                placeholder="Coffee name"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setShowNewCoffee(false)}
                className="px-3 py-2 text-sm text-coffee-muted hover:text-coffee-cream"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Roast date */}
        {coffeeId && recentDates.length > 0 && (
          <div>
            <FieldLabel>Roast Date</FieldLabel>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoastDateId('')}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  roastDateId === '' ? 'border-coffee-accent bg-coffee-accent/15 text-coffee-accent-soft font-semibold' : 'border-coffee-line text-coffee-muted'
                }`}
              >
                Not specified
              </button>
              {recentDates.map((rd, i) => (
                <button
                  key={rd.id}
                  type="button"
                  onClick={() => setRoastDateId(rd.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors text-center ${
                    roastDateId === rd.id ? 'border-coffee-accent bg-coffee-accent/15 text-coffee-accent-soft font-semibold' : 'border-coffee-line text-coffee-muted'
                  }`}
                >
                  {formatDate(rd.roast_date)}
                  {i === 0 && <span className="block text-xs font-normal text-coffee-muted/60">Current</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mühle */}
        {grinders.length > 0 && (
          <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
            <option value="">Grinder (optional)</option>
            {grinders.map(g => (
              <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
            ))}
          </Select>
        )}

        {/* Grind + Temp + Pressure */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel required>Grind Setting</FieldLabel>
            <Input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)} placeholder="12" />
          </div>
          <div>
            <FieldLabel>Temp (°C)</FieldLabel>
            <Input type="number" value={tempC} onChange={e => setTempC(e.target.value)} placeholder="93" />
          </div>
          <div>
            <FieldLabel>Pressure (bar)</FieldLabel>
            <Input type="number" step="0.1" value={pressureBar} onChange={e => setPressureBar(e.target.value)} placeholder="9" />
          </div>
        </div>

        {/* Dose + Yield + Ratio */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <FieldLabel>Dose (g)</FieldLabel>
              <Input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)} placeholder="18" />
            </div>
            <div>
              <FieldLabel>Yield (g)</FieldLabel>
              <Input type="number" step="0.1" value={yieldG} onChange={e => setYieldG(e.target.value)} placeholder="36" />
            </div>
          </div>
          <BrewRatioBar
            doseG={doseG ? parseFloat(doseG) : null}
            yieldG={yieldG ? parseFloat(yieldG) : null}
          />
        </div>

        {/* Brew time */}
        <div>
          <FieldLabel>Brew Time</FieldLabel>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Input type="number" value={brewTimeS} onChange={e => setBrewTimeS(e.target.value)} placeholder="28" className="!w-20" />
              <span className="text-sm text-coffee-muted">s</span>
            </div>
            <BrewTimer onTime={s => setBrewTimeS(String(s))} />
          </div>
        </div>

        {/* Preinfusion */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preinfusion}
              onChange={e => { setPreinfusion(e.target.checked); if (!e.target.checked) setPreinfusionS('') }}
              className="h-4 w-4 accent-coffee-accent"
            />
            <span className="text-xs font-semibold uppercase text-coffee-muted">Preinfusion</span>
          </label>
          {preinfusion && (
            <>
              <Input type="number" step="0.5" value={preinfusionS} onChange={e => setPreinfusionS(e.target.value)} placeholder="5" className="!w-20" />
              <span className="text-sm text-coffee-muted">s</span>
            </>
          )}
        </div>

        {/* Milch */}
        {drinkType !== 'espresso' && (
          <div className="rounded-xl border border-coffee-line bg-coffee-surface2 p-3">
            <FieldLabel className="text-coffee-accent-soft">Milk</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Type</FieldLabel>
                <Select value={milkType} onChange={e => setMilkType(e.target.value)}>
                  <option value="">Select...</option>
                  {MILK_TYPES.map(mt => (
                    <option key={mt.value} value={mt.value}>{mt.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel>Amount</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input type="number" step="10" value={milkMl} onChange={e => setMilkMl(e.target.value)} placeholder="120" className="flex-1" />
                  <span className="text-sm text-coffee-muted">ml</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prep Tools */}
        <div>
          <FieldLabel>Prep</FieldLabel>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input type="checkbox" checked={usedRdt} onChange={e => setUsedRdt(e.target.checked)} className="h-4 w-4 accent-coffee-accent" />
              RDT
            </label>
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input type="checkbox" checked={usedWdt} onChange={e => setUsedWdt(e.target.checked)} className="h-4 w-4 accent-coffee-accent" />
              WDT
            </label>
            <label className="flex items-center gap-2 text-sm text-coffee-text cursor-pointer">
              <input type="checkbox" checked={usedLeveler} onChange={e => setUsedLeveler(e.target.checked)} className="h-4 w-4 accent-coffee-accent" />
              Leveler
            </label>
          </div>
        </div>

        {/* Ausrüstung */}
        {(machines.length > 0 || baskets.length > 0) && (
          <div>
            <FieldLabel>Equipment</FieldLabel>
            <div className="grid gap-2">
              {machines.length > 0 && (
                <Select value={machineId} onChange={e => setMachineId(e.target.value)}>
                  <option value="">Machine (optional)</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}{m.brand ? ` / ${m.brand}` : ''}</option>
                  ))}
                </Select>
              )}
              {baskets.length > 0 && (
                <Select value={basketId} onChange={e => setBasketId(e.target.value)}>
                  <option value="">Basket (optional)</option>
                  {baskets.map(b => (
                    <option key={b.id} value={b.id}>{b.name}{b.size_g ? ` ${b.size_g}g` : ''}</option>
                  ))}
                </Select>
              )}
            </div>
          </div>
        )}

        {/* Ratings */}
        <div className="grid gap-3">
          <RatingField label="Flavor" required infoKey="rating" value={rating} onChange={setRating} />
          <RatingField label="Body" infoKey="body_score" value={bodyScore} onChange={setBodyScore} />
          <RatingField label="Acidity" infoKey="acidity_score" value={acidityScore} onChange={setAcidityScore} />
          <RatingField label="Bitterness" infoKey="bitterness_score" value={bitternessScore} onChange={setBitternessScore} />
        </div>

        {/* Notes */}
        <div>
          <FieldLabel>Tasting Notes</FieldLabel>
          <Textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Chocolate, nuts, slightly acidic..."
            className="resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createShot.isPending || createCoffee.isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}
        >
          {createShot.isPending ? 'Saving...' : 'Save Shot'}
        </button>
      </form>
    </div>
  )
}
