import { useEffect, useRef } from 'react'
import { useAnimate } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Phase = {
  chip: string
  caption: string
}

const PHASES: Phase[] = [
  { chip: '1. Mix in',       caption: 'Pour from a height with a thin stream to mix the milk into the crema' },
  { chip: '2. Float',        caption: 'Lower the pitcher close to the surface — a white circle floats up and grows' },
  { chip: '3. Pull through', caption: 'Lift and draw forward through the center to drag the circle into a heart' },
]

export function LatteHeartAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 2000)
  const [scope, animate] = useAnimate()
  const pitcherRef = useRef<SVGGElement>(null)
  const streamRef = useRef<SVGPathElement>(null)
  const blobRef = useRef<SVGCircleElement>(null)
  const heartRef = useRef<SVGPathElement>(null)
  const pullRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    const els = [pitcherRef, streamRef, blobRef, heartRef, pullRef]
    if (els.some((r) => !r.current)) return

    if (phase < 0) {
      animate(pitcherRef.current!, { x: 0, y: -10 }, { duration: 0 })
      animate(streamRef.current!, { opacity: 0 }, { duration: 0 })
      animate(blobRef.current!, { r: 0, cy: 64, opacity: 0 }, { duration: 0 })
      animate(heartRef.current!, { opacity: 0 }, { duration: 0 })
      animate(pullRef.current!, { y2: 40, opacity: 0 }, { duration: 0 })
      return
    }

    if (phase === 0) {
      // Mix in — pitcher held high, thin stream, tiny white dot in the center
      animate(pitcherRef.current!, { x: 0, y: -10 }, { duration: 0.8, ease: 'easeInOut' })
      animate(streamRef.current!, { opacity: 1 }, { duration: 0.3 })
      animate(blobRef.current!, { r: 4, cy: 60, opacity: 1 }, { duration: 1.2, ease: 'easeOut' })
      animate(heartRef.current!, { opacity: 0 }, { duration: 0.2 })
      animate(pullRef.current!, { y2: 40, opacity: 0 }, { duration: 0.2 })
    } else if (phase === 1) {
      // Float — pitcher dropped low and close, white circle blooms
      animate(pitcherRef.current!, { x: 0, y: 30 }, { duration: 0.9, ease: 'easeInOut' })
      animate(streamRef.current!, { opacity: 1 }, { duration: 0.3 })
      animate(blobRef.current!, { r: 30, cy: 66, opacity: 1 }, { duration: 1.4, ease: 'easeOut' })
    } else {
      // Pull through — lift + move forward across the cup, drag the disc into a heart
      animate(pitcherRef.current!, { x: [0, -8, -50], y: [30, 18, 12] }, { duration: 1.5, ease: 'easeInOut', times: [0, 0.4, 1] })
      animate(streamRef.current!, { opacity: [1, 1, 0] }, { duration: 1.5, times: [0, 0.6, 1] })
      animate(blobRef.current!, { opacity: 0, r: 26 }, { duration: 0.5, ease: 'easeIn' })
      animate(heartRef.current!, { opacity: 1 }, { duration: 0.6, ease: 'easeOut' })
      animate(pullRef.current!, { y2: 84, opacity: [0, 0.8, 0.5] }, { duration: 1.1, ease: 'easeInOut', times: [0, 0.6, 1] })
    }
  }, [phase, animate])

  const active = phase >= 0 ? PHASES[phase] : null

  return (
    <div ref={scope}>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE — scene */}
        <div className="flex-1">
          <svg viewBox="0 0 240 150" className="w-full">
            {/* pitcher group — height + lateral pull animate via x/y */}
            <g ref={pitcherRef}>
              <g transform="translate(116 12) rotate(30)">
                <path d="M0 0 L36 0 L33 28 Q33 32 28 32 L5 32 Q0 32 0 28 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M36 5 L46 2 L43 9 L34 11 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <path d="M0 7 Q-10 10 -8 20" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </g>
            </g>
            {/* milk stream */}
            <path ref={streamRef} d="M150 48 Q146 78 140 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0" />
            {/* cup */}
            <path d="M78 100 Q78 142 120 142 Q162 142 162 100 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="42" ry="11" fill="#78350f" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="30" ry="7" fill="#c9a66b" />
            <path d="M162 110 Q188 110 188 122 Q188 134 162 130" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            <text x="120" y="148" textAnchor="middle" fontSize="9" fill="#64748b">Side — pitcher height</text>
          </svg>
        </div>

        {/* TOP — pattern forms */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="50" fill="#78350f" />
            <circle cx="60" cy="60" r="47" fill="#854d24" />
            {/* heart fill (revealed in the pull-through phase) */}
            <path ref={heartRef} d="M60 46 C60 36 46 36 46 48 C46 60 60 68 60 80 C60 68 74 60 74 48 C74 36 60 36 60 46" fill="white" opacity="0" />
            {/* white blob (mix-in + float) */}
            <circle ref={blobRef} cx="60" cy="64" r="0" fill="white" opacity="0" />
            {/* pull-through drag line */}
            <line ref={pullRef} x1="60" y1="30" x2="60" y2="40" stroke="#fde68a" strokeWidth="2" opacity="0" />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — heart forms</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-4 min-h-[3rem]">
        {active ? active.caption : 'Starting…'}
      </p>

      {/* chips */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
        {PHASES.map((p, i) => (
          <div key={p.chip}
            className={`rounded-lg p-2 font-semibold transition-colors ${
              i === phase ? 'bg-orange-100 border border-orange-300 text-orange-700'
              : i < phase ? 'bg-orange-50 border border-orange-200 text-orange-600'
              : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
            {p.chip}
          </div>
        ))}
      </div>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Pouring…' : '↺ Replay'}
      </button>
    </div>
  )
}
