import { Link } from 'react-router-dom'
import { ANIMATIONS } from '../utils/animationContent'
import { ROUTES } from '../lib/routes'
import { cardClasses } from '../components/ui'

export function Animate() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-coffee-cream mb-1">Animate</h1>
      <p className="text-sm text-coffee-muted mb-6">Visual explainers</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ANIMATIONS.map(anim => (
          <Link
            key={anim.id}
            to={ROUTES.animateDetail(anim.id)}
            className={`${cardClasses} block p-4 transition-colors hover:border-coffee-accent/40`}
          >
            <div className="font-semibold text-sm text-coffee-cream mb-0.5">{anim.title}</div>
            <div className="text-xs text-coffee-muted mb-2">{anim.description}</div>
            <div className="flex flex-wrap gap-1">
              {anim.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] bg-coffee-surface2 text-coffee-muted px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
