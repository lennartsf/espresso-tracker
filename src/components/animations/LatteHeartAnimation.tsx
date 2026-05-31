import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, lerp, lerpArr } from './animationEngine'
import { JUG_BODY, JUG_HANDLE, JUG_SPOUT } from './pitcherShape'

type Phase = { chip: string; caption: string }

const STEP = 2200

const PHASES: Phase[] = [
  { chip: '1. Mix in',       caption: 'Pour from a height, centred over the cup, to mix the milk into the crema' },
  { chip: '2. Float',        caption: 'Drop the pitcher right down to the rim — pour steadily so a white circle floats up' },
  { chip: '3. Pull through', caption: 'Lift slightly and draw across to the far rim — the pour point drags the circle into a heart' },
]

// Top-view shapes: identical anchor structure (M + 4 cubics) so they morph cleanly.
const DISC  = [60, 36, 49, 36, 38, 47, 38, 58, 38, 69, 49, 80, 60, 80, 71, 80, 82, 69, 82, 58, 82, 47, 71, 36, 60, 36]
const HEART = [60, 48, 56, 34, 40, 38, 38, 52, 38, 66, 52, 74, 60, 82, 68, 74, 82, 66, 82, 52, 82, 38, 64, 34, 60, 48]

function pathFrom(pts: number[]) {
  const n = (i: number) => pts[i].toFixed(1)
  return `M${n(0)} ${n(1)} C${n(2)} ${n(3)} ${n(4)} ${n(5)} ${n(6)} ${n(7)} C${n(8)} ${n(9)} ${n(10)} ${n(11)} ${n(12)} ${n(13)} C${n(14)} ${n(15)} ${n(16)} ${n(17)} ${n(18)} ${n(19)} C${n(20)} ${n(21)} ${n(22)} ${n(23)} ${n(24)} ${n(25)} Z`
}

// spout-tip position in the side view (cup centred at x=120, rim y=100, rims x≈80/160)
function spoutTip(phase: number, p: number) {
  if (phase <= 0) return { x: 120, y: 50 }                 // centred, held high
  if (phase === 1) {
    const k = Math.min(1, p / 0.3)                          // snap down to the rim, then hold
    return { x: lerp(120, 150, k), y: lerp(50, 92, k) }
  }
  return { x: lerp(150, 90, p), y: lerp(92, 85, p) }        // lift + draw across to the far rim
}

export function LatteHeartAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, STEP)
  const p = useRamp(phase, STEP)
  const active = phase >= 0 ? PHASES[phase] : null

  const tip = spoutTip(phase, p)
  const streaming = phase === 0 || phase === 1 || (phase === 2 && p < 0.55)
  const surfX = Math.min(158, Math.max(82, tip.x))

  // top view
  const blobR = phase < 0 ? 0 : phase === 0 ? lerp(2, 6, p) : phase === 1 ? lerp(6, 24, p) : 0
  const morph = phase === 2 ? p : 0
  const pourY = phase === 2 ? lerp(36, 80, p) : 0

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE — scene */}
        <div className="flex-1">
          <svg viewBox="0 0 240 150" className="w-full">
            {/* milk stream from the spout tip into the cup */}
            {streaming && <line x1={tip.x.toFixed(1)} y1={tip.y.toFixed(1)} x2={surfX.toFixed(1)} y2="99" stroke="white" strokeWidth="4" strokeLinecap="round" />}
            {/* pitcher — flowing jug, tilted, spout tip placed at `tip` */}
            <g transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(26) scale(1.15) translate(${-JUG_SPOUT.x} ${-JUG_SPOUT.y})`}>
              <path d={JUG_HANDLE} fill="none" stroke="#94a3b8" strokeWidth="2" />
              <path d={JUG_BODY} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
            {/* cup */}
            <path d="M78 100 Q78 142 120 142 Q162 142 162 100 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="42" ry="11" fill="#78350f" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="30" ry="7" fill="#c9a66b" />
            <path d="M162 110 Q188 110 188 122 Q188 134 162 130" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            <text x="120" y="148" textAnchor="middle" fontSize="9" fill="#64748b">Side — pitcher height & path</text>
          </svg>
        </div>

        {/* TOP — pattern forms */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="50" fill="#78350f" />
            <circle cx="60" cy="60" r="47" fill="#854d24" />
            {phase < 2
              ? blobR > 0 && <circle cx="60" cy="60" r={blobR.toFixed(1)} fill="white" />
              : <path d={pathFrom(lerpArr(DISC, HEART, morph))} fill="white" />}
            {phase === 2 && <circle cx="60" cy={pourY.toFixed(1)} r="3.5" fill="#f1f5f9" stroke="#d4a373" strokeWidth="0.6" />}
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

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Pouring…' : '↺ Replay'}
      </button>
    </div>
  )
}
