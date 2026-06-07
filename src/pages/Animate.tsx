import { Link } from 'react-router-dom'
import { ANIMATIONS } from '../utils/animationContent'
import { ROUTES } from '../lib/routes'

export function Animate() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">🎬 Animate</h1>
      <p className="text-sm text-slate-500 mb-6">Visual explainers</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ANIMATIONS.map(anim => (
          <Link
            key={anim.id}
            to={ROUTES.animateDetail(anim.id)}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow block"
          >
            <div className="text-3xl mb-2">{anim.icon}</div>
            <div className="font-semibold text-sm text-slate-800 mb-0.5">{anim.title}</div>
            <div className="text-xs text-slate-500 mb-2">{anim.description}</div>
            <div className="flex flex-wrap gap-1">
              {anim.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
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
