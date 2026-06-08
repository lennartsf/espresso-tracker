import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

/** Klassen-Helper — für echte <button> und für <Link> mit Button-Optik. */
export function buttonClasses(variant: Variant = 'primary', extra = ''): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition'
  const v =
    variant === 'primary'
      ? 'bg-coffee-accent text-coffee-bg hover:bg-coffee-accent-soft'
      : 'border border-coffee-line text-coffee-cream hover:bg-coffee-surface'
  return `${base} ${v} ${extra}`.trim()
}

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses(variant, className)} {...rest} />
}
