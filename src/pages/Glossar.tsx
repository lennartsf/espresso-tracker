import { useState } from 'react'
import { GLOSSARY } from '../utils/glossaryContent'

const CATEGORY_LABELS = {
  espresso:  '☕ Espresso',
  brew:      '🫖 Brühen',
  equipment: '⚙️ Equipment',
  milch:     '🥛 Milch',
}

export function Glossar() {
  const [query, setQuery] = useState('')

  const filtered = GLOSSARY.filter(entry =>
    entry.term.toLowerCase().includes(query.toLowerCase()) ||
    entry.definition.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">📚 Glossar</h1>
      <p className="text-sm text-slate-500 mb-4">{GLOSSARY.length} Begriffe</p>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Begriff suchen..."
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 mb-4"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">Kein Begriff gefunden.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(entry => (
            <div key={entry.term} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="font-semibold text-slate-800 text-sm">{entry.term}</h2>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  {CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{entry.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
