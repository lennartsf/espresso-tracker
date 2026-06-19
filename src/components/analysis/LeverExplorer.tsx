import { useState } from 'react'
import type { LeverId } from '../../utils/tasteGuide'
import { ScatterPlot } from './shared'

export interface MetricOption { key: string; label: string; quality: boolean }
export interface LeverOption { id: LeverId; label: string }

interface Props<T> {
  items: T[]
  levers: LeverOption[]
  metrics: MetricOption[]
  leverValue: (item: T, lever: LeverId) => number | null
  metricValue: (item: T, key: string) => number | null
}

export function LeverExplorer<T>({ items, levers, metrics, leverValue, metricValue }: Props<T>) {
  const [leverId, setLeverId] = useState<LeverId>(levers[0].id)
  const [metricKey, setMetricKey] = useState(metrics[0].key)

  const lever = levers.find(l => l.id === leverId) ?? levers[0]
  const metric = metrics.find(m => m.key === metricKey) ?? metrics[0]

  const data = items
    .map((it, idx) => ({ x: leverValue(it, leverId), y: metricValue(it, metricKey), id: String(idx) }))
    .filter((p): p is { x: number; y: number; id: string } => p.x != null && p.y != null)

  return (
    <div>
      <div className="mb-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-coffee-muted">Lever (x-axis)</p>
        <div className="flex flex-wrap gap-1.5">
          {levers.map(l => (
            <button key={l.id} onClick={() => setLeverId(l.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                l.id === leverId ? 'bg-coffee-accent/15 text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-text'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-coffee-muted">Taste (y-axis)</p>
        <div className="flex flex-wrap gap-1.5">
          {metrics.map(m => (
            <button key={m.key} onClick={() => setMetricKey(m.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                m.key === metricKey ? 'bg-coffee-accent/15 text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-text'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-coffee-muted">
        {lever.label} → {metric.label}
        <span className="ml-1 font-normal">({data.length} shot{data.length !== 1 ? 's' : ''})</span>
      </p>
      <ScatterPlot data={data} xLabel={lever.label} yLabel={metric.label} quality={metric.quality} showTrend />
    </div>
  )
}
