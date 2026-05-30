import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShot, useUpdateShot, useDeleteShot } from '../hooks/useShots'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { useGrinders, useMachines, useBaskets } from '../hooks/useEquipment'
import { RatingInput } from '../components/RatingInput'
import { BrewRatioBar } from '../components/BrewRatioBar'
import { ratingColor } from '../utils/ratingColor'
import { DRINK_TYPES, MILK_TYPES, drinkTypeLabel, milkTypeLabel } from '../utils/drinkTypes'
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

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Loading...</p>
  if (error) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Error loading shot.</p>
      <button onClick={() => navigate('/shots')} className="text-orange-500 text-sm font-semibold">← Back</button>
    </div>
  )
  if (!shot) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Shot not found.</p>
      <button onClick={() => navigate('/shots')} className="text-orange-500 text-sm font-semibold">← Back</button>
    </div>
  )

  if (editing) return <ShotEditForm shot={shot} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Delete this shot?')) return
    await deleteShot.mutateAsync(shot!.id)
    navigate('/shots')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/shots')} className="text-slate-400 text-lg">←</button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">{shot.coffees?.name ?? '—'}</h1>
            {shot.drink_type !== 'espresso' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                {drinkTypeLabel(shot.drink_type)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteShot.isPending}
            className="text-slate-300 hover:text-red-400 text-sm disabled:opacity-50"
          >
            {deleteShot.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Rating prominent */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Overall Rating</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingColor(shot.rating)}`}>
          {shot.rating}
        </span>
      </div>

      {/* Body + Acidity + Bitterness badges */}
      {(shot.body_score !== null || shot.acidity_score !== null || shot.bitterness_score !== null) && (
        <div className="flex gap-2 mb-3">
          {shot.body_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Body</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(shot.body_score)}`}>{shot.body_score}</p>
            </div>
          )}
          {shot.acidity_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Acidity</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(shot.acidity_score)}`}>{shot.acidity_score}</p>
            </div>
          )}
          {shot.bitterness_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Bitterness</p>
              <p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(shot.bitterness_score)}`}>{shot.bitterness_score}</p>
            </div>
          )}
        </div>
      )}

      {/* 2×2 Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Grind Setting</p>
          <p className="text-base font-bold text-slate-800">{shot.grind_setting}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Brew Time</p>
          <p className="text-base font-bold text-slate-800">{shot.brew_time_s ? `${shot.brew_time_s}s` : '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Dose → Yield</p>
          <p className="text-base font-bold text-slate-800">
            {shot.dose_g && shot.yield_g ? `${shot.dose_g}g → ${shot.yield_g}g` : '—'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Ratio</p>
          <p className="text-base font-bold text-orange-500">
            {shot.brew_ratio ? `1 : ${shot.brew_ratio.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {/* Temp + Pressure + Roast Date */}
      {(shot.temp_c !== null || shot.pressure_bar !== null || shot.roast_dates?.roast_date) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {shot.temp_c !== null && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperature</p>
              <p className="text-base font-bold text-slate-800">{shot.temp_c}°C</p>
            </div>
          )}
          {shot.pressure_bar !== null && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Pressure</p>
              <p className="text-base font-bold text-slate-800">{shot.pressure_bar} bar</p>
            </div>
          )}
          {shot.roast_dates?.roast_date && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Roast Date</p>
              <p className="text-sm font-bold text-slate-800">
                {new Date(shot.roast_dates.roast_date).toLocaleDateString('en-GB')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preinfusion */}
      {shot.preinfusion_s !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 flex justify-between items-center">
          <p className="text-xs text-slate-400 uppercase font-semibold">Preinfusion</p>
          <p className="text-base font-bold text-slate-800">{shot.preinfusion_s} s</p>
        </div>
      )}

      {/* Milk */}
      {shot.drink_type !== 'espresso' && (shot.milk_type || shot.milk_ml) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Milk</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-800">
              {shot.milk_type ? milkTypeLabel(shot.milk_type) : '—'}
            </span>
            {shot.milk_ml && (
              <span className="text-sm font-semibold text-slate-600">{shot.milk_ml} ml</span>
            )}
          </div>
        </div>
      )}

      {/* Tasting notes */}
      {shot.tasting_notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Tasting Notes</p>
          <p className="text-sm text-slate-700 italic">„{shot.tasting_notes}"</p>
        </div>
      )}

      {/* Equipment */}
      {(shot.grinders || shot.machines || shot.baskets) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Equipment</p>
          <div className="flex flex-wrap gap-2">
            {shot.grinders && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                ⚙️ {shot.grinders.name}
              </span>
            )}
            {shot.machines && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                🔧 {shot.machines.name}
              </span>
            )}
            {shot.baskets && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                🫙 {shot.baskets.name}{shot.baskets.size_g ? ` ${shot.baskets.size_g}g` : ''}
              </span>
            )}
          </div>
        </div>
      )}
      {/* Timestamp */}
      <p className="text-xs text-slate-400 text-center mt-4">{formatDate(shot.pulled_at)}</p>
      {(shot.used_rdt || shot.used_wdt || shot.used_leveler) && (
        <div className="flex gap-2 justify-center mt-2">
          {shot.used_rdt && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">RDT</span>
          )}
          {shot.used_wdt && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">WDT</span>
          )}
          {shot.used_leveler && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Leveler</span>
          )}
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
          <button type="button" onClick={onCancel} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">Edit Shot</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Drink Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Drink Type</label>
          <div className="flex flex-wrap gap-2">
            {DRINK_TYPES.map(dt => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setDrinkType(dt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  drinkType === dt.value
                    ? 'bg-orange-500 text-white'
                    : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={pulledAt}
            onChange={e => setPulledAt(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Coffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Coffee *</label>
          <select
            value={coffeeId}
            onChange={e => handleCoffeeChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
          >
            {coffees.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.roaster ? ` / ${c.roaster}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Roast Date */}
        {recentDates.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Roast Date</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoastDateId('')}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  roastDateId === '' ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold' : 'border-slate-200 text-slate-500 bg-white'
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
                    roastDateId === rd.id ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold' : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  {formatRoastDate(rd.roast_date)}
                  {i === 0 && <span className="block text-xs text-slate-400 font-normal">Current</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grind + Temp + Pressure */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Grind *</label>
            <input
              type="number" step="0.5" value={grindSetting}
              onChange={e => setGrindSetting(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input
              type="number" value={tempC}
              onChange={e => setTempC(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Pressure (bar)</label>
            <input
              type="number" step="0.1" value={pressureBar}
              onChange={e => setPressureBar(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Dose + Yield + Ratio */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Dose (g)</label>
              <input
                type="number" step="0.1" value={doseG}
                onChange={e => setDoseG(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Yield (g)</label>
              <input
                type="number" step="0.1" value={yieldG}
                onChange={e => setYieldG(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
          <BrewRatioBar
            doseG={doseG ? parseFloat(doseG) : null}
            yieldG={yieldG ? parseFloat(yieldG) : null}
          />
        </div>

        {/* Brew Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brew Time (s)</label>
          <input
            type="number" value={brewTimeS}
            onChange={e => setBrewTimeS(e.target.value)}
            className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Preinfusion */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preinfusion}
              onChange={e => { setPreinfusion(e.target.checked); if (!e.target.checked) setPreinfusionS('') }}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-xs font-semibold text-slate-400 uppercase">Preinfusion</span>
          </label>
          {preinfusion && (
            <>
              <input
                type="number"
                step="0.5"
                value={preinfusionS}
                onChange={e => setPreinfusionS(e.target.value)}
                placeholder="5"
                className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              <span className="text-sm text-slate-400">s</span>
            </>
          )}
        </div>

        {/* Milk */}
        {drinkType !== 'espresso' && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
            <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Milk</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type</label>
                <select
                  value={milkType}
                  onChange={e => setMilkType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
                >
                  <option value="">Select...</option>
                  {MILK_TYPES.map(mt => (
                    <option key={mt.value} value={mt.value}>{mt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Amount</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10"
                    value={milkMl}
                    onChange={e => setMilkMl(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                  <span className="text-sm text-slate-400">ml</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prep Tools */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Prep</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={usedRdt} onChange={e => setUsedRdt(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              RDT
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={usedWdt} onChange={e => setUsedWdt(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              WDT
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={usedLeveler} onChange={e => setUsedLeveler(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              Leveler
            </label>
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Equipment</label>
          <div className="grid gap-2">
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
            <select
              value={machineId}
              onChange={e => setMachineId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="">Machine (optional)</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}{m.brand ? ` / ${m.brand}` : ''}</option>
              ))}
            </select>
            <select
              value={basketId}
              onChange={e => setBasketId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="">Basket (optional)</option>
              {baskets.map(b => (
                <option key={b.id} value={b.id}>{b.name}{b.size_g ? ` ${b.size_g}g` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ratings */}
        <div className="grid gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Flavor *</label>
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Body</label>
            <RatingInput value={bodyScore} onChange={setBodyScore} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Acidity</label>
            <RatingInput value={acidityScore} onChange={setAcidityScore} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Bitterness</label>
            <RatingInput value={bitternessScore} onChange={setBitternessScore} />
          </div>
        </div>

        {/* Tasting Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tasting Notes</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={updateShot.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {updateShot.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
