import { Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { cardClasses } from '../ui'
import { widgetLabel, moveEntry, toggleEntry } from '../../utils/dashboardWidgets'
import type { DashboardLayoutEntry } from '../../types'

/**
 * Bearbeitungsliste fürs Dashboard: Sichtbarkeit umschalten, Reihenfolge über
 * Pfeile ändern.
 *
 * Bewusst kein Drag & Drop: auf dem Handy ist das der teure Teil, und bei vier
 * Kacheln bringen Pfeile dasselbe Ergebnis. Das Layout selbst ist ein
 * serialisierbares Array — Drag & Drop wäre später ein Austausch der Bedienung,
 * nicht des Datenmodells.
 */
export function LayoutEditor({
  layout,
  onChange,
  onDone,
}: {
  layout: DashboardLayoutEntry[]
  onChange: (next: DashboardLayoutEntry[]) => void
  onDone: () => void
}) {
  return (
    <div className={`${cardClasses} mb-4 p-3`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-coffee-muted">
          Arrange dashboard
        </p>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-3 py-1 text-sm font-semibold text-coffee-accent-soft hover:bg-coffee-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
        >
          Done
        </button>
      </div>

      <ul className="grid gap-1.5">
        {layout.map((entry, i) => (
          <li
            key={entry.id}
            className="flex items-center gap-2 rounded-lg border border-coffee-line bg-coffee-surface2 px-3 py-2"
          >
            <span className={`flex-1 truncate text-sm ${entry.visible ? 'text-coffee-cream' : 'text-coffee-muted line-through'}`}>
              {widgetLabel(entry.id)}
            </span>

            <button
              type="button"
              aria-label={entry.visible ? `Hide ${widgetLabel(entry.id)}` : `Show ${widgetLabel(entry.id)}`}
              onClick={() => onChange(toggleEntry(layout, entry.id))}
              className="rounded-md p-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
            >
              {entry.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            <button
              type="button"
              aria-label={`Move ${widgetLabel(entry.id)} up`}
              disabled={i === 0}
              onClick={() => onChange(moveEntry(layout, entry.id, -1))}
              className="rounded-md p-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
            >
              <ChevronUp size={16} />
            </button>

            <button
              type="button"
              aria-label={`Move ${widgetLabel(entry.id)} down`}
              disabled={i === layout.length - 1}
              onClick={() => onChange(moveEntry(layout, entry.id, 1))}
              className="rounded-md p-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
            >
              <ChevronDown size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
