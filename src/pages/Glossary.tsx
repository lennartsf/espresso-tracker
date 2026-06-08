import { useState } from 'react'
import { GLOSSARY } from '../utils/glossaryContent'
import { cardClasses, Input } from '../components/ui'

const CATEGORY_LABELS = {
  espresso:  'Espresso',
  brew:      'Brew',
  equipment: 'Equipment',
  milk:      'Milk',
}

export function Glossary() {
  const [query, setQuery] = useState('')

  const filtered = GLOSSARY.filter(entry =>
    entry.term.toLowerCase().includes(query.toLowerCase()) ||
    entry.definition.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-coffee-cream mb-1">Glossary</h1>
      <p className="text-sm text-coffee-muted mb-4">{GLOSSARY.length} terms</p>

      <Input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search terms..."
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No terms found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(entry => (
            <div key={entry.term} className={`${cardClasses} p-4`}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="font-semibold text-coffee-cream text-sm">{entry.term}</h2>
                <span className="text-[10px] text-coffee-muted bg-coffee-surface2 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  {CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <p className="text-sm text-coffee-text leading-relaxed">{entry.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
