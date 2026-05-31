import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, lerp, lerpArr } from './animationEngine'

type Phase = { chip: string; caption: string }

const STEP = 2200

const PHASES: Phase[] = [
  { chip: '1. Mix in',       caption: 'Pour from a height with a thin stream to mix the milk into the crema' },
  { chip: '2. Float',        caption: 'Lower the pitcher close to the surface — a white circle floats up and grows' },
  { chip: '3. Pull through', caption: 'Lift and draw forward through the center — the pour point drags the circle into a heart' },
]

// Top-view shapes: same anchor structure (M + 4 cubics) so they morph cleanly.
// Anchors map top->top, left->left, bottom->bottom(point), right->right.
const DISC  = [60, 36, 49, 36, 38, 47, 38, 58, 38, 69, 49, 80, 60, 80, 71, 80, 82, 69, 82, 58, 82, 47, 71, 36, 60, 36]
const HEART = [60, 48, 56, 34, 40, 38, 38, 52, 38, 66, 52, 74, 60, 82, 68, 74, 82, 66, 82, 52, 82, 38, 64, 34, 60, 48]

function pathFrom(pts: number[]) {
  const n = (i: number) => pts[i].toFixed(1)
  return `M${n(0)} ${n(1)} C${n(2)} ${n(3)} ${n(4)} ${n(5)} ${n(6)} ${n(7)} C${n(8)} ${n(9)} ${n(10)} ${n(11)} ${n(12)} ${n(13)} C${n(14)} ${n(15)} ${n(16)} ${n(17)} ${n(18)} ${n(19)} C${n(20)} ${n(21)} ${n(22)} ${n(23)} ${n(24)} ${n(25)} Z`
}

// side-view pitcher offset (translate) per phase
function pitcher(phase: number, p: number) {
  if (phase < 0) return { x: 0, y: -8 }
  if (phase === 0) return { x: 0, y: -8 }                          // held high
  if (phase === 1) return { x: 0, y: lerp(-8, 30, p) }             // lowered close to surface
  return { x: lerp(0, -52, p), y: lerp(30, 12, p) }                // lift + draw forward
}

export function LatteHeartAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, STEP)
  const p = useRamp(phase, STEP)
  const active = phase >= 0 ? PHASES[phase] : null

  const pos = pitcher(phase, p)
  const streaming = phase === 0 || phase === 1 || (phase === 2 && p < 0.6)

  // top view
  const blobR = phase < 0 ? 0 : phase === 0 ? lerp(2, 6, p) : phase === 1 ? lerp(6, 24, p) : 0
  const morph = phase === 2 ? p : 0
  const pourY = phase === 2 ? lerp(36, 80, p) : 0 // pour point dragging down through the disc

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE — scene */}
        <div className="flex-1">
          <svg viewBox="0 0 240 150" className="w-full">
            {/* pitcher group — height + lateral pull via translate */}
            <g transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`}>
              <g transform="translate(116 12) rotate(30)">
                <path d="M0 0 L36 0 L33 28 Q33 32 28 32 L5 32 Q0 32 0 28 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M36 5 L46 2 L43 9 L34 11 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <path d="M0 7 Q-10 10 -8 20" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </g>
            </g>
            {/* milk stream from the spout down to the cup */}
            {streaming && <line x1={150 + pos.x} y1={48 + pos.y} x2="120" y2="98" stroke="white" strokeWidth="4" strokeLinecap="round" />}
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
            {phase < 2
              ? blobR > 0 && <circle cx="60" cy="60" r={blobR.toFixed(1)} fill="white" />
              : <path d={pathFrom(lerpArr(DISC, HEART, morph))} fill="white" />}
            {/* pour point dragging through (the pitcher tip seen from above) */}
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
