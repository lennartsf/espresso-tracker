import { render, screen, act } from '@testing-library/react'
import { MilkAnimation } from '../components/animations/MilkAnimation'

describe('MilkAnimation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('renders the three phase chips and a replay button', () => {
    render(<MilkAnimation />)
    expect(screen.getByText('Stretch')).toBeInTheDocument()
    expect(screen.getByText('Roll')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    // playback starts on mount (button reads "Steaming…"); run it to the end
    act(() => { vi.advanceTimersByTime(7200) })
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })

  test('shows the stretch caption once playback starts', () => {
    render(<MilkAnimation />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByText(/just below the surface/i)).toBeInTheDocument()
  })

  test('shows the roll caption with whirlpool when that phase is reached', () => {
    render(<MilkAnimation />)
    act(() => { vi.advanceTimersByTime(2400) })
    expect(screen.getByText(/whirlpool/i)).toBeInTheDocument()
  })

  test('shows the temperature note', () => {
    render(<MilkAnimation />)
    expect(screen.getByText(/60–65/)).toBeInTheDocument()
  })
})
