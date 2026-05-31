import { render, screen, act } from '@testing-library/react'
import { V60Animation } from '../components/animations/V60Animation'

describe('V60Animation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('renders all phase chips and a replay button', () => {
    render(<V60Animation />)
    expect(screen.getByText('Bloom')).toBeInTheDocument()
    expect(screen.getByText('Pour 1')).toBeInTheDocument()
    expect(screen.getByText('Drain')).toBeInTheDocument()
    // playback starts on mount (button reads "Brewing…"); run it to the end
    act(() => { vi.advanceTimersByTime(11800) })
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })

  test('shows the bloom caption once playback starts', () => {
    render(<V60Animation />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByText(/wet all the grounds/i)).toBeInTheDocument()
  })
})
