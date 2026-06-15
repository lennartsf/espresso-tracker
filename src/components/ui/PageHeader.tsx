import type { ReactNode } from 'react'

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="relative mb-6 flex items-center justify-between gap-3">
      {/* Pull-Arc — single decorative motif (extraction), faint behind the title */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 60"
        className="pointer-events-none absolute -left-2 -top-3 h-12 w-24 text-coffee-accent/20"
        fill="none"
      >
        <path d="M4 56 A 56 56 0 0 1 116 56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <h1 className="relative font-display text-2xl font-semibold text-coffee-cream">{title}</h1>
      <div className="relative">{action}</div>
    </div>
  )
}
