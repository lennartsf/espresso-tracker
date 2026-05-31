import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, useSpin, lerp } from './animationEngine'

type Mode = 'purge' | 'stretch' | 'roll' | 'finish'
type Phase = { label: string; caption: string; mode: Mode }

// weighted: short purge, stretch ~1/3, roll ~2/3, short finish
const DUR = [700, 2600, 4200, 1000]

const PHASES: Phase[] = [
  { label: 'Purge',   mode: 'purge',   caption: 'Purge the wand, then set the tip just below the surface, in the spout' },
  { label: 'Stretch', mode: 'stretch', caption: 'Tip at the surface — fold in air with a soft "slurp" until the volume grows ~25%' },
  { label: 'Roll',    mode: 'roll',    caption: 'Lift slightly to bury the tip — the whirlpool whisks the bubbles into microfoam' },
  { label: 'Finish',  mode: 'finish',  caption: 'Steam off — rest, tap and swirl until it shines like wet paint' },
]

const SY = 60 // milk surface (local y, before the pitcher's vertical move)

// rotating whirlpool spiral for the top view, starting at the lance (left)
const SPIN_PATH = (() => {
  let d = 'M24 60'
  const N = 90
  for (let i = 1; i <= N; i++) {
    const t = i / N
    const ang = Math.PI + t * Math.PI * 5
    const r = 36 - t * 34
    d += ` L${(60 + Math.cos(ang) * r).toFixed(1)} ${(60 + Math.sin(ang) * r).toFixed(1)}`
  }
  return d
})()

// the PITCHER moves vertically (wand stays fixed); tilt is set once and held
function pitcherY(phase: number, p: number) {
  if (phase < 0) return 0
  if (phase === 0) return 0
  if (phase === 1) return lerp(0, 8, p)   // lower: rising volume keeps tip at the surface
  if (phase === 2) return lerp(8, -6, p)  // lift: tip runs deeper, slurping stops
  return lerp(-6, 28, p)                    // lift the jug away
}
function foamH(phase: number, p: number) {
  if (phase === 1) return lerp(3, 26, p)
  if (phase <= 0) return 3
  return 26
}

export function MilkAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, DUR)
  const p = useRamp(phase, DUR[Math.max(0, phase)] ?? 1000)
  const active = phase >= 0 ? PHASES[phase] : null
  const mode = active?.mode
  const spinning = mode === 'stretch' || mode === 'roll'
  const angle = useSpin(spinning, mode === 'roll' ? 340 : 190)
  const py = pitcherY(phase, p)
  const fh = foamH(phase, p)
  const vortexOpacity = mode === 'roll' ? 0.85 : mode === 'stretch' ? 0.5 : 0

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cross-section: pitcher moves, wand fixed in the spout */}
        <div className="flex-1">
          <svg viewBox="0 0 200 150" className="w-full">
            <defs>
              <clipPath id="milk-vessel">
                <path d="M52 60 C44 64 44 110 53 121 C57 127 66 128 76 128 L124 128 C134 128 143 127 147 121 C156 110 156 64 148 60 Z" />
              </clipPath>
            </defs>
            <g transform={`translate(0 ${py.toFixed(1)})`}>
              <g clipPath="url(#milk-vessel)">
                <rect x="46" y={SY} width="108" height={130 - SY} fill="#fef9c3" />
                <rect x="46" y={SY} width="108" height={fh.toFixed(1)} fill="white" opacity="0.95" />
              </g>
              {/* vessel outline + spout (left) + handle (right) */}
              <path d="M52 58 C44 62 44 110 53 122 C57 128 66 130 76 130 L124 130 C134 130 143 128 147 122 C156 110 156 62 148 58" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
              <path d="M52 58 C44 52 36 52 32 58 C38 56 45 57 52 62" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
              <path d="M148 66 C166 66 166 96 148 98" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
            </g>
            {/* fixed steam wand sitting in the spout (no tip marker) */}
            <line x1="56" y1="6" x2="62" y2="68" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <text x="100" y="146" textAnchor="middle" fontSize="9" fill="#64748b">Side — pitcher moves, wand fixed</text>
          </svg>
        </div>

        {/* TOP VIEW — whirlpool, lance off-centre (left) */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="48" fill="#fef9c3" stroke="#e2d8a8" strokeWidth="2" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="white" strokeWidth="3" opacity="0.7" />
            {spinning && (
              <g transform={`rotate(${angle.toFixed(1)} 60 60)`} opacity={vortexOpacity}>
                <path d={SPIN_PATH} fill="none" stroke="#eab308" strokeWidth="1.7" strokeLinecap="round" />
              </g>
            )}
            <ellipse cx="60" cy="60" rx={spinning ? 9 : 4} ry={spinning ? 6 : 3} fill="#eab308" opacity="0.35" />
            {/* lance position — off-centre, left, between centre and rim */}
            <circle cx="34" cy="60" r="4" fill="#64748b" />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — vortex, tip off-centre</text>
          </svg>
        </div>
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

      {/* right/wrong hints */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700">✓ Tip at surface<br /><span className="text-green-500">fine microfoam</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too deep<br /><span className="text-red-400">no foam</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Air too long<br /><span className="text-red-400">big bubbles</span></div>
      </div>

      <p className="text-xs text-slate-400 text-center mb-3">Air goes in early (cold milk). Stop when the jug is too hot to hold (~60–65 °C) — never above 68 °C.</p>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Steaming…' : '↺ Replay'}
      </button>
    </div>
  )
}
