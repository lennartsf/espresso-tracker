import type { HTMLAttributes } from 'react'

/** Wiederverwendbare Klassen — auch für <Link>-Karten nutzbar.
 *  Embossed/Cockpit-Look (wie Dashboard-Kacheln): Verlauf + Inset-Highlight. */
export const cardClasses =
  'rounded-2xl border border-coffee-line bg-gradient-to-b from-coffee-surface to-coffee-bg shadow-[0_6px_16px_rgba(0,0,0,0.45),inset_0_2px_8px_rgba(233,201,135,0.06)]'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${cardClasses} ${className}`} {...rest}>
      {children}
    </div>
  )
}
