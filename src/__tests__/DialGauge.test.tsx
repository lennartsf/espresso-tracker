import { render, screen } from '@testing-library/react'
import { DialGauge } from '../components/dashboard/DialGauge'

const C = 2 * Math.PI * 54

test('renders the label', () => {
  render(<DialGauge value={7.5} max={10} label="Ø Flavor" />)
  expect(screen.getByText('Ø Flavor')).toBeInTheDocument()
})

test('arc dashoffset reflects value/max', () => {
  render(<DialGauge value={7.5} max={10} label="Ø Flavor" />)
  const arc = screen.getByTestId('dial-arc')
  const expected = C * (1 - 7.5 / 10)
  expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(expected, 1)
})

test('clamps and shows empty state for non-finite value', () => {
  render(<DialGauge value={NaN} max={10} label="Ø Flavor" />)
  const arc = screen.getByTestId('dial-arc')
  expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(C, 1) // empty ring
})
