import type { ScaleAdapter } from './types'
import { BookooScale } from './bookoo'

/**
 * Bekannte Waagen. Die UI fragt nie einen Hersteller direkt an, sondern geht
 * immer über diese Liste — ein zweiter Hersteller ist damit ein Eintrag mehr.
 *
 * Bewusst Fabriken statt Instanzen: jede Verbindung soll mit frischem Zustand
 * beginnen, sonst schleppt ein zweiter Verbindungsversuch die Reste des ersten
 * mit sich.
 */
export const SCALE_ADAPTERS: { id: string; name: string; create: () => ScaleAdapter }[] = [
  { id: 'bookoo', name: 'Bookoo Themis', create: () => new BookooScale() },
]

export function createScale(id: string): ScaleAdapter | null {
  return SCALE_ADAPTERS.find(a => a.id === id)?.create() ?? null
}
