import { ArrowDown, ArrowUp, Check, HelpCircle, X } from 'lucide-react'
import { LEVERS, type Adjustment, type Agreement } from '../../utils/tasteGuide'

const DIRECTION_LABEL: Record<Adjustment['direction'], { word: string; up: boolean }> = {
  finer:   { word: 'finer',   up: true },
  coarser: { word: 'coarser', up: false },
  higher:  { word: 'higher',  up: true },
  lower:   { word: 'lower',   up: false },
  longer:  { word: 'longer',  up: true },
  shorter: { word: 'shorter', up: false },
  more:    { word: 'more',    up: true },
  less:    { word: 'less',    up: false },
}

function DataBadge({ a }: { a: Agreement }) {
  if (!a.enough) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-coffee-surface2 px-2 py-0.5 text-[10px] text-coffee-muted">
        <HelpCircle size={11} /> Not enough of your shots yet
      </span>
    )
  }
  if (a.agrees == null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-coffee-surface2 px-2 py-0.5 text-[10px] text-coffee-muted">
        Grind is grinder-specific — no data check
      </span>
    )
  }
  if (a.agrees) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
        <Check size={11} /> Your shots agree (r {a.r.toFixed(2)})
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
      <X size={11} /> Your shots don't show this (r {a.r.toFixed(2)})
    </span>
  )
}

export function AdjustmentCard({ adj, agreement, rank }: {
  adj: Adjustment
  agreement: Agreement
  rank: number
}) {
  const dir = DIRECTION_LABEL[adj.direction]
  const lever = LEVERS[adj.lever]
  return (
    <div className="flex items-start gap-3 rounded-xl border border-coffee-line bg-coffee-surface2 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coffee-accent/15 text-xs font-bold text-coffee-accent-soft">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-display text-base font-semibold text-coffee-cream">
          {lever.label}
          <span className="inline-flex items-center gap-0.5 text-coffee-accent-soft">
            {dir.up ? <ArrowUp size={15} /> : <ArrowDown size={15} />}{dir.word}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-coffee-muted">{adj.reason}</p>
        <div className="mt-2"><DataBadge a={agreement} /></div>
      </div>
    </div>
  )
}
