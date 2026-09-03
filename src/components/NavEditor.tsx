import { Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { cardClasses } from './ui'
import { moveEntry, toggleEntry } from '../utils/dashboardWidgets'
import { navLabel, PRIMARY_SLOTS } from '../utils/navItems'
import type { DashboardLayoutEntry } from '../types'

/**
 * Reihenfolge und Sichtbarkeit der Navigation einstellen.
 *
 * Dieselbe Bedienung wie beim Dashboard (Auge + Pfeile, kein Drag & Drop) und
 * dieselben Helfer `moveEntry`/`toggleEntry` — es ist dasselbe Datenmodell,
 * ein Array aus `{id, visible}`.
 *
 * **Die Trennlinie ist der Punkt.** Unten in der Leiste ist nur Platz für vier
 * Einträge, der fünfte Knopf ist immer „More". Ohne sichtbare Grenze müsste man
 * raten, was es in die Leiste schafft — die Liste zeigt deshalb nach dem
 * vierten sichtbaren Eintrag eine Linie. Verschiebt man „Home" auf Platz drei,
 * steht es genau dort, auch in der Mitte.
 */
export function NavEditor({
  layout,
  onChange,
}: {
  layout: DashboardLayoutEntry[]
  onChange: (next: DashboardLayoutEntry[]) => void
}) {
  // Nach dem wievielten Listeneintrag liegt die Grenze? Ausgeblendete zählen
  // nicht mit — sonst wanderte die Linie beim Ausblenden an die falsche Stelle.
  let visibleSoFar = 0
  const dividerAfter = layout.map(e => {
    if (e.visible) visibleSoFar += 1
    return visibleSoFar === PRIMARY_SLOTS && e.visible
  })
  const firstDivider = dividerAfter.indexOf(true)

  return (
    <div className={`${cardClasses} p-3`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coffee-muted">
        Bottom bar order
      </p>
      <p className="mb-3 text-xs text-coffee-muted">
        The first {PRIMARY_SLOTS} visible entries sit in the bottom bar; the rest move
        behind „More". Hidden entries leave the bar but stay reachable from the sidebar
        and by URL.
      </p>

      <ul className="grid gap-1.5">
        {layout.map((entry, i) => (
          <li key={entry.id}>
            <div className="flex items-center gap-2 rounded-lg border border-coffee-line bg-coffee-surface2 px-3 py-2">
              <span
                className={`flex-1 truncate text-sm ${
                  entry.visible ? 'text-coffee-cream' : 'text-coffee-muted line-through'
                }`}
              >
                {navLabel(entry.id)}
              </span>

              <button
                type="button"
                aria-label={entry.visible ? `Hide ${navLabel(entry.id)}` : `Show ${navLabel(entry.id)}`}
                onClick={() => onChange(toggleEntry(layout, entry.id))}
                className="rounded-md p-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
              >
                {entry.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              <button
                type="button"
                aria-label={`Move ${navLabel(entry.id)} up`}
                disabled={i === 0}
                onClick={() => onChange(moveEntry(layout, entry.id, -1))}
                className="rounded-md p-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                aria-label={`Move ${navLabel(entry.id)} down`}
                disabled={i === layout.length - 1}
                onClick={() => onChange(moveEntry(layout, entry.id, 1))}
                className="rounded-md p-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {i === firstDivider && i < layout.length - 1 && (
              <div className="flex items-center gap-2 py-1.5" aria-hidden="true">
                <span className="h-px flex-1 bg-coffee-line" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-coffee-muted">
                  ↑ bottom bar · below: „More"
                </span>
                <span className="h-px flex-1 bg-coffee-line" />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
