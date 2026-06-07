import { render, screen } from '@testing-library/react'
import { Button, buttonClasses } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

test('Button primary nutzt Gold-Akzent', () => {
  render(<Button>Go</Button>)
  expect(screen.getByRole('button', { name: 'Go' }).className).toContain('bg-coffee-accent')
})

test('buttonClasses secondary nutzt Outline', () => {
  expect(buttonClasses('secondary')).toContain('border-coffee-line')
})

test('Badge rendert Inhalt', () => {
  render(<Badge>V60</Badge>)
  expect(screen.getByText('V60')).toBeInTheDocument()
})

test('Card rendert Kinder + Surface-Klasse', () => {
  render(<Card>Inhalt</Card>)
  const el = screen.getByText('Inhalt')
  expect(el.className).toContain('bg-coffee-surface2')
})
