import { Link } from 'react-router-dom'
import { GUIDES } from '../utils/guideContent'
import { ROUTES } from '../lib/routes'
import { cardClasses, PageHeader } from '../components/ui'

export function Guide() {
  return (
    <div>
      <PageHeader eyebrow="Learn" title="Guide" subtitle="Guides & troubleshooting" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GUIDES.map(guide => (
          <Link
            key={guide.id}
            to={ROUTES.guideDetail(guide.id)}
            className={`${cardClasses} block p-4 transition-colors hover:border-coffee-accent/40`}
          >
            <div className="font-semibold text-sm text-coffee-cream mb-0.5">{guide.title}</div>
            <div className="text-xs text-coffee-muted mb-2">{guide.description}</div>
            <div className="flex flex-wrap gap-1">
              {guide.quickProblems.slice(0, 2).map(qp => (
                <span
                  key={qp.targetId}
                  className="text-[10px] bg-coffee-surface2 text-coffee-muted px-2 py-0.5 rounded-full"
                >
                  {qp.label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
