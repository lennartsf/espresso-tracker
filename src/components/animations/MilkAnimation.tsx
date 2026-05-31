import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, useSpin, lerp } from './animationEngine'

type Phase = { label: string; caption: string }

const STEP = 2400
const SURFACE = 58       // milk surface y inside the pitcher
const BOTTOM = 120

const PHASES: Phase[] = [
  { label: 'Stretch', caption: 'Tip just below the surface — the milk starts spinning. Tiny lifts pull in air; you hear a steady "tsch-tsch".' },
  { label: 'Roll',    caption: 'Sink the tip a little deeper. The whirlpool keeps rolling — no new air, just silky microfoam.' },
  { label: 'Done',    caption: 'Lift the tip out around 60–65 °C and swirl. The milk should shine like wet paint.' },
]

// foam-layer thickness
function foamHeight(phase: number, p: number) {
  if (phase === 0) return lerp(4, 26, p)
  if (phase < 0) return 4
  return 26
}

// steam-wand tip y
function tipY(phase: number, p: number) {
  if (phase < 0) return 40
  if (phase === 0) return 62 - 4 * Math.max(0, Math.sin(p * Math.PI * 2)) // shallow, lifts a touch to fold in air
  if (phase === 1) return lerp(62, 90, p)                                 // sinks deeper for microfoam
  return lerp(90, 38, p)                                                  // lifts out
}

export function MilkAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, STEP)
  const p = useRamp(phase, STEP)
  const spinning = phase === 0 || phase === 1
  const angle = useSpin(spinning, phase === 1 ? 320 : 200)

  const active = phase >= 0 ? PHASES[phase] : null
  const foamH = foamHeight(phase, p)
  const tip = tipY(phase, p)

  return (
    <div>
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

          <g clipPath="url(#milk-pitcher)">
            {/* liquid milk */}
            <rect x="56" y={SURFACE} width="98" height={BOTTOM - SURFACE} fill="#fef9c3" />
            {/* foam layer (grows during stretch) */}
            <rect x="56" y={SURFACE} width="98" height={foamH} fill="white" opacity="0.95" />
            {/* whirlpool — visible while spinning, rotates around its center */}
            {spinning && (
              <g transform={`rotate(${angle.toFixed(1)} 105 96)`} opacity="0.85">
                <path d="M105 80 C123 82 124 104 105 110 C90 110 88 96 100 95" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                <path d="M105 112 C87 110 86 88 105 82" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </g>
            )}
          </g>

          {/* steam wand + tip */}
          <line x1="150" y1="8" x2="110" y2={tip - 6} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <circle cx="110" cy={tip} r="3.5" fill="#64748b" />
          {/* depth marker */}
          <line x1="162" y1={tip} x2="174" y2={tip} stroke="#0ea5e9" strokeWidth="1.5" />
          <text x="178" y={tip + 3} fontSize="8" fill="#0ea5e9">tip</text>
        </svg>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-3 min-h-[3rem]">
        {active ? active.caption : 'Starting…'}
      </p>

      {/* phase chips */}
      <div className="flex gap-2 mb-3">
        {PHASES.map((ph, i) => (
          <div key={ph.label}
            className={`flex-1 rounded-lg p-2 text-center text-xs font-semibold transition-colors ${
              i === phase ? 'bg-sky-100 border border-sky-300 text-sky-700' : i < phase ? 'bg-sky-50 border border-sky-200 text-sky-600' : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
            {ph.label}
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
