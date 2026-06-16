import type { InputHTMLAttributes } from 'react'

export const fieldClasses =
  'block w-full rounded-lg border border-white/15 bg-coffee-surface2 px-3 py-2.5 text-sm text-coffee-text placeholder:text-coffee-muted focus:border-coffee-accent focus:outline-none focus:ring-2 focus:ring-coffee-accent/20'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClasses} ${className}`} {...rest} />
}
