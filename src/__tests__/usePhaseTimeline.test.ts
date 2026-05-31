import { renderHook, act } from '@testing-library/react'
import { usePhaseTimeline } from '../components/animations/usePhaseTimeline'

describe('usePhaseTimeline', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('starts idle then advances through phases and stops', () => {
    const { result } = renderHook(() => usePhaseTimeline(3, 1000))
    expect(result.current.phase).toBe(-1)

    act(() => { vi.advanceTimersByTime(0) })
    expect(result.current.phase).toBe(0)
    expect(result.current.playing).toBe(true)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.phase).toBe(1)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.phase).toBe(2)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.playing).toBe(false)
  })

  test('replay restarts from phase 0', () => {
    const { result } = renderHook(() => usePhaseTimeline(2, 1000))
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.playing).toBe(false)

    act(() => { result.current.replay() })
    expect(result.current.phase).toBe(-1)
    act(() => { vi.advanceTimersByTime(0) })
    expect(result.current.phase).toBe(0)
    expect(result.current.playing).toBe(true)
  })
})
