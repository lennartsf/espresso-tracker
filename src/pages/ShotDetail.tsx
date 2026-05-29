import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShot, useUpdateShot, useDeleteShot } from '../hooks/useShots'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { RatingInput } from '../components/RatingInput'
import type { ShotWithCoffee } from '../hooks/useShots'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ratingBadge(v: number) {
  if (v >= 8) return 'bg-green-100 text-green-700'
  if (v >= 5) return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-500'
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

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Laden...</p>
  if (error) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Fehler beim Laden des Shots.</p>
      <button onClick={() => navigate('/shots')} className="text-orange-500 text-sm font-semibold">← Zurück</button>
    </div>
  )
  if (!shot) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Shot nicht gefunden.</p>
      <button onClick={() => navigate('/shots')} className="text-orange-500 text-sm font-semibold">← Zurück</button>
    </div>
  )

  if (editing) return <ShotEditForm shot={shot} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Shot wirklich löschen?')) return
    await deleteShot.mutateAsync(shot!.id)
    navigate('/shots')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/shots')} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">{shot.coffees?.name ?? '—'}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">
            Bearbeiten
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteShot.isPending}
            className="text-slate-300 hover:text-red-400 text-sm disabled:opacity-50"
          >
            {deleteShot.isPending ? 'Löschen...' : 'Löschen'}
          </button>
        </div>
      </div>

      {/* Rating prominent */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Gesamtbewertung</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingBadge(shot.rating)}`}>
          {shot.rating}
        </span>
      </div>

      {/* Body + Acidity badges */}
      {(shot.body_score !== null || shot.acidity_score !== null) && (
        <div className="flex gap-2 mb-3">
          {shot.body_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Körper</p>
              <p className="font-bold text-slate-700">{shot.body_score}</p>
            </div>
          )}
          {shot.acidity_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Säure</p>
              <p className="font-bold text-slate-700">{shot.acidity_score}</p>
            </div>
          )}
        </div>
      )}

      {/* 2×2 Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Mahlgrad</p>
          <p className="text-base font-bold text-slate-800">{shot.grind_setting}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Brühzeit</p>
          <p className="text-base font-bold text-slate-800">{shot.brew_time_s ? `${shot.brew_time_s}s` : '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Einwaage → Ausbeute</p>
          <p className="text-base font-bold text-slate-800">
            {shot.dose_g && shot.yield_g ? `${shot.dose_g}g → ${shot.yield_g}g` : '—'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Verhältnis</p>
          <p className="text-base font-bold text-orange-500">
            {shot.brew_ratio ? `1 : ${shot.brew_ratio.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {/* Temp + Röstdatum */}
      {(shot.temp_c !== null || shot.roast_dates?.roast_date) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {shot.temp_c !== null && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperatur</p>
              <p className="text-base font-bold text-slate-800">{shot.temp_c}°C</p>
            </div>
          )}
          {shot.roast_dates?.roast_date && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Röstdatum</p>
              <p className="text-sm font-bold text-slate-800">
                {new Date(shot.roast_dates.roast_date).toLocaleDateString('de-DE')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tasting notes */}
      {shot.tasting_notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Geschmacksnotizen</p>
          <p className="text-sm text-slate-700 italic">„{shot.tasting_notes}"</p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-slate-400 text-center mt-4">{formatDate(shot.pulled_at)}</p>
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
  const [tastingNotes, setTastingNotes] = useState(shot.tasting_notes ?? '')
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
    if (!grindSetting) { setError('Mahlgrad ist erforderlich.'); return }
    if (!rating) { setError('Bitte den Shot bewerten.'); return }

    await updateShot.mutateAsync({
      id: shot.id,
      coffee_id: coffeeId,
      roast_date_id: roastDateId || null,
      pulled_at: fromDatetimeLocal(pulledAt),
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
    })
    onSaved()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">Shot bearbeiten</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Datum & Uhrzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Datum & Uhrzeit</label>
          <input
            type="datetime-local"
            value={pulledAt}
            onChange={e => setPulledAt(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Kaffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
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

        {/* Röstdatum */}
        {recentDates.length > 0 && (
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
                Keine
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

        {/* Mahlgrad + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad *</label>
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
        </div>

        {/* Einwaage + Ausbeute + Ratio */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Einwaage (g)</label>
              <input
                type="number" step="0.1" value={doseG}
                onChange={e => setDoseG(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ausbeute (g)</label>
              <input
                type="number" step="0.1" value={yieldG}
                onChange={e => setYieldG(e.target.value)}
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

        {/* Brühzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit (s)</label>
          <input
            type="number" value={brewTimeS}
            onChange={e => setBrewTimeS(e.target.value)}
            className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Ratings */}
        <div className="grid gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Geschmack *</label>
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Körper</label>
            <RatingInput value={bodyScore} onChange={setBodyScore} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Säure</label>
            <RatingInput value={acidityScore} onChange={setAcidityScore} />
          </div>
        </div>

        {/* Tasting Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Geschmacksnotizen</label>
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
          {updateShot.isPending ? 'Speichern...' : 'Änderungen speichern'}
        </button>
      </form>
    </div>
  )
}
