import type { ReactNode } from 'react'
import { cardClasses } from '../ui'

/** Geprägte Bento-Kachel.
 *  War bis C1b eine fast wortgleiche Kopie von `cardClasses` (einziger
 *  Unterschied: 0.05 mehr Alpha im Schatten). Die Dublette hatte keinen Grund
 *  und wäre beim Light-Umbau ein zweiter Ort zum Vergessen gewesen. */
export function EmbossedTile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${cardClasses} p-4 ${className}`.trim()}>{children}</div>
}
