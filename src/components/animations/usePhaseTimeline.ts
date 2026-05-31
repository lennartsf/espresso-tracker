import { useCallback, useEffect, useRef, useState } from 'react'

// Drives an auto-advancing phase index for timed animations.
// phase = -1 (idle) -> 0 .. count-1, then playing flips to false.
// `step` is the per-phase duration in ms — a single number for uniform phases,
// or a stable array for weighted phases (e.g. a long pour + short finish).
export function usePhaseTimeline(count: number, step: number | number[]) {
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
    let acc = 0
    for (let i = 0; i < count; i++) {
      timers.current.push(window.setTimeout(() => setPhase(i), acc))
      acc += Array.isArray(step) ? step[i] : step
    }
    timers.current.push(window.setTimeout(() => setPlaying(false), acc))
  }, [clear, count, step])

  useEffect(() => {
    replay()
    return clear
  }, [replay, clear])

  return { phase, playing, replay }
}
