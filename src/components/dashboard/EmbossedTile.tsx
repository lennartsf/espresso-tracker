import type { ReactNode } from 'react'

/** Geprägte Bento-Kachel: Verlauf + Inset-Schatten + Border (tactile look). */
export function EmbossedTile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-coffee-line bg-gradient-to-b from-coffee-surface to-coffee-bg p-4 shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(233,201,135,0.06)] ${className}`.trim()}
    >
      {children}
    </div>
  )
}
