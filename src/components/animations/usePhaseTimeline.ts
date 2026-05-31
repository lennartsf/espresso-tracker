import { useCallback, useEffect, useRef, useState } from 'react'

// Drives an auto-advancing phase index for timed animations.
// phase = -1 (idle) -> 0 .. count-1, then playing flips to false.
export function usePhaseTimeline(count: number, stepMs: number) {
  const [phase, setPhase] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timers = useRef<number[]>([])

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }, [])

  const replay = useCallback(() => {
    clear()
    setPhase(-1)
    setPlaying(true)
    for (let i = 0; i < count; i++) {
      timers.current.push(window.setTimeout(() => setPhase(i), i * stepMs))
    }
    timers.current.push(window.setTimeout(() => setPlaying(false), count * stepMs))
  }, [clear, count, stepMs])

  useEffect(() => {
    replay()
    return clear
  }, [replay, clear])

  return { phase, playing, replay }
}
