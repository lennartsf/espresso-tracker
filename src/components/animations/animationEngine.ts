import { useEffect, useRef, useState } from 'react'

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const lerpArr = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t))

// Ramps a progress value 0 -> 1 over durationMs every time `key` changes.
// Used to "play" one animation segment per phase. rAF-driven; in test
// environments without rAF it simply stays at 0 (visuals untested by design).
export function useRamp(key: unknown, durationMs: number) {
  const [p, setP] = useState(0)
  useEffect(() => {
    setP(0)
    if (typeof requestAnimationFrame === 'undefined') return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setP(t)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [key, durationMs])
  return p
}

// Continuously increasing angle (deg) while `active` — for rotating a vortex.
export function useSpin(active: boolean, degPerSec = 220) {
  const [angle, setAngle] = useState(0)
  const acc = useRef(0)
  useEffect(() => {
    if (!active || typeof requestAnimationFrame === 'undefined') return
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      if (!last) last = now
      acc.current = (acc.current + (degPerSec * (now - last)) / 1000) % 360
      last = now
      setAngle(acc.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, degPerSec])
  return angle
}
