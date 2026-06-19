import { useState, useRef } from 'react'

interface Props {
  onTime: (seconds: number) => void
}

/** Referenzfenster für den Pull-Arc: 0–40 s ≙ 0–100 % Ring.
 *  Typischer Espresso-Pull (25–30 s) endet bei ~3/4 — bewusst, der Ring
 *  ist Orientierung, kein Ziel. Updates diskret pro Sekunde (Batterie),
 *  CSS-Transition glättet; bei prefers-reduced-motion springt er. */
const ARC_WINDOW_S = 40
const R = 42
const CIRCUMFERENCE = 2 * Math.PI * R

export function BrewTimer({ onTime }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    startRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000))
    }, 100)
    setRunning(true)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    onTime(elapsed)
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
    startRef.current = null
  }

  const progress = Math.min(elapsed / ARC_WINDOW_S, 1)
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 96 96" className="h-44 w-44 -rotate-90" aria-hidden="true">
          <circle cx="48" cy="48" r={R} fill="none" stroke="var(--coffee-line)" strokeWidth="3" />
          <circle
            cx="48" cy="48" r={R} fill="none"
            stroke="var(--coffee-accent)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500 motion-safe:ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-5xl font-semibold text-coffee-cream tabular-nums">
          {elapsed}<span className="ml-0.5 font-grotesk text-base text-coffee-muted">s</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!running ? (
          <button type="button" onClick={start} className="rounded-xl bg-coffee-surface2 px-4 py-2 text-sm text-coffee-cream hover:bg-coffee-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent">
            ▶ Start
          </button>
        ) : (
          <button type="button" onClick={stop} className="rounded-xl bg-coffee-accent px-4 py-2 text-sm font-semibold text-coffee-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent-soft">
            ■ Stop
          </button>
        )}
        {elapsed > 0 && !running && (
          <button type="button" onClick={reset} aria-label="Reset timer" className="rounded-xl bg-coffee-surface2 px-3 py-2 text-sm text-coffee-muted hover:bg-coffee-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent">
            ↺
          </button>
        )}
      </div>
    </div>
  )
}
