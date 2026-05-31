import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, useSpin, lerp } from './animationEngine'
import { JUG_BODY, JUG_HANDLE } from './pitcherShape'

type Phase = { label: string; caption: string }

const STEP = 2400

const PHASES: Phase[] = [
  { label: 'Stretch', caption: 'Keep the tip just below the surface, between centre and rim — the milk spins and pulls in air ("tsch-tsch").' },
  { label: 'Roll',    caption: 'Sink the pitcher so the tip runs deeper. The whirlpool keeps rolling — microfoam, no new air.' },
  { label: 'Done',    caption: 'Lift away around 60–65 °C and swirl until the milk shines like wet paint.' },
]

// rotating whirlpool spiral for the top view (starts at the lance on the left)
const SPIN_PATH = (() => {
  let d = 'M22 60'
  const N = 90
  for (let i = 1; i <= N; i++) {
    const t = i / N
    const ang = Math.PI + t * Math.PI * 5
    const r = 38 - t * 36
    d += ` L${(60 + Math.cos(ang) * r).toFixed(1)} ${(60 + Math.sin(ang) * r).toFixed(1)}`
  }
  return d
})()

// the PITCHER moves; the steam wand is fixed
function pitcherY(phase: number, p: number) {
  if (phase < 0) return 0
  if (phase === 0) return lerp(0, 8, p)
  if (phase === 1) return lerp(8, -6, p)
  return lerp(-6, 30, p)
}

export function MilkAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, STEP)
  const p = useRamp(phase, STEP)
  const spinning = phase === 0 || phase === 1
  const angle = useSpin(spinning, phase === 1 ? 320 : 210)
  const active = phase >= 0 ? PHASES[phase] : null
  const py = pitcherY(phase, p)

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — pitcher moves, wand fixed */}
        <div className="flex-1">
          <svg viewBox="0 0 200 150" className="w-full">
            <g transform={`translate(100 ${(76 + py).toFixed(1)}) scale(2.05)`}>
              <path d={JUG_HANDLE} fill="none" stroke="#cbd5e1" strokeWidth="1.6" />
              <path d={JUG_BODY} fill="#fef9c3" stroke="#cbd5e1" strokeWidth="1.6" />
              {/* milk surface sheen near the rim */}
              <ellipse cx="0" cy="-15" rx="13" ry="3" fill="white" opacity="0.6" />
            </g>
            {/* fixed steam wand dipping in (no tip marker) */}
            <line x1="120" y1="6" x2="112" y2="58" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <text x="100" y="146" textAnchor="middle" fontSize="9" fill="#64748b">Side — pitcher moves</text>
          </svg>
        </div>

        {/* TOP VIEW — whirlpool from above, lance on the left */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="48" fill="#fef9c3" stroke="#e2d8a8" strokeWidth="2" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="white" strokeWidth="3" opacity="0.7" />
            {spinning && (
              <g transform={`rotate(${angle.toFixed(1)} 60 60)`}>
                <path d={SPIN_PATH} fill="none" stroke="#eab308" strokeWidth="1.6" opacity="0.7" strokeLinecap="round" />
              </g>
            )}
            <ellipse cx="60" cy="60" rx={spinning ? 9 : 4} ry={spinning ? 6 : 3} fill="#eab308" opacity="0.35" />
            {/* fixed lance position — left, between centre and rim */}
            <circle cx="34" cy="60" r="4" fill="#64748b" />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — milk spins</text>
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
