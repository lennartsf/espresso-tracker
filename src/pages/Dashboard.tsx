import { Link } from 'react-router-dom'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'

export function Dashboard() {
  const { data: shots = [], isLoading } = useShots()

  const avgRating = shots.length > 0
    ? (shots.reduce((sum, s) => sum + s.rating, 0) / shots.length).toFixed(1)
    : '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">☕ Espresso</h1>
        <Link
          to="/shots/new"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          + Neuer Shot
        </Link>
      </div>

      {/* Stats — 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{shots.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Shots total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avgRating}</p>
          <p className="text-xs text-slate-500 mt-0.5">Ø Geschmack</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {shots.filter(s => s.rating >= 8).length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Top Shots (≥8)</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {shots.length > 0
              ? (shots.reduce((s, x) => s + (x.brew_ratio ?? 0), 0) / shots.filter(x => x.brew_ratio !== null).length || 0).toFixed(2)
              : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Ø Verhältnis</p>
        </div>
      </div>

      {/* Shot list — on desktop 2 columns */}
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Letzte Shots
      </h2>

      {isLoading && <p className="text-slate-400 text-sm text-center py-4">Laden...</p>}

      <div className="grid md:grid-cols-2 gap-2 mb-6">
        {shots.slice(0, 10).map(shot => (
          <ShotCard key={shot.id} shot={shot} />
        ))}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8 md:col-span-2">
            Noch keine Shots. Zieh deinen ersten!
          </p>
        )}
      </div>

      {/* CTA only on mobile (desktop has it in header) */}
      <Link
        to="/shots/new"
        className="md:hidden block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold py-3 rounded-xl"
      >
        + Neuer Shot
      </Link>
    </div>
  )
}
