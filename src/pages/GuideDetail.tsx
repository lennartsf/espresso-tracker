import { useState, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { GUIDES } from '../utils/guideContent'

export function GuideDetail() {
  const { id } = useParams<{ id: string }>()
  const guide = GUIDES.find(g => g.id === id)
  const [openId, setOpenId] = useState<string | null>(null)
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  if (!guide) return <Navigate to="/guide" replace />

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
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl">{guide.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{guide.title}</h1>
          <p className="text-sm text-slate-500">{guide.description}</p>
        </div>
      </div>

      {/* Quick chips */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">Common Problems</p>
        <div className="flex flex-wrap gap-2">
          {guide.quickProblems.map(qp => (
            <button
              key={qp.targetId}
              onClick={() => handleChipClick(qp.targetId)}
              className="text-sm bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">📋 Step by Step</h2>
        <div className="flex flex-col gap-3">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-medium text-slate-800">{step.title}</div>
                <div className="text-xs text-slate-500">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting accordion */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        <h2 className="text-sm font-semibold text-slate-700 p-4 border-b border-slate-100">⚠️ Troubleshooting</h2>
        {guide.troubleshooting.map((item, i) => (
          <div
            key={item.id}
            ref={el => { accordionRefs.current[item.id] = el }}
            className={i < guide.troubleshooting.length - 1 ? 'border-b border-slate-100' : ''}
          >
            <button
              onClick={() => toggleAccordion(item.id)}
              className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">{item.problem}</span>
              <span className="text-slate-400 text-xs ml-2 shrink-0">
                {openId === item.id ? '▲' : '▼'}
              </span>
            </button>
            {openId === item.id && (
              <div className="px-4 pb-4 pt-1 bg-slate-50">
                <p className="text-xs text-slate-500 mb-2">
                  <strong>Cause:</strong> {item.cause}
                </p>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
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
