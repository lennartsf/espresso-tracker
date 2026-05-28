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
      <span className="text-base font-mono font-semibold text-slate-700 w-10">{elapsed}s</span>
      {!running ? (
        <button type="button" onClick={start} className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-sm hover:bg-slate-200">
          ▶ Start
        </button>
      ) : (
        <button type="button" onClick={stop} className="px-3 py-1 rounded bg-orange-500 text-white text-sm">
          ■ Stop
        </button>
      )}
      {elapsed > 0 && !running && (
        <button type="button" onClick={reset} className="px-2 py-1 rounded bg-slate-100 text-slate-400 text-sm">
          ↺
        </button>
      )}
    </div>
  )
}
