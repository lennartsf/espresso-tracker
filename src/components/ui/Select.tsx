import type { SelectHTMLAttributes } from 'react'
import { fieldClasses } from './Input'

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23a89784' stroke-width='2'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")"

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${fieldClasses} appearance-none bg-no-repeat ${className}`}
      style={{ backgroundImage: CHEVRON, backgroundPosition: 'right 13px center' }}
      {...rest}
    >
      {children}
    </select>
  )
}
