import type { ReactNode } from 'react'

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-coffee-accent/35 bg-coffee-accent/15 px-2 py-0.5 text-xs font-semibold text-coffee-accent-soft ${className}`}
    >
      {children}
    </span>
  )
}
