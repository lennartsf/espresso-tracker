import { render, screen, fireEvent } from '@testing-library/react'
import { MilkAnimation } from '../components/animations/MilkAnimation'

describe('MilkAnimation', () => {
  test('renders both phase tabs and starts on Stretch', () => {
    render(<MilkAnimation />)
    expect(screen.getByRole('button', { name: /stretch/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /roll/i })).toBeInTheDocument()
    expect(screen.getByText(/just below the surface/i)).toBeInTheDocument()
  })

  test('switches caption when Roll tab is clicked', () => {
    render(<MilkAnimation />)
    fireEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByText(/whirlpool/i)).toBeInTheDocument()
  })

  test('shows the temperature note', () => {
    render(<MilkAnimation />)
    expect(screen.getByText(/60–65/)).toBeInTheDocument()
  })
})
