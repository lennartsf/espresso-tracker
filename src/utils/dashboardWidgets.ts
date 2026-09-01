import type { DashboardLayoutEntry } from '../types'

/** Die Widgets, aus denen sich das Dashboard zusammensetzt.
 *
 *  **IDs sind ein Datenvertrag.** Sie stehen in `dashboard_layout.layout` in der
 *  Datenbank und damit auf allen Geräten des Users. Eine ID umzubenennen heißt,
 *  das Widget auf jedem bestehenden Layout verschwinden zu lassen. Neue Widgets
 *  bekommen eine neue ID; alte werden entfernt, nicht recycelt. */
export const DASHBOARD_WIDGETS = [
  { id: 'flavor-dial', label: 'Ø Flavor dial' },
  { id: 'ratio-bar', label: 'Ø Brew ratio' },
  { id: 'shots-per-day', label: 'Shots per day' },
  { id: 'week-shots', label: "This week's shots" },
] as const

export type WidgetId = typeof DASHBOARD_WIDGETS[number]['id']

/** Reihenfolge und Sichtbarkeit für einen User ohne gespeichertes Layout. */
export const DEFAULT_LAYOUT: DashboardLayoutEntry[] = DASHBOARD_WIDGETS.map(w => ({
  id: w.id,
  visible: true,
}))

const KNOWN = new Set<string>(DASHBOARD_WIDGETS.map(w => w.id))

/**
 * Bringt ein gespeichertes Layout mit der aktuellen Widget-Liste in Einklang.
 *
 * Der Sync macht das nötig: das iPhone kann ein Layout geschrieben haben, das
 * eine ältere oder neuere App-Version kennt. Ohne diese Kur bräche das
 * Dashboard auf dem zweitgenutzten Gerät nach jedem Release.
 *
 * - **Unbekannte IDs fliegen raus** — ein entferntes Widget darf keine leere
 *   Stelle hinterlassen.
 * - **Fehlende Widgets kommen ans Ende**, sichtbar. Ein neues Widget soll man
 *   sehen, nicht suchen müssen.
 * - **Doppelte IDs behalten nur ihr erstes Vorkommen** — sonst würde dasselbe
 *   Widget zweimal gerendert und React über doppelte Keys stolpern.
 * - **Kaputte Eingaben** (kein Array, Einträge ohne `id`) fallen auf den
 *   Default zurück, statt eine leere Seite zu zeigen.
 */
export function reconcileLayout(stored: unknown): DashboardLayoutEntry[] {
  if (!Array.isArray(stored)) return DEFAULT_LAYOUT

  const seen = new Set<string>()
  const cleaned: DashboardLayoutEntry[] = []

  for (const entry of stored) {
    if (!entry || typeof entry !== 'object') continue
    const { id, visible } = entry as Partial<DashboardLayoutEntry>
    if (typeof id !== 'string' || !KNOWN.has(id) || seen.has(id)) continue
    seen.add(id)
    cleaned.push({ id, visible: visible !== false })
  }

  for (const w of DASHBOARD_WIDGETS) {
    if (!seen.has(w.id)) cleaned.push({ id: w.id, visible: true })
  }

  return cleaned
}

/** Verschiebt einen Eintrag um eine Position. Ausserhalb der Grenzen passiert
 *  nichts — der Aufrufer muss nicht pruefen. */
export function moveEntry(
  layout: DashboardLayoutEntry[],
  id: string,
  direction: -1 | 1,
): DashboardLayoutEntry[] {
  const from = layout.findIndex(e => e.id === id)
  if (from === -1) return layout
  const to = from + direction
  if (to < 0 || to >= layout.length) return layout
  const next = [...layout]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

/** Schaltet die Sichtbarkeit eines Eintrags um. */
export function toggleEntry(
  layout: DashboardLayoutEntry[],
  id: string,
): DashboardLayoutEntry[] {
  return layout.map(e => (e.id === id ? { ...e, visible: !e.visible } : e))
}

/** Label zu einer ID — fuer die Bearbeitungsliste. */
export function widgetLabel(id: string): string {
  return DASHBOARD_WIDGETS.find(w => w.id === id)?.label ?? id
}
