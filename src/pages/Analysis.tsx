import { useState } from 'react'
import { PageHeader } from '../components/ui'
import { EspressoAnalysis } from '../components/analysis/EspressoAnalysis'
import { BrewsAnalysis } from '../components/analysis/BrewsAnalysis'
import { MilkAnalysis } from '../components/analysis/MilkAnalysis'

type AnalysisTab = 'espresso' | 'brews' | 'milk'

const TABS: { key: AnalysisTab; label: string }[] = [
  { key: 'espresso', label: 'Espresso' },
  { key: 'brews',    label: 'Brews' },
  { key: 'milk',     label: 'Milk' },
]

export function Analysis() {
  const [tab, setTab] = useState<AnalysisTab>('espresso')

  return (
    <div>
      <PageHeader eyebrow="Insights" title="Analysis" subtitle="What to change to steer the taste" />

      <div className="flex border-b border-coffee-line mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-coffee-accent-soft border-b-2 border-coffee-accent -mb-px'
                : 'text-coffee-muted hover:text-coffee-text'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'espresso' && <EspressoAnalysis />}
      {tab === 'brews'    && <BrewsAnalysis />}
      {tab === 'milk'     && <MilkAnalysis />}
    </div>
  )
}
