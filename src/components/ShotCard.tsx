import { Link } from 'react-router-dom'
import { ratingColor } from '../utils/ratingColor'
import type { ShotWithCoffee } from '../hooks/useShots'

interface Props {
  shot: ShotWithCoffee
}

export function ShotCard({ shot }: Props) {
  const roastDate = shot.roast_dates?.roast_date
    ? new Date(shot.roast_dates.roast_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <Link
      to={`/shots/${shot.id}`}
      className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-orange-300 transition-colors"
    >
      <div>
        <p className="font-medium text-slate-800 text-sm">{shot.coffees?.name ?? '—'}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Mahlgrad {shot.grind_setting}
          {shot.brew_time_s ? ` · ${shot.brew_time_s}s` : ''}
          {roastDate ? ` · Röstung ${roastDate}` : ''}
        </p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ${ratingColor(shot.rating)}`}>
        {shot.rating}
      </span>
    </Link>
  )
}
