import type { DashboardLayoutEntry } from '../types'
import { ROUTES } from '../lib/routes'

/**
 * Die Einträge der Navigation — Registry und Datenvertrag.
 *
 * **IDs sind ein Datenvertrag.** Sie stehen in `dashboard_layout.nav_layout` in
 * der Datenbank und damit auf allen Geräten des Users. Eine ID umzubenennen
 * heißt, den Eintrag aus jeder gespeicherten Reihenfolge fallen zu lassen.
 * Neue Einträge bekommen eine neue ID; alte werden entfernt, nicht recycelt.
 * Der `to`-Pfad darf sich dagegen ändern — er wird nicht gespeichert.
 */
export const NAV_ITEMS = [
  { id: 'home',      label: 'Home',      to: ROUTES.app },
  { id: 'shots',     label: 'Shots',     to: ROUTES.shots },
  { id: 'brews',     label: 'Brews',     to: ROUTES.brews },
  { id: 'analysis',  label: 'Analysis',  to: ROUTES.analysis },
  { id: 'coffees',   label: 'Coffees',   to: ROUTES.coffees },
  { id: 'roasters',  label: 'Roasters',  to: ROUTES.roasters },
  { id: 'equipment', label: 'Equipment', to: ROUTES.equipment },
  { id: 'guide',     label: 'Guide',     to: ROUTES.guide },
  { id: 'glossary',  label: 'Glossary',  to: ROUTES.glossary },
  { id: 'settings',  label: 'Settings',  to: ROUTES.settings },
] as const

export type NavId = typeof NAV_ITEMS[number]['id']

/** Wie viele Einträge unten in der Leiste stehen. Der fünfte Platz gehört
 *  immer „More" — ohne den wären die übrigen Seiten am Telefon unerreichbar. */
export const PRIMARY_SLOTS = 4

/** Reihenfolge für einen User, der nichts eingestellt hat. */
export const DEFAULT_NAV: DashboardLayoutEntry[] = NAV_ITEMS.map(i => ({
  id: i.id,
  visible: true,
}))

const KNOWN = new Set<string>(NAV_ITEMS.map(i => i.id))

/**
 * Bringt eine gespeicherte Reihenfolge mit der aktuellen Registry in Einklang.
 *
 * Dasselbe Problem wie beim Dashboard: das iPhone kann eine Reihenfolge
 * geschrieben haben, die eine ältere oder neuere App-Version kennt. Ohne diese
 * Kur bräche die Navigation auf dem zweitgenutzten Gerät nach jedem Release.
 *
 * - **Unbekannte IDs fliegen raus** — ein entfernter Eintrag darf keinen
 *   toten Platz hinterlassen.
 * - **Fehlende Einträge kommen ans Ende**, sichtbar. Eine neue Seite soll man
 *   finden, nicht suchen müssen.
 * - **Doppelte IDs behalten nur ihr erstes Vorkommen** — sonst stünde derselbe
 *   Punkt zweimal in der Leiste und React stolperte über doppelte Keys.
 * - **Kaputte Eingaben** fallen auf den Standard zurück statt auf eine leere
 *   Navigation, aus der man nicht mehr herausfindet.
 */
export function reconcileNav(stored: unknown): DashboardLayoutEntry[] {
  if (!Array.isArray(stored)) return DEFAULT_NAV

  const seen = new Set<string>()
  const cleaned: DashboardLayoutEntry[] = []

  for (const entry of stored) {
    if (!entry || typeof entry !== 'object') continue
    const { id, visible } = entry as Partial<DashboardLayoutEntry>
    if (typeof id !== 'string' || !KNOWN.has(id) || seen.has(id)) continue
    seen.add(id)
    cleaned.push({ id, visible: visible !== false })
  }

  for (const i of NAV_ITEMS) {
    if (!seen.has(i.id)) cleaned.push({ id: i.id, visible: true })
  }

  // Alles ausgeblendet wäre eine Leiste ohne einen einzigen Knopf. Dann lieber
  // den Standard — man käme sonst nicht mehr in die Einstellungen, um es
  // zurückzudrehen.
  return cleaned.some(e => e.visible) ? cleaned : DEFAULT_NAV
}

/** Die ersten vier sichtbaren Einträge — das ist die untere Leiste. */
export function primaryNav(layout: DashboardLayoutEntry[]): DashboardLayoutEntry[] {
  return layout.filter(e => e.visible).slice(0, PRIMARY_SLOTS)
}

/** Alles Übrige — erreichbar über „More". Ausgeblendete Einträge stehen hier
 *  bewusst NICHT: „ausgeblendet" soll heißen „aus der Leiste raus", und die
 *  Seite bleibt über ihre URL und die Desktop-Sidebar erreichbar. */
export function overflowNav(layout: DashboardLayoutEntry[]): DashboardLayoutEntry[] {
  return layout.filter(e => e.visible).slice(PRIMARY_SLOTS)
}

export function navLabel(id: string): string {
  return NAV_ITEMS.find(i => i.id === id)?.label ?? id
}
