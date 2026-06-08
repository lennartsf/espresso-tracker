import type { HTMLAttributes } from 'react'

/** Wiederverwendbare Klassen — auch für <Link>-Karten nutzbar. */
export const cardClasses =
  'rounded-xl border border-coffee-line bg-coffee-surface2 shadow-lg shadow-black/30'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${cardClasses} ${className}`} {...rest}>
      {children}
    </div>
  )
}
