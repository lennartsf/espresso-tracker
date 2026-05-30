import { Link } from 'react-router-dom'
import { ratingColor } from '../utils/ratingColor'
import { brewMethodLabel } from '../utils/brewMethods'
import { secondsToMMSS } from '../utils/timeFormat'
import type { BrewWithCoffee } from '../hooks/useBrews'

interface Props {
  brew: BrewWithCoffee
}

export function BrewCard({ brew }: Props) {
  const subtitle = [
    brew.grind_setting != null ? `Mahlgrad ${brew.grind_setting}` : null,
    brew.dose_g != null ? `${brew.dose_g}g` : null,
    brew.water_ml != null ? `${brew.water_ml} ml` : null,
    brew.brew_time_s != null ? secondsToMMSS(brew.brew_time_s) : null,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/brews/${brew.id}`}
      className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-orange-300 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 flex-shrink-0">
            {brewMethodLabel(brew.brew_method)}
          </span>
          <p className="font-medium text-slate-800 text-sm truncate">{brew.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ml-3 flex-shrink-0 ${ratingColor(brew.rating)}`}>
        {brew.rating}
      </span>
    </Link>
  )
}
