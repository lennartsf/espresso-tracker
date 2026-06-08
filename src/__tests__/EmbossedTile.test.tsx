import { render, screen } from '@testing-library/react'
import { EmbossedTile } from '../components/dashboard/EmbossedTile'

test('renders children inside the tile', () => {
  render(<EmbossedTile>Hello</EmbossedTile>)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})

test('merges extra className', () => {
  render(<EmbossedTile className="col-span-2"><span>x</span></EmbossedTile>)
  expect(screen.getByText('x').parentElement).toHaveClass('col-span-2')
})
