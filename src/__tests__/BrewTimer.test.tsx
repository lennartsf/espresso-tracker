import { render, screen, act, fireEvent } from '@testing-library/react'
import { BrewTimer } from '../components/BrewTimer'

describe('BrewTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('shows Start button initially', () => {
    render(<BrewTimer onTime={() => {}} />)
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  test('switches to Stop button after clicking Start', () => {
    render(<BrewTimer onTime={() => {}} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /start/i })) })
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  test('calls onTime with elapsed seconds when stopped', () => {
    const onTime = vi.fn()
    render(<BrewTimer onTime={onTime} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /start/i })) })
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: /stop/i })) })
    expect(onTime).toHaveBeenCalledWith(expect.any(Number))
  })
})
