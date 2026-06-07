import type { TextareaHTMLAttributes } from 'react'
import { fieldClasses } from './Input'

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClasses} ${className}`} {...rest} />
}
