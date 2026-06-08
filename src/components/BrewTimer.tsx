import { useState, useRef } from 'react'

interface Props {
  onTime: (seconds: number) => void
}

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

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 font-mono text-base font-semibold text-coffee-cream">{elapsed}s</span>
      {!running ? (
        <button type="button" onClick={start} className="rounded bg-coffee-surface2 px-3 py-1 text-sm text-coffee-cream hover:bg-coffee-surface">
          ▶ Start
        </button>
      ) : (
        <button type="button" onClick={stop} className="rounded bg-coffee-accent px-3 py-1 text-sm font-semibold text-coffee-bg">
          ■ Stop
        </button>
      )}
      {elapsed > 0 && !running && (
        <button type="button" onClick={reset} className="rounded bg-coffee-surface2 px-2 py-1 text-sm text-coffee-muted hover:bg-coffee-surface">
          ↺
        </button>
      )}
    </div>
  )
}
