import { motion } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Phase = {
  chip: string
  caption: string
  pitcherY: number  // side: vertical offset of pitcher group (higher number = lower pitcher)
  blobR: number     // top: white blob radius
  heart: boolean    // top: heart formed
}

const PHASES: Phase[] = [
  { chip: '1. Mix in',       caption: 'Pour from a height with a thin stream to mix milk into the crema', pitcherY: 0,  blobR: 5,  heart: false },
  { chip: '2. Float',        caption: 'Lower the pitcher close to the surface — a white circle floats up', pitcherY: 34, blobR: 30, heart: false },
  { chip: '3. Pull through', caption: 'Lift and draw forward through the center to finish the heart point', pitcherY: 14, blobR: 30, heart: true },
]

const HEART = 'M60 46 C60 36 46 36 46 48 C46 60 60 68 60 80 C60 68 74 60 74 48 C74 36 60 36 60 46'

export function LatteHeartAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 1800)
  const active = phase >= 0 ? PHASES[phase] : PHASES[0]
  const streaming = phase === 0 || phase === 1

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE — scene */}
        <div className="flex-1">
          <svg viewBox="0 0 240 150" className="w-full">
            {/* pitcher group, height varies by phase */}
            <motion.g initial={false} animate={{ y: active.pitcherY }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
              <g transform="translate(116 12) rotate(30)">
                <path d="M0 0 L36 0 L33 28 Q33 32 28 32 L5 32 Q0 32 0 28 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M36 5 L46 2 L43 9 L34 11 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <path d="M0 7 Q-10 10 -8 20" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </g>
            </motion.g>
            {/* milk stream */}
            <motion.path d="M150 48 Q146 78 140 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
              animate={{ opacity: streaming ? 1 : 0 }} transition={{ duration: 0.3 }} />
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
            {/* white blob (phases 1-2) */}
            <motion.circle cx="60" fill="white"
              initial={false}
              animate={{ r: active.heart ? 0 : active.blobR, cy: 62, opacity: active.heart ? 0 : 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }} />
            {/* heart fill + pull-through draw (phase 3) */}
            <motion.path d={HEART} fill="white"
              initial={false} animate={{ opacity: active.heart ? 1 : 0 }} transition={{ duration: 0.5 }} />
            <motion.path d="M60 30 L60 82" stroke="#fde68a" strokeWidth="2" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: active.heart ? 1 : 0, opacity: active.heart ? 0.7 : 0 }}
              transition={{ duration: 0.6 }} />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — heart forms</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-4 min-h-[3rem]">
        {phase >= 0 ? active.caption : 'Starting…'}
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
