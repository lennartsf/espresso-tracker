import { Link } from 'react-router-dom'
import { GUIDES } from '../utils/guideContent'

export function Guide() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">📖 Guide</h1>
      <p className="text-sm text-slate-500 mb-6">Anleitungen & Troubleshooting</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GUIDES.map(guide => (
          <Link
            key={guide.id}
            to={`/guide/${guide.id}`}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow block"
          >
            <div className="text-3xl mb-2">{guide.icon}</div>
            <div className="font-semibold text-sm text-slate-800 mb-0.5">{guide.title}</div>
            <div className="text-xs text-slate-500 mb-2">{guide.description}</div>
            <div className="flex flex-wrap gap-1">
              {guide.quickProblems.slice(0, 2).map(qp => (
                <span
                  key={qp.targetId}
                  className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
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
