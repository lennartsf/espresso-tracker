import { render, screen } from '@testing-library/react'
import { BrewRatioBar } from '../components/BrewRatioBar'

test('zeigt Ratio und Labels wenn beide Werte vorhanden', () => {
  render(<BrewRatioBar doseG={18} yieldG={36} />)
  expect(screen.getByText('1 : 2.00')).toBeInTheDocument()
  expect(screen.getByText('18g Dose')).toBeInTheDocument()
  expect(screen.getByText('36g Yield')).toBeInTheDocument()
})

test('zeigt leeren Zustand wenn keine Werte', () => {
  render(<BrewRatioBar doseG={null} yieldG={null} />)
  expect(screen.getByText('— : —')).toBeInTheDocument()
})

test('zeigt Dose-Label auch wenn Yield fehlt', () => {
  render(<BrewRatioBar doseG={18} yieldG={null} />)
  expect(screen.getByText('18g Dose')).toBeInTheDocument()
  expect(screen.getByText('— : —')).toBeInTheDocument()
})
