import { useEffect, useRef } from 'react'
import { useAnimate } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Mode = 'bloom' | 'pour' | 'drain'

type Phase = {
  label: string
  time: string
  ml: string
  caption: string
  mode: Mode
  // side view: water-surface y keyframes (bed top = 96; pour in, then settle/drain)
  water: number[]
  stream: boolean
}

const BED_TOP = 96

const PHASES: Phase[] = [
  { label: 'Bloom',  time: '0:00', ml: '45 ml',  caption: 'Evenly saturate the grounds, let it bloom ~30 s', mode: 'bloom', water: [96, 89, 92], stream: true },
  { label: 'Pour 1', time: '0:30', ml: '+60 ml', caption: 'Spiral slowly from the center outward',          mode: 'pour',  water: [92, 60, 68], stream: true },
  { label: 'Pour 2', time: '1:15', ml: '+60 ml', caption: 'Stay near the center, avoid the edges',          mode: 'pour',  water: [68, 50, 58], stream: true },
  { label: 'Pour 3', time: '1:45', ml: '+60 ml', caption: 'Final pour, level the coffee bed',               mode: 'pour',  water: [58, 42, 50], stream: true },
  { label: 'Drain',  time: '2:30', ml: '—',      caption: 'Let it draw down — about 3:00 total',            mode: 'drain', water: [50, 96], stream: false },
]

// Precomputed spiral (top view, center 60,60) — kettle path during a pour.
const SPIRAL = Array.from({ length: 28 }, (_, i) => {
  const t = i / 27
  const ang = t * Math.PI * 4.5
  const r = 5 + t * 35
  return { x: +(60 + Math.cos(ang) * r).toFixed(1), y: +(60 + Math.sin(ang) * r).toFixed(1) }
})
const SPIRAL_X = SPIRAL.map((p) => p.x)
const SPIRAL_Y = SPIRAL.map((p) => p.y)

function timesFor(n: number) {
  if (n === 3) return [0, 0.45, 1]
  if (n === 2) return [0, 1]
  return [0]
}

export function V60Animation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 1800)
  const [scope, animate] = useAnimate()
  const waterRef = useRef<SVGRectElement>(null)
  const streamRef = useRef<SVGLineElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!waterRef.current || !streamRef.current || !dotRef.current) return

    if (phase < 0) {
      animate(waterRef.current, { y: BED_TOP, height: 0 }, { duration: 0 })
      animate(streamRef.current, { opacity: 0 }, { duration: 0 })
      animate(dotRef.current, { opacity: 0, cx: 60, cy: 60 }, { duration: 0 })
      return
    }

    const p = PHASES[phase]
    const surf = p.water
    animate(
      waterRef.current,
      { y: surf, height: surf.map((s) => BED_TOP - s) },
      { duration: 1.4, ease: 'easeInOut', times: timesFor(surf.length) }
    )
    animate(streamRef.current, { opacity: p.stream ? 1 : 0, y2: surf[surf.length - 1] }, { duration: 0.4 })

    if (p.mode === 'pour') {
      animate(dotRef.current, { opacity: 1, cx: SPIRAL_X, cy: SPIRAL_Y }, { duration: 1.5, ease: 'easeInOut' })
    } else if (p.mode === 'bloom') {
      animate(dotRef.current, { opacity: 1, cx: [60, 56, 64, 60], cy: [60, 64, 56, 60] }, { duration: 1.3, ease: 'easeInOut' })
    } else {
      animate(dotRef.current, { opacity: 0 }, { duration: 0.3 })
    }
  }, [phase, animate])

  const active = phase >= 0 ? PHASES[phase] : null

  return (
    <div ref={scope}>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cone ▼ */}
        <div className="flex-1">
          <svg viewBox="0 0 240 140" className="w-full">
            <defs>
              <clipPath id="v60-cone">
                <polygon points="42,20 198,20 120,120" />
              </clipPath>
            </defs>
            <rect ref={waterRef} x="42" width="156" y={BED_TOP} height="0" fill="#93c5fd" clipPath="url(#v60-cone)" />
            {/* coffee bed at the point */}
            <polygon points="101,96 139,96 120,120" fill="#6b3f1d" clipPath="url(#v60-cone)" />
            {/* cone outline + ridges */}
            <polygon points="42,20 198,20 120,120" fill="none" stroke="#f97316" strokeWidth="2.5" />
            <line x1="120" y1="22" x2="120" y2="118" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="78" y1="22" x2="114" y2="114" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="162" y1="22" x2="126" y2="114" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            {/* pour stream */}
            <line ref={streamRef} x1="120" y1="20" x2="120" y2={BED_TOP} stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" opacity="0" />
            <text x="120" y="134" textAnchor="middle" fontSize="9" fill="#64748b">Side — water level</text>
          </svg>
        </div>

        {/* TOP VIEW — spiral */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="52" fill="#fed7aa" stroke="#f97316" strokeWidth="2.5" />
            <circle cx="60" cy="60" r="44" fill="#fef3c7" />
            {[...Array(12)].map((_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <line key={i} x1={60 + Math.cos(a) * 14} y1={60 + Math.sin(a) * 14}
                  x2={60 + Math.cos(a) * 44} y2={60 + Math.sin(a) * 44}
                  stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
              )
            })}
            <circle ref={dotRef} cx="60" cy="60" r="4" fill="#1e293b" opacity="0" />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — pour pattern</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-4 min-h-[3rem]">
        {active ? <><span className="font-semibold text-slate-800">{active.time} · {active.ml}</span> — {active.caption}</> : 'Starting…'}
      </p>

      {/* chips */}
      <div className="flex gap-2 mb-4">
        {PHASES.map((p, i) => (
          <div key={p.label}
            className={`flex-1 rounded-lg p-2 text-center text-xs transition-colors ${
              i === phase ? 'bg-blue-100 border border-blue-300' : i < phase ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
            }`}>
            <p className={`font-semibold ${i <= phase ? 'text-blue-700' : 'text-slate-400'}`}>{p.label}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{p.time}</p>
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
