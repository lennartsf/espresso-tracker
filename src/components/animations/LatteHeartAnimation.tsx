import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, lerp, lerpArr } from './animationEngine'
import { JUG_BODY, JUG_HANDLE, JUG_SPOUT } from './pitcherShape'

type Phase = { chip: string; caption: string }

// weighted phase durations (ms): mix-in is by far the longest
const DUR = [4000, 1800, 1100]

const PHASES: Phase[] = [
  { chip: '1. Mix in',       caption: 'Pour from a height into the centre — fill the cup and blend the crema (most of the pour)' },
  { chip: '2. Float',        caption: 'Drop the pitcher right down onto the surface — a white circle floats up and grows wide' },
  { chip: '3. Pull through', caption: 'Lift and draw forward to the far rim — a thin line finishes the heart' },
]

// Top-view shapes: identical anchor structure (M + 4 cubics) so they morph cleanly.
const DISC  = [60, 36, 49, 36, 38, 47, 38, 58, 38, 69, 49, 80, 60, 80, 71, 80, 82, 69, 82, 58, 82, 47, 71, 36, 60, 36]
const HEART = [60, 48, 56, 34, 40, 38, 38, 52, 38, 66, 52, 74, 60, 82, 68, 74, 82, 66, 82, 52, 82, 38, 64, 34, 60, 48]

function pathFrom(pts: number[]) {
  const n = (i: number) => pts[i].toFixed(1)
  return `M${n(0)} ${n(1)} C${n(2)} ${n(3)} ${n(4)} ${n(5)} ${n(6)} ${n(7)} C${n(8)} ${n(9)} ${n(10)} ${n(11)} ${n(12)} ${n(13)} C${n(14)} ${n(15)} ${n(16)} ${n(17)} ${n(18)} ${n(19)} C${n(20)} ${n(21)} ${n(22)} ${n(23)} ${n(24)} ${n(25)} Z`
}

const BOWL_BOTTOM = 138

// brown fill level (y of the milk surface) — the cup fills during mix-in
function fillY(phase: number, p: number) {
  if (phase < 0) return 132
  if (phase === 0) return lerp(132, 100, p) // empty espresso -> ~3/4 full
  return 100
}
// cup tilt (deg) — tilted at the start, uprights as it fills
function tilt(phase: number, p: number) {
  if (phase < 0) return 12
  if (phase === 0) return lerp(12, 3, p)
  if (phase === 1) return lerp(3, 0, p)
  return 0
}
// pitcher spout-tip position (side view)
function spoutTip(phase: number, p: number, ly: number) {
  if (phase <= 0) return { x: 120, y: 40 }                        // high, centred
  if (phase === 1) return { x: 120, y: lerp(40, ly - 10, Math.min(1, p / 0.3)) } // drop onto the surface
  return { x: lerp(120, 150, p), y: lerp(ly - 10, 58, p) }        // lift + draw forward
}

export function LatteHeartAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, DUR)
  const p = useRamp(phase, DUR[Math.max(0, phase)] ?? 1000)
  const active = phase >= 0 ? PHASES[phase] : null

  const ly = fillY(phase, p)
  const td = tilt(phase, p)
  const tip = spoutTip(phase, p, ly)
  const streaming = phase === 0 || phase === 1 || (phase === 2 && p < 0.5)

  // top view
  const blobR = phase < 0 ? 0 : phase === 0 ? 0 : phase === 1 ? lerp(3, 23, p) : 0
  const morph = phase === 2 ? p : 0
  const pourY = phase === 2 ? lerp(70, 28, p) : 0 // pour point drags away; heart point trails toward the drinker

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE — cup fills & tilts upright, pitcher height changes */}
        <div className="flex-1">
          <svg viewBox="0 0 240 160" className="w-full">
            <defs>
              <clipPath id="latte-bowl">
                <path d="M58 94 Q58 138 120 138 Q182 138 182 94 Z" />
              </clipPath>
            </defs>
            <g transform={`rotate(${td.toFixed(1)} 120 138)`}>
              {/* coffee fill */}
              <rect x="56" y={ly.toFixed(1)} width="128" height={(BOWL_BOTTOM - ly).toFixed(1)} fill="#6f4322" clipPath="url(#latte-bowl)" />
              <ellipse cx="120" cy={ly.toFixed(1)} rx={(58 * (BOWL_BOTTOM - ly) / 44).toFixed(1)} ry="5" fill="#7c4a26" clipPath="url(#latte-bowl)" />
              {/* cup */}
              <path d="M56 94 Q56 140 120 140 Q184 140 184 94" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
              <ellipse cx="120" cy="94" rx="64" ry="11" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
              <path d="M184 104 Q210 104 210 118 Q210 132 184 128" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            </g>
            {/* milk stream */}
            {streaming && <line x1={tip.x.toFixed(1)} y1={tip.y.toFixed(1)} x2="120" y2={(ly - 2).toFixed(1)} stroke="white" strokeWidth="4" strokeLinecap="round" />}
            {/* pitcher — flowing jug, tilted, mirrored so it pours away */}
            <g transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) scale(-1 1) rotate(26) scale(1.0) translate(${-JUG_SPOUT.x} ${-JUG_SPOUT.y})`}>
              <path d={JUG_HANDLE} fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d={JUG_BODY} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
            <text x="120" y="156" textAnchor="middle" fontSize="9" fill="#64748b">Side — fill, height & tilt</text>
          </svg>
        </div>

        {/* TOP — the pattern forms */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="50" fill="#6f4322" />
            <circle cx="60" cy="60" r="47" fill="#7c4a26" />
            <g transform="translate(60 58) scale(1.65) translate(-60 -58)">
              {phase < 2
                ? blobR > 0 && <circle cx="60" cy="60" r={blobR.toFixed(1)} fill="#f4ecd8" />
                : <path d={pathFrom(lerpArr(DISC, HEART, morph))} fill="#f4ecd8" />}
              {phase === 2 && <circle cx="60" cy={pourY.toFixed(1)} r="3" fill="#fffaf0" stroke="#d4a373" strokeWidth="0.5" />}
            </g>
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
        {PHASES.map((ph, i) => (
          <div key={ph.chip}
            className={`rounded-lg p-2 font-semibold transition-colors ${
              i === phase ? 'bg-orange-100 border border-orange-300 text-orange-700'
              : i < phase ? 'bg-orange-50 border border-orange-200 text-orange-600'
              : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
            {ph.chip}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center mb-3">Common miss: pouring too high while drawing — keep the pitcher right on the surface, then lift only for the final pull.</p>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Pouring…' : '↺ Replay'}
      </button>
    </div>
  )
}
