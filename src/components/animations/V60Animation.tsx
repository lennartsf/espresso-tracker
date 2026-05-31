import { motion } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Phase = {
  label: string
  time: string
  ml: string
  caption: string
  // side view: y of water surface (bed top = 98, so height = 98 - y)
  waterY: number
}

const PHASES: Phase[] = [
  { label: 'Bloom',  time: '0:00', ml: '45 ml',  caption: 'Evenly saturate the grounds, let it bloom ~30 s', waterY: 82 },
  { label: 'Pour 1', time: '0:30', ml: '+60 ml', caption: 'Spiral slowly from the center outward',          waterY: 58 },
  { label: 'Pour 2', time: '1:15', ml: '+60 ml', caption: 'Stay near the center, avoid the edges',          waterY: 48 },
  { label: 'Pour 3', time: '1:45', ml: '+60 ml', caption: 'Final pour, level the coffee bed',               waterY: 40 },
  { label: 'Drain',  time: '2:30', ml: '—',      caption: 'Let it draw down — about 3:00 total',            waterY: 98 },
]

const BED_TOP = 98

// Precomputed spiral (top view, center 60,60) — kettle path during a pour.
const SPIRAL = Array.from({ length: 24 }, (_, i) => {
  const t = i / 23
  const ang = t * Math.PI * 4
  const r = 6 + t * 34
  return { x: +(60 + Math.cos(ang) * r).toFixed(1), y: +(60 + Math.sin(ang) * r).toFixed(1) }
})
const SPIRAL_X = SPIRAL.map((p) => p.x)
const SPIRAL_Y = SPIRAL.map((p) => p.y)

export function V60Animation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 1500)
  const active = phase >= 0 ? PHASES[phase] : null
  const waterY = active ? active.waterY : BED_TOP
  const pour = phase >= 1 && phase <= 3
  const blooming = phase === 0

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cone ▼ */}
        <div className="flex-1">
          <svg viewBox="0 0 240 140" className="w-full">
            <defs>
              <clipPath id="v60-cone">
                <polygon points="40,18 200,18 120,120" />
              </clipPath>
            </defs>
            {/* water layer (clipped to cone) */}
            <motion.rect
              x="40" width="160" fill="#93c5fd" clipPath="url(#v60-cone)"
              initial={false}
              animate={{ y: waterY, height: Math.max(0, BED_TOP - waterY) }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* coffee bed at the point */}
            <polygon points="92,98 148,98 120,118" fill="#6b3f1d" clipPath="url(#v60-cone)" />
            {/* cone outline + ridges */}
            <polygon points="40,18 200,18 120,120" fill="none" stroke="#f97316" strokeWidth="2.5" />
            <line x1="120" y1="20" x2="120" y2="116" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="75" y1="20" x2="113" y2="112" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="165" y1="20" x2="127" y2="112" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            {/* pour stream */}
            <motion.line
              x1="120" y1="18" x2="120" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
              animate={{ opacity: pour || blooming ? 1 : 0, y2: waterY }}
              transition={{ duration: 0.4 }}
            />
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
            <motion.circle
              r="4" fill="#1e293b"
              animate={
                pour ? { cx: SPIRAL_X, cy: SPIRAL_Y, opacity: 1 }
                : blooming ? { cx: [60, 56, 64, 60], cy: [60, 64, 56, 60], opacity: 1 }
                : { cx: 60, cy: 60, opacity: 0 }
              }
              transition={{ duration: pour ? 1.2 : 0.8, ease: 'easeInOut' }}
            />
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
