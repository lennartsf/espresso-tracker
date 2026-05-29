import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShot, useDeleteShot } from '../hooks/useShots'

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

export function ShotDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: shot, isLoading } = useShot(id!)
  const deleteShot = useDeleteShot()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Laden...</p>
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
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">
            Löschen
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

// Placeholder — wird in Task 4 ersetzt
function ShotEditForm(_: { shot: any; onCancel: () => void; onSaved: () => void }) {
  return null
}
