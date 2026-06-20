import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { useShot, useUpdateShot, useDeleteShot } from '../hooks/useShots'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { useGrinders, useMachines, useBaskets } from '../hooks/useEquipment'
import { RatingInput } from '../components/RatingInput'
import { BrewRatioBar } from '../components/BrewRatioBar'
import { ratingBadgeClasses, intensityBadge } from '../utils/ratingColor'
import { DRINK_TYPES, MILK_TYPES, drinkTypeLabel, milkTypeLabel } from '../utils/drinkTypes'
import { cardClasses, Badge, Input, Select, Textarea, FieldLabel, buttonClasses } from '../components/ui'
import type { ShotWithCoffee } from '../hooks/useShots'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}


function toDatetimeLocal(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16)
}

function fromDatetimeLocal(local: string): string {
  return new Date(local).toISOString()
}

export function ShotDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: shot, isLoading, error } = useShot(id ?? '')
  const deleteShot = useDeleteShot()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <p className="text-coffee-muted text-sm text-center py-10">Loading...</p>
  if (error) return (
    <div className="text-center py-10">
      <p className="text-coffee-muted text-sm mb-3">Error loading shot.</p>
      <button onClick={() => navigate(ROUTES.shots)} className="text-coffee-accent-soft text-sm font-semibold">← Back</button>
    </div>
  )
  if (!shot) return (
    <div className="text-center py-10">
      <p className="text-coffee-muted text-sm mb-3">Shot not found.</p>
      <button onClick={() => navigate(ROUTES.shots)} className="text-coffee-accent-soft text-sm font-semibold">← Back</button>
    </div>
  )

  if (editing) return <ShotEditForm shot={shot} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Delete this shot?')) return
    await deleteShot.mutateAsync(shot!.id)
    navigate(ROUTES.shots)
  }

  // Ratio: gespeichertes brew_ratio bevorzugen, sonst aus dose/yield rechnen
  // (ältere Shots haben brew_ratio = null, dose/yield aber gesetzt).
  const displayRatio =
    shot.brew_ratio ??
    (shot.dose_g && shot.yield_g ? shot.yield_g / shot.dose_g : null)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(ROUTES.shots)} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-coffee-cream">{shot.coffees?.name ?? '—'}</h1>
            {shot.drink_type && shot.drink_type !== 'espresso' && (
              <Badge>{drinkTypeLabel(shot.drink_type)}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-coffee-accent-soft text-sm font-semibold">
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteShot.isPending}
            className="text-coffee-muted hover:text-red-400 text-sm disabled:opacity-50"
          >
            {deleteShot.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Rating prominent */}
      <div className={`${cardClasses} p-3 mb-3 flex justify-between items-center`}>
        <span className="text-xs font-semibold text-coffee-muted uppercase">Overall Rating</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingBadgeClasses(shot.rating)}`}>
          {shot.rating}
        </span>
      </div>

      {/* Body + Acidity + Bitterness badges */}
      {(shot.body_score !== null || shot.acidity_score !== null || shot.bitterness_score !== null) && (
        <div className="flex gap-2 mb-3">
          {shot.body_score !== null && (
            <div className={`${cardClasses} flex-1 p-2 text-center`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-0.5">Body</p>
              <p className="font-bold text-sm px-1.5 py-0.5 rounded" style={intensityBadge(shot.body_score)}>{shot.body_score}</p>
            </div>
          )}
          {shot.acidity_score !== null && (
            <div className={`${cardClasses} flex-1 p-2 text-center`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-0.5">Acidity</p>
              <p className="font-bold text-sm px-1.5 py-0.5 rounded" style={intensityBadge(shot.acidity_score)}>{shot.acidity_score}</p>
            </div>
          )}
          {shot.bitterness_score !== null && (
            <div className={`${cardClasses} flex-1 p-2 text-center`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-0.5">Bitterness</p>
              <p className="font-bold text-sm px-1.5 py-0.5 rounded" style={intensityBadge(shot.bitterness_score)}>{shot.bitterness_score}</p>
            </div>
          )}
        </div>
      )}

      {/* 2×2 Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`${cardClasses} p-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Grind Setting</p>
          <p className="text-base font-bold text-coffee-cream">{shot.grind_setting}</p>
        </div>
        <div className={`${cardClasses} p-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Brew Time</p>
          <p className="text-base font-bold text-coffee-cream">{shot.brew_time_s ? `${shot.brew_time_s}s` : '—'}</p>
        </div>
        <div className={`${cardClasses} p-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Dose → Yield</p>
          <p className="text-base font-bold text-coffee-cream">
            {shot.dose_g && shot.yield_g ? `${shot.dose_g}g → ${shot.yield_g}g` : '—'}
          </p>
        </div>
        <div className={`${cardClasses} p-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Ratio</p>
          <p className="text-base font-bold text-coffee-accent-soft">
            {displayRatio ? `1 : ${displayRatio.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {/* Temp + Pressure + Roast Date */}
      {(shot.temp_c !== null || shot.pressure_bar !== null || shot.roast_dates?.roast_date) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {shot.temp_c !== null && (
            <div className={`${cardClasses} p-3`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Temperature</p>
              <p className="text-base font-bold text-coffee-cream">{shot.temp_c}°C</p>
            </div>
          )}
          {shot.pressure_bar !== null && (
            <div className={`${cardClasses} p-3`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Pressure</p>
              <p className="text-base font-bold text-coffee-cream">{shot.pressure_bar} bar</p>
            </div>
          )}
          {shot.roast_dates?.roast_date && (
            <div className={`${cardClasses} p-3`}>
              <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Roast Date</p>
              <p className="text-sm font-bold text-coffee-cream">
                {new Date(shot.roast_dates.roast_date).toLocaleDateString('en-GB')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preinfusion */}
      {shot.preinfusion_s !== null && (
        <div className={`${cardClasses} p-3 mb-3 flex justify-between items-center`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold">Preinfusion</p>
          <p className="text-base font-bold text-coffee-cream">{shot.preinfusion_s} s</p>
        </div>
      )}

      {/* Milk */}
      {shot.drink_type !== 'espresso' && shot.drink_type !== 'caffe_crema' && (shot.milk_type || shot.milk_ml) && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Milk</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-coffee-cream">
              {shot.milk_type ? milkTypeLabel(shot.milk_type) : '—'}
            </span>
            {shot.milk_ml && (
              <span className="text-sm font-semibold text-coffee-text">{shot.milk_ml} ml</span>
            )}
          </div>
        </div>
      )}

      {/* Tasting notes */}
      {shot.tasting_notes && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-1">Tasting Notes</p>
          <p className="text-sm text-coffee-text italic">„{shot.tasting_notes}"</p>
        </div>
      )}

      {/* Equipment */}
      {(shot.grinders || shot.machines || shot.baskets) && (
        <div className={`${cardClasses} p-3 mb-3`}>
          <p className="text-xs text-coffee-muted uppercase font-semibold mb-2">Equipment</p>
          <div className="flex flex-wrap gap-2">
            {shot.grinders && <Badge>Grinder · {shot.grinders.name}</Badge>}
            {shot.machines && <Badge>Machine · {shot.machines.name}</Badge>}
            {shot.baskets && <Badge>Basket · {shot.baskets.name}{shot.baskets.size_g ? ` ${shot.baskets.size_g}g` : ''}</Badge>}
          </div>
        </div>
      )}
      {/* Timestamp */}
      <p className="text-xs text-coffee-muted text-center mt-4">{formatDate(shot.pulled_at)}</p>
      {(shot.used_rdt || shot.used_wdt || shot.used_leveler) && (
        <div className="flex gap-2 justify-center mt-2">
          {shot.used_rdt && <Badge>RDT</Badge>}
          {shot.used_wdt && <Badge>WDT</Badge>}
          {shot.used_leveler && <Badge>Leveler</Badge>}
        </div>
      )}
    </div>
  )
}

function ShotEditForm({
  shot, onCancel, onSaved,
}: {
  shot: ShotWithCoffee
  onCancel: () => void
  onSaved: () => void
}) {
  const updateShot = useUpdateShot()
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const { data: machines = [] } = useMachines()
  const { data: baskets = [] } = useBaskets()

  const [pulledAt, setPulledAt] = useState(toDatetimeLocal(shot.pulled_at))
  const [coffeeId, setCoffeeId] = useState(shot.coffee_id)
  const [roastDateId, setRoastDateId] = useState(shot.roast_date_id ?? '')
  const [grindSetting, setGrindSetting] = useState(String(shot.grind_setting))
  const [doseG, setDoseG] = useState(shot.dose_g ? String(shot.dose_g) : '')
  const [yieldG, setYieldG] = useState(shot.yield_g ? String(shot.yield_g) : '')
  const [brewTimeS, setBrewTimeS] = useState(shot.brew_time_s ? String(shot.brew_time_s) : '')
  const [tempC, setTempC] = useState(shot.temp_c ? String(shot.temp_c) : '')
  const [rating, setRating] = useState<number | null>(shot.rating)
  const [bodyScore, setBodyScore] = useState<number | null>(shot.body_score)
  const [acidityScore, setAcidityScore] = useState<number | null>(shot.acidity_score)
  const [bitternessScore, setBitternessScore] = useState<number | null>(shot.bitterness_score)
  const [preinfusion, setPreinfusion] = useState(shot.preinfusion_s !== null)
  const [preinfusionS, setPreinfusionS] = useState(shot.preinfusion_s != null ? String(shot.preinfusion_s) : '')
  const [tastingNotes, setTastingNotes] = useState(shot.tasting_notes ?? '')
  const [usedRdt, setUsedRdt] = useState(shot.used_rdt ?? false)
  const [usedWdt, setUsedWdt] = useState(shot.used_wdt ?? false)
  const [usedLeveler, setUsedLeveler] = useState(shot.used_leveler ?? false)
  const [pressureBar, setPressureBar] = useState(
    shot.pressure_bar !== null ? String(shot.pressure_bar) : '9'
  )
  const [grinderId, setGrinderId] = useState(shot.grinder_id ?? '')
  const [machineId, setMachineId] = useState(shot.machine_id ?? '')
  const [basketId, setBasketId] = useState(shot.basket_id ?? '')
  const [drinkType, setDrinkType] = useState(shot.drink_type ?? 'espresso')
  const [milkType, setMilkType] = useState(shot.milk_type ?? '')
  const [milkMl, setMilkMl] = useState(shot.milk_ml != null ? String(shot.milk_ml) : '')
  const [error, setError] = useState('')

  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const recentDates = roastDates.slice(0, 2)

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
    if (!grindSetting) { setError('Grind setting is required.'); return }
    if (!rating) { setError('Please rate the shot.'); return }

    try {
      await updateShot.mutateAsync({
        id: shot.id,
        coffee_id: coffeeId,
        roast_date_id: roastDateId || null,
        pulled_at: fromDatetimeLocal(pulledAt),
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
      })
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving.')
    }
  }

  function formatRoastDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="text-lg text-coffee-muted hover:text-coffee-cream">←</button>
          <h1 className="font-display text-2xl font-semibold text-coffee-cream">Edit Shot</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Drink Type */}
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

        {/* Date & Time */}
        <div>
          <FieldLabel>Date & Time</FieldLabel>
          <Input type="datetime-local" value={pulledAt} onChange={e => setPulledAt(e.target.value)} />
        </div>

        {/* Coffee */}
        <div>
          <FieldLabel required>Coffee</FieldLabel>
          <Select value={coffeeId} onChange={e => handleCoffeeChange(e.target.value)}>
            {coffees.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.roaster ? ` / ${c.roaster}` : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* Roast Date */}
        {recentDates.length > 0 && (
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
                None
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
                  {formatRoastDate(rd.roast_date)}
                  {i === 0 && <span className="block text-xs font-normal text-coffee-muted/60">Current</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grind + Temp + Pressure */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel required>Grind</FieldLabel>
            <Input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Temp (°C)</FieldLabel>
            <Input type="number" value={tempC} onChange={e => setTempC(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Pressure (bar)</FieldLabel>
            <Input type="number" step="0.1" value={pressureBar} onChange={e => setPressureBar(e.target.value)} />
          </div>
        </div>

        {/* Dose + Yield + Ratio */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <FieldLabel>Dose (g)</FieldLabel>
              <Input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Yield (g)</FieldLabel>
              <Input type="number" step="0.1" value={yieldG} onChange={e => setYieldG(e.target.value)} />
            </div>
          </div>
          <BrewRatioBar
            doseG={doseG ? parseFloat(doseG) : null}
            yieldG={yieldG ? parseFloat(yieldG) : null}
          />
        </div>

        {/* Brew Time */}
        <div>
          <FieldLabel>Brew Time (s)</FieldLabel>
          <Input type="number" value={brewTimeS} onChange={e => setBrewTimeS(e.target.value)} className="!w-20" />
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

        {/* Milk */}
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
                  <Input type="number" step="10" value={milkMl} onChange={e => setMilkMl(e.target.value)} className="flex-1" />
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

        {/* Equipment */}
        <div>
          <FieldLabel>Equipment</FieldLabel>
          <div className="grid gap-2">
            <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
              <option value="">Grinder (optional)</option>
              {grinders.map(g => (
                <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
              ))}
            </Select>
            <Select value={machineId} onChange={e => setMachineId(e.target.value)}>
              <option value="">Machine (optional)</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}{m.brand ? ` / ${m.brand}` : ''}</option>
              ))}
            </Select>
            <Select value={basketId} onChange={e => setBasketId(e.target.value)}>
              <option value="">Basket (optional)</option>
              {baskets.map(b => (
                <option key={b.id} value={b.id}>{b.name}{b.size_g ? ` ${b.size_g}g` : ''}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Ratings */}
        <div className="grid gap-3">
          <div>
            <FieldLabel required>Flavor</FieldLabel>
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <FieldLabel>Body</FieldLabel>
            <RatingInput value={bodyScore} onChange={setBodyScore} />
          </div>
          <div>
            <FieldLabel>Acidity</FieldLabel>
            <RatingInput value={acidityScore} onChange={setAcidityScore} />
          </div>
          <div>
            <FieldLabel>Bitterness</FieldLabel>
            <RatingInput value={bitternessScore} onChange={setBitternessScore} />
          </div>
        </div>

        {/* Tasting Notes */}
        <div>
          <FieldLabel>Tasting Notes</FieldLabel>
          <Textarea value={tastingNotes} onChange={e => setTastingNotes(e.target.value)} rows={2} className="resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={updateShot.isPending}
          className={buttonClasses('primary', 'w-full disabled:opacity-50')}
        >
          {updateShot.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
