import { Link } from 'react-router-dom'
import { cardClasses, RatingBadge, Badge } from './ui'
import { ROUTES } from '../lib/routes'
import { drinkTypeLabel, milkTypeLabel } from '../utils/drinkTypes'
import type { ShotWithCoffee } from '../hooks/useShots'

interface Props {
  shot: ShotWithCoffee
}

export function ShotCard({ shot }: Props) {
  const isMilkDrink = shot.drink_type !== 'espresso'

  const roastDate = shot.roast_dates?.roast_date
    ? new Date(shot.roast_dates.roast_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const subtitle = isMilkDrink
    ? [
        shot.milk_type ? milkTypeLabel(shot.milk_type) : null,
        shot.milk_ml ? `${shot.milk_ml} ml` : null,
        `Grind ${shot.grind_setting}`,
        shot.grinders?.name ?? null,
      ].filter(Boolean).join(' · ')
    : [
        `Grind ${shot.grind_setting}`,
        shot.brew_time_s ? `${shot.brew_time_s}s` : null,
        shot.grinders?.name ?? null,
        roastDate ? `Roast ${roastDate}` : null,
      ].filter(Boolean).join(' · ')

  return (
    <Link
      to={ROUTES.shot(shot.id)}
      className={`${cardClasses} p-3 flex justify-between items-center hover:border-coffee-accent/40 transition-colors`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge>{drinkTypeLabel(shot.drink_type)}</Badge>
          <p className="font-medium text-coffee-cream text-sm truncate">{shot.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-coffee-muted mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className="ml-3 flex-shrink-0">
        <RatingBadge value={shot.rating} />
      </span>
    </Link>
  )
}
