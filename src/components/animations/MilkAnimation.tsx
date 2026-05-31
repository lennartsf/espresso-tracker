import { useState } from 'react'
import { motion } from 'framer-motion'

type Phase = 'stretch' | 'roll'

// pitcher interior: milk surface at y=56, bottom at y=120
const SURFACE = 56

const PHASES: Record<Phase, {
  label: string
  tipY: number      // steam wand tip depth
  foamH: number     // foam layer thickness
  whirlpool: boolean
  caption: string
}> = {
  stretch: { label: 'Stretch (Ziehen)', tipY: 62, foamH: 30, whirlpool: false,
    caption: 'Tip just below the surface — let it pull in air. You should hear a steady "tsch-tsch" as foam grows.' },
  roll:    { label: 'Roll (Rollen)',    tipY: 90, foamH: 30, whirlpool: true,
    caption: 'Sink the tip deeper to create a whirlpool. No new air — this polishes the foam into silky microfoam.' },
}

export function MilkAnimation() {
  const [phase, setPhase] = useState<Phase>('stretch')
  const p = PHASES[phase]
  const foamY = SURFACE
  const milkY = SURFACE + p.foamH

  return (
    <div>
      {/* tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        {(Object.keys(PHASES) as Phase[]).map((key) => (
          <button key={key} onClick={() => setPhase(key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              phase === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {PHASES[key].label}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex justify-center">
        <svg viewBox="0 0 220 150" className="w-full max-w-xs">
          <defs>
            <clipPath id="milk-pitcher">
              <path d="M61 41 L57 112 Q57 120 67 120 L143 120 Q153 120 153 112 L149 41 Z" />
            </clipPath>
          </defs>
          {/* pitcher body */}
          <path d="M60 40 L56 112 Q56 122 68 122 L142 122 Q154 122 154 112 L150 40 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          {/* spout */}
          <path d="M150 52 L186 62 L186 72 L150 66 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          {/* handle */}
          <path d="M60 60 Q34 64 36 92 Q38 110 58 106" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          {/* liquid milk */}
          <motion.rect x="56" width="98" fill="#fef9c3" clipPath="url(#milk-pitcher)"
            initial={false} animate={{ y: milkY, height: 122 - milkY }} transition={{ duration: 0.6 }} />
          {/* foam layer */}
          <motion.rect x="56" width="98" fill="white" opacity="0.95" clipPath="url(#milk-pitcher)"
            initial={false} animate={{ y: foamY, height: p.foamH }} transition={{ duration: 0.6 }} />
          <line x1="56" y1={milkY} x2="154" y2={milkY} stroke="#fde68a" strokeWidth="1" />
          {/* whirlpool (roll only) */}
          <motion.path d="M92 96 a18 8 0 1 1 36 0 a14 6 0 1 1 -28 0" fill="none" stroke="#eab308" strokeWidth="1.5"
            style={{ originX: '110px', originY: '96px' }}
            animate={p.whirlpool ? { opacity: 0.8, rotate: 360 } : { opacity: 0, rotate: 0 }}
            transition={p.whirlpool ? { rotate: { repeat: Infinity, duration: 2, ease: 'linear' }, opacity: { duration: 0.4 } } : { duration: 0.3 }} />
          {/* steam wand */}
          <line x1="150" y1="8" x2="112" y2={p.tipY - 6} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <motion.circle r="3.5" fill="#64748b" cx="110" initial={false} animate={{ cy: p.tipY }} transition={{ duration: 0.6 }} />
          {/* depth marker */}
          <motion.g initial={false} animate={{ y: p.tipY }} transition={{ duration: 0.6 }}>
            <line x1="160" y1="0" x2="172" y2="0" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="176" y="3" fontSize="8" fill="#0ea5e9">tip</text>
          </motion.g>
        </svg>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-3">{p.caption}</p>

      {/* right/wrong depth hints */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too deep<br /><span className="text-red-400">no foam</span></div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700">✓ Right<br /><span className="text-green-500">fine microfoam</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too shallow<br /><span className="text-red-400">big bubbles</span></div>
      </div>

      <p className="text-xs text-slate-400 text-center">Target ~60–65 °C — when the jug is too hot to hold, you're done.</p>
    </div>
  )
}
