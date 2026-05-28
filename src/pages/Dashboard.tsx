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
      <h1 className="text-xl font-bold text-slate-800 mb-4">☕ Espresso</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{shots.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Shots total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avgRating}</p>
          <p className="text-xs text-slate-500 mt-0.5">Ø Bewertung</p>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Letzte Shots
      </h2>

      {isLoading && <p className="text-slate-400 text-sm text-center py-4">Laden...</p>}

      <div className="grid gap-2 mb-6">
        {shots.slice(0, 5).map(shot => (
          <ShotCard key={shot.id} shot={shot} />
        ))}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            Noch keine Shots. Zieh deinen ersten!
          </p>
        )}
      </div>

      <Link
        to="/shots/new"
        className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold py-3 rounded-xl"
      >
        + Neuer Shot
      </Link>
    </div>
  )
}
