import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  headline: string
  description: string
  ctaLabel?: string
  ctaTo?: string
  /** Alternative zur Link-CTA, z.B. Button der ein Formular öffnet. */
  action?: ReactNode
  className?: string
}

/** Leerstaat nach Design-System: Fraunces-Headline, eine Zeile
 *  Space Grotesk, genau EINE CTA. Ton: trocken, barista-selbstbewusst. */
export function EmptyState({ headline, description, ctaLabel, ctaTo, action, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 py-14 text-center ${className}`}>
      <p className="font-display text-2xl font-semibold text-coffee-cream">{headline}</p>
      <p className="text-sm text-coffee-muted">{description}</p>
      {action}
      {!action && ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="mt-2 rounded-xl bg-coffee-accent px-5 py-2.5 text-sm font-semibold text-coffee-bg hover:bg-coffee-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent-soft"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
