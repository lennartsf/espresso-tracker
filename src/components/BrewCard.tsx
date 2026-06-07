import { Link } from 'react-router-dom'
import { cardClasses, RatingBadge, Badge } from './ui'
import { ROUTES } from '../lib/routes'
import { brewMethodLabel } from '../utils/brewMethods'
import { secondsToMMSS } from '../utils/timeFormat'
import type { BrewWithCoffee } from '../hooks/useBrews'

interface Props {
  brew: BrewWithCoffee
}

export function BrewCard({ brew }: Props) {
  const subtitle = [
    brew.grind_setting != null ? `Grind ${brew.grind_setting}` : null,
    brew.dose_g != null ? `${brew.dose_g}g` : null,
    brew.water_ml != null ? `${brew.water_ml} ml` : null,
    brew.brew_time_s != null ? secondsToMMSS(brew.brew_time_s) : null,
    brew.grinders?.name ?? null,
    brew.brew_devices?.name ?? null,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      to={ROUTES.brew(brew.id)}
      className={`${cardClasses} p-3 flex justify-between items-center hover:border-coffee-accent/40 transition-colors`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge>{brewMethodLabel(brew.brew_method)}</Badge>
          <p className="font-medium text-coffee-cream text-sm truncate">{brew.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-coffee-muted mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className="ml-3 flex-shrink-0">
        <RatingBadge value={brew.rating} />
      </span>
    </Link>
  )
}
