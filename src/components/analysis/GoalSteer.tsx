import { useState } from 'react'
import {
  evaluateAgreement, type TasteGoal, type TasteMetric, type LeverId,
} from '../../utils/tasteGuide'
import { AdjustmentCard } from './AdjustmentCard'

interface Props<T> {
  items: T[]
  goals: TasteGoal[]
  leverValue: (item: T, lever: LeverId) => number | null
  metricValue: (item: T, metric: TasteMetric) => number | null
}

export function GoalSteer<T>({ items, goals, leverValue, metricValue }: Props<T>) {
  const [goalId, setGoalId] = useState(goals[0].id)
  const goal = goals.find(g => g.id === goalId) ?? goals[0]

  const metricVals = items.map(i => metricValue(i, goal.metric)).filter((v): v is number => v != null)
  const avg = metricVals.length > 0 ? metricVals.reduce((a, b) => a + b, 0) / metricVals.length : null

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-coffee-muted">What do you want to change?</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {goals.map(g => (
          <button key={g.id} onClick={() => setGoalId(g.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              g.id === goalId
                ? 'border-coffee-accent bg-coffee-accent/15 text-coffee-accent-soft'
                : 'border-coffee-line text-coffee-muted hover:text-coffee-text'
            }`}>
            {g.label}
          </button>
        ))}
      </div>

      {avg != null && (
        <p className="mb-3 text-xs text-coffee-muted">
          You're at <span className="font-semibold text-coffee-cream">{avg.toFixed(1)}/10</span> {goal.metric.replace('_score', '')} for this coffee.
        </p>
      )}

      <div className="space-y-2">
        {goal.adjustments.map((adj, i) => {
          const points = items
            .map(it => ({ x: leverValue(it, adj.lever), y: metricValue(it, goal.metric) }))
            .filter((p): p is { x: number; y: number } => p.x != null && p.y != null)
          const agreement = evaluateAgreement(points, adj.expectedSign)
          return <AdjustmentCard key={adj.lever + adj.direction} adj={adj} agreement={agreement} rank={i + 1} />
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-coffee-muted">
        Directions are general espresso theory. The data badges check whether <em>your own shots for this coffee</em> back it up — they get more reliable as you log more.
      </p>
    </div>
  )
}
