import type { HTMLAttributes } from 'react'

/** Wiederverwendbare Klassen — auch für <Link>-Karten nutzbar.
 *  Embossed/Cockpit-Look (wie Dashboard-Kacheln): Verlauf + Inset-Highlight.
 *
 *  Verlauf und Schatten kommen aus Theme-Tokens statt aus fest verdrahteten
 *  Werten (Paket C1a). In Dark loesen die Tokens exakt die alten Werte auf:
 *  `--coffee-surface-btm` == `--coffee-bg`, `--coffee-card-shadow` == der
 *  frueher hier stehende Schatten. Der Embossed-Look bleibt in beiden Themes —
 *  in Light nur mit neutralem statt goldenem Lichtsaum, sonst wird Weiss gelb. */
export const cardClasses =
  'rounded-2xl border border-coffee-line bg-gradient-to-b from-coffee-surface to-coffee-surface-btm shadow-card'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${cardClasses} ${className}`} {...rest}>
      {children}
    </div>
  )
}
