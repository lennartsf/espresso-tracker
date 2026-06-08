import { render, screen } from '@testing-library/react'
import { LiquidBar } from '../components/dashboard/LiquidBar'

test('shows ratio when both values present', () => {
  render(<LiquidBar doseG={18} yieldG={36.7} />)
  expect(screen.getByText('1 : 2.04')).toBeInTheDocument()
})

test('shows empty state when missing', () => {
  render(<LiquidBar doseG={null} yieldG={null} />)
  expect(screen.getByText('— : —')).toBeInTheDocument()
})
