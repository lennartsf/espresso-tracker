import { render, screen, act } from '@testing-library/react'
import { LatteHeartAnimation } from '../components/animations/LatteHeartAnimation'

describe('LatteHeartAnimation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('renders the three phase chips and a replay button', () => {
    render(<LatteHeartAnimation />)
    expect(screen.getByText(/mix in/i)).toBeInTheDocument()
    expect(screen.getByText(/float/i)).toBeInTheDocument()
    expect(screen.getByText(/pull through/i)).toBeInTheDocument()
    // playback starts on mount (button reads "Pouring…"); run it to the end
    act(() => { vi.advanceTimersByTime(6900) })
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })

  test('shows the first caption once playback starts', () => {
    render(<LatteHeartAnimation />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByText(/pour from a height/i)).toBeInTheDocument()
  })
})
