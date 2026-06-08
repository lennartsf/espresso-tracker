import type { ReactNode } from 'react'

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 rounded-lg border border-coffee-accent/30 bg-coffee-surface2 p-3 text-xs text-coffee-cream/80">
      {children}
    </div>
  )
}
