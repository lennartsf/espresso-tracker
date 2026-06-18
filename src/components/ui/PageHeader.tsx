import type { ReactNode } from 'react'

/** Page header in the home/cockpit style: accent eyebrow + large display title
 *  + optional subtitle, with an optional action on the right. */
export function PageHeader({
  eyebrow, title, subtitle, action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-accent">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl font-bold text-coffee-cream">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-coffee-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
