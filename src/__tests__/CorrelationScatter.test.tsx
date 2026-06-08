import { render, screen } from '@testing-library/react'
import { CorrelationScatter } from '../components/dashboard/CorrelationScatter'

const mk = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ ratio: 1.5 + i * 0.1, flavor: 4 + i, rating: 4 + i }))

test('shows empty state with no points', () => {
  render(<CorrelationScatter points={[]} />)
  expect(screen.getByText(/erfasse shots/i)).toBeInTheDocument()
})

test('renders one point per shot, no regression line below threshold', () => {
  render(<CorrelationScatter points={mk(3)} />)
  expect(screen.getAllByTestId('scatter-point')).toHaveLength(3)
  expect(screen.queryByTestId('regression-line')).toBeNull()
})

test('renders regression line and r-value at/above threshold', () => {
  render(<CorrelationScatter points={mk(5)} />)
  expect(screen.getAllByTestId('scatter-point')).toHaveLength(5)
  expect(screen.getByTestId('regression-line')).toBeInTheDocument()
  expect(screen.getByText(/r =/i)).toBeInTheDocument()
})

test('point fill comes from ratingHex', () => {
  render(<CorrelationScatter points={[{ ratio: 2, flavor: 8, rating: 8 }]} />)
  expect(screen.getByTestId('scatter-point').getAttribute('fill')).toBe('#6fb16a')
})
