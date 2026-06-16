import { render, screen } from '@testing-library/react'
import { Button, buttonClasses } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { RatingBadge } from '../components/ui/RatingBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { FieldLabel } from '../components/ui/FieldLabel'
import { InfoButton } from '../components/ui/InfoButton'
import { InfoBox } from '../components/ui/InfoBox'

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

test('RatingBadge zeigt Wert + Funktionsfarbe', () => {
  render(<RatingBadge value={9} />)
  const el = screen.getByText('9')
  expect(el.className).toContain('green')
})

test('PageHeader zeigt Titel + Action', () => {
  render(<PageHeader title="Espresso" action={<button>+ New</button>} />)
  expect(screen.getByText('Espresso')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '+ New' })).toBeInTheDocument()
})

test('Input reicht Props durch + Feld-Klasse', () => {
  render(<Input placeholder="grind" />)
  expect(screen.getByPlaceholderText('grind').className).toContain('bg-coffee-surface2')
})

test('Select rendert Optionen', () => {
  render(<Select><option>Espresso Forte</option></Select>)
  expect(screen.getByRole('option', { name: 'Espresso Forte' })).toBeInTheDocument()
})

test('FieldLabel zeigt Stern bei required', () => {
  render(<FieldLabel required>Rating</FieldLabel>)
  expect(screen.getByText('Rating')).toBeInTheDocument()
  expect(screen.getByText('*')).toBeInTheDocument()
})

test('InfoButton open-State nutzt Gold', () => {
  render(<InfoButton open onClick={() => {}} />)
  expect(screen.getByRole('button', { name: 'i' }).className).toContain('bg-coffee-accent')
})

test('InfoBox rendert Kinder', () => {
  render(<InfoBox>Erklärung</InfoBox>)
  expect(screen.getByText('Erklärung')).toBeInTheDocument()
})

test('glow variant returns gold gradient + glow shadow classes', () => {
  const cls = buttonClasses('glow')
  expect(cls).toContain('bg-gradient-to-b')
  expect(cls).toContain('shadow-')
})
