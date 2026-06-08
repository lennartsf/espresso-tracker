import { useState, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { GUIDES } from '../utils/guideContent'
import { ROUTES } from '../lib/routes'
import { cardClasses } from '../components/ui'

export function GuideDetail() {
  const { id } = useParams<{ id: string }>()
  const guide = GUIDES.find(g => g.id === id)
  const [openId, setOpenId] = useState<string | null>(null)
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  if (!guide) return <Navigate to={ROUTES.guide} replace />

  function handleChipClick(targetId: string) {
    setOpenId(targetId)
    setTimeout(() => {
      accordionRefs.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  function toggleAccordion(itemId: string) {
    setOpenId(prev => (prev === itemId ? null : itemId))
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-coffee-cream">{guide.title}</h1>
        <p className="text-sm text-coffee-muted">{guide.description}</p>
      </div>

      {/* Quick chips */}
      <div className={`${cardClasses} p-4 mb-4`}>
        <p className="text-xs uppercase tracking-wide text-coffee-muted mb-3">Common Problems</p>
        <div className="flex flex-wrap gap-2">
          {guide.quickProblems.map(qp => (
            <button
              key={qp.targetId}
              onClick={() => handleChipClick(qp.targetId)}
              className="text-sm bg-coffee-accent/15 text-coffee-accent-soft border border-coffee-accent/35 px-3 py-1.5 rounded-full hover:bg-coffee-accent/25 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className={`${cardClasses} p-4 mb-4`}>
        <h2 className="text-sm font-semibold text-coffee-cream mb-3">Step by Step</h2>
        <div className="flex flex-col gap-3">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="bg-coffee-accent text-coffee-bg rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-medium text-coffee-cream">{step.title}</div>
                <div className="text-xs text-coffee-muted">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting accordion */}
      <div className={`${cardClasses} overflow-hidden mb-6`}>
        <h2 className="text-sm font-semibold text-coffee-cream p-4 border-b border-coffee-line">Troubleshooting</h2>
        {guide.troubleshooting.map((item, i) => (
          <div
            key={item.id}
            ref={el => { accordionRefs.current[item.id] = el }}
            className={i < guide.troubleshooting.length - 1 ? 'border-b border-coffee-line' : ''}
          >
            <button
              onClick={() => toggleAccordion(item.id)}
              className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-coffee-surface2 transition-colors"
            >
              <span className="text-sm font-medium text-coffee-cream">{item.problem}</span>
              <span className="text-coffee-muted text-xs ml-2 shrink-0">
                {openId === item.id ? '▲' : '▼'}
              </span>
            </button>
            {openId === item.id && (
              <div className="px-4 pb-4 pt-1 bg-coffee-bg">
                <p className="text-xs text-coffee-muted mb-2">
                  <strong className="text-coffee-text">Cause:</strong> {item.cause}
                </p>
                <ul className="text-xs text-coffee-text list-disc pl-4 space-y-1">
                  {item.solutions.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
