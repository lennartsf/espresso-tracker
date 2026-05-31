import { useEffect, useRef } from 'react'
import { useAnimate } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Phase = {
  label: string
  caption: string
  tipY: number       // steam-wand tip depth
  foamH: number[]    // foam-layer thickness keyframes
  whirl: boolean
}

const SURFACE = 58 // milk surface y inside the pitcher

const PHASES: Phase[] = [
  { label: 'Stretch', caption: 'Tip just below the surface — pull in air. A steady "tsch-tsch" means foam is growing.', tipY: 63, foamH: [4, 30], whirl: false },
  { label: 'Roll',    caption: 'Sink the tip deeper for a whirlpool. No new air — this rolls the foam into silky microfoam.', tipY: 92, foamH: [30, 30], whirl: true },
  { label: 'Done',    caption: 'Lift out around 60–65 °C and give the jug a swirl. The milk should look like wet paint.', tipY: 38, foamH: [30, 30], whirl: false },
]

export function MilkAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 2200)
  const [scope, animate] = useAnimate()
  const foamRef = useRef<SVGRectElement>(null)
  const wandRef = useRef<SVGLineElement>(null)
  const tipRef = useRef<SVGCircleElement>(null)
  const whirlRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!foamRef.current || !wandRef.current || !tipRef.current || !whirlRef.current) return

    if (phase < 0) {
      animate(foamRef.current, { height: 4 }, { duration: 0 })
      animate(tipRef.current, { cy: 38 }, { duration: 0 })
      animate(wandRef.current, { y2: 32 }, { duration: 0 })
      animate(whirlRef.current, { opacity: 0 }, { duration: 0 })
      return
    }

    const p = PHASES[phase]
    animate(foamRef.current, { height: p.foamH }, { duration: 1.8, ease: 'easeOut' })
    animate(tipRef.current, { cy: p.tipY }, { duration: 0.8, ease: 'easeInOut' })
    animate(wandRef.current, { y2: p.tipY - 6 }, { duration: 0.8, ease: 'easeInOut' })

    if (p.whirl) {
      animate(whirlRef.current, { opacity: 0.85 }, { duration: 0.4 })
      animate(whirlRef.current, { rotate: 360 }, { duration: 1.6, ease: 'linear', repeat: Infinity })
    } else {
      animate(whirlRef.current, { opacity: 0, rotate: 0 }, { duration: 0.3 })
    }
  }, [phase, animate])

  const active = phase >= 0 ? PHASES[phase] : null

  return (
    <div ref={scope}>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex justify-center">
        <svg viewBox="0 0 220 150" className="w-full max-w-xs">
          <defs>
            <clipPath id="milk-pitcher">
              <path d="M61 41 L57 112 Q57 120 67 120 L143 120 Q153 120 153 112 L149 41 Z" />
            </clipPath>
          </defs>
          {/* pitcher body + spout + handle */}
          <path d="M60 40 L56 112 Q56 122 68 122 L142 122 Q154 122 154 112 L150 40 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M150 52 L186 62 L186 72 L150 66 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M60 60 Q34 64 36 92 Q38 110 58 106" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          {/* liquid milk */}
          <rect x="56" y={SURFACE} width="98" height={122 - SURFACE} fill="#fef9c3" clipPath="url(#milk-pitcher)" />
          {/* foam layer (grows during stretch) */}
          <rect ref={foamRef} x="56" y={SURFACE} width="98" height="4" fill="white" opacity="0.95" clipPath="url(#milk-pitcher)" />
          {/* whirlpool (roll only) */}
          <g ref={whirlRef} opacity="0" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <path d="M92 95 a18 7 0 1 1 36 0 a13 5 0 1 1 -26 0" fill="none" stroke="#eab308" strokeWidth="1.5" clipPath="url(#milk-pitcher)" />
          </g>
          {/* steam wand */}
          <line ref={wandRef} x1="150" y1="8" x2="112" y2="32" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <circle ref={tipRef} cx="110" cy="38" r="3.5" fill="#64748b" />
        </svg>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-3 min-h-[3rem]">
        {active ? active.caption : 'Starting…'}
      </p>

      {/* phase chips */}
      <div className="flex gap-2 mb-3">
        {PHASES.map((p, i) => (
          <div key={p.label}
            className={`flex-1 rounded-lg p-2 text-center text-xs font-semibold transition-colors ${
              i === phase ? 'bg-sky-100 border border-sky-300 text-sky-700' : i < phase ? 'bg-sky-50 border border-sky-200 text-sky-600' : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
            {p.label}
          </div>
        ))}
      </div>

      {/* right/wrong depth hints */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too deep<br /><span className="text-red-400">no foam</span></div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700">✓ Right<br /><span className="text-green-500">fine microfoam</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too shallow<br /><span className="text-red-400">big bubbles</span></div>
      </div>

      <p className="text-xs text-slate-400 text-center mb-3">Stretch first (brief), then roll until ~60–65 °C — when the jug is too hot to hold, you're done.</p>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Steaming…' : '↺ Replay'}
      </button>
    </div>
  )
}
