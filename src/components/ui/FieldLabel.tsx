import type { LabelHTMLAttributes, ReactNode } from 'react'

export function FieldLabel({
  required,
  className = '',
  children,
  ...rest
}: { required?: boolean; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide text-coffee-muted ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-coffee-accent"> *</span>}
    </label>
  )
}
