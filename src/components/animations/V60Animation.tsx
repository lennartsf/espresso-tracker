import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, lerp } from './animationEngine'

type Mode = 'bloom' | 'pour' | 'drain'

type Phase = {
  label: string
  time: string
  ml: string
  caption: string
  mode: Mode
  // water-surface y: from (start) -> peak (pour in) -> to (drains down within the phase)
  from: number
  peak: number
  to: number
}

const STEP = 1800

// side-view cone geometry (▼ wide top, point bottom)
const TOP_Y = 20, APEX_Y = 120, TOP_L = 42, TOP_R = 198, APEX_X = 120, BED_TOP = 96
const leftX = (y: number) => TOP_L + (APEX_X - TOP_L) * (y - TOP_Y) / (APEX_Y - TOP_Y)
const rightX = (y: number) => TOP_R - (TOP_R - APEX_X) * (y - TOP_Y) / (APEX_Y - TOP_Y)

const PHASES: Phase[] = [
  { label: 'Bloom',  time: '0:00', ml: '45 ml',  caption: 'Evenly saturate the grounds, let it bloom ~30 s', mode: 'bloom', from: 96, peak: 88, to: 90 },
  { label: 'Pour 1', time: '0:30', ml: '+60 ml', caption: 'Spiral slowly from the center outward',          mode: 'pour',  from: 90, peak: 56, to: 66 },
  { label: 'Pour 2', time: '1:15', ml: '+60 ml', caption: 'Stay near the center, avoid the edges',          mode: 'pour',  from: 66, peak: 47, to: 56 },
  { label: 'Pour 3', time: '1:45', ml: '+60 ml', caption: 'Final pour, level the coffee bed',               mode: 'pour',  from: 56, peak: 40, to: 50 },
  { label: 'Drain',  time: '2:30', ml: '—',      caption: 'Let it draw down — about 3:00 total',            mode: 'drain', from: 50, peak: 50, to: 96 },
]

function waterY(phase: number, p: number) {
  if (phase < 0) return BED_TOP
  const ph = PHASES[phase]
  if (ph.mode === 'drain') return lerp(ph.from, ph.to, p)
  return p < 0.35 ? lerp(ph.from, ph.peak, p / 0.35) : lerp(ph.peak, ph.to, (p - 0.35) / 0.65)
}

// kettle position in the top view (spiral inside -> outside over the phase)
// fewer turns -> the circular motion reads slower / calmer
function spiral(p: number) {
  const ang = p * Math.PI * 2.6
  const r = 4 + p * 36
  return { x: 60 + Math.cos(ang) * r, y: 60 + Math.sin(ang) * r }
}

export function V60Animation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, STEP)
  const p = useRamp(phase, STEP)

  const active = phase >= 0 ? PHASES[phase] : null
  const ws = waterY(phase, p)
  const hasWater = ws < BED_TOP - 0.5
  const waterPts = `${leftX(ws).toFixed(1)},${ws.toFixed(1)} ${rightX(ws).toFixed(1)},${ws.toFixed(1)} ${rightX(BED_TOP).toFixed(1)},${BED_TOP} ${leftX(BED_TOP).toFixed(1)},${BED_TOP}`

  const pouring = active != null && active.mode !== 'drain' && p < 0.8
  const dot = active?.mode === 'pour' ? spiral(p)
    : active?.mode === 'bloom' ? { x: 60 + Math.cos(p * Math.PI * 2) * 5, y: 60 + Math.sin(p * Math.PI * 2) * 5 }
    : null

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cone ▼ */}
        <div className="flex-1">
          <svg viewBox="0 0 240 140" className="w-full">
            {/* water (semi-transparent blue, cone-shaped) */}
            {hasWater && <polygon points={waterPts} fill="#3b82f6" fillOpacity="0.35" />}
            {/* coffee bed at the point */}
            <polygon points={`${leftX(BED_TOP)},${BED_TOP} ${rightX(BED_TOP)},${BED_TOP} ${APEX_X},${APEX_Y}`} fill="#6b3f1d" />
            {/* cone outline + ridges */}
            <polygon points="42,20 198,20 120,120" fill="none" stroke="#f97316" strokeWidth="2.5" />
            <line x1="120" y1="22" x2="120" y2="118" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="78" y1="22" x2="114" y2="114" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="162" y1="22" x2="126" y2="114" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            {/* pour stream */}
            {pouring && <line x1="120" y1="20" x2="120" y2={ws} stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />}
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
            {dot && <circle cx={dot.x} cy={dot.y} r="4" fill="#1e293b" />}
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
        {PHASES.map((ph, i) => (
          <div key={ph.label}
            className={`flex-1 rounded-lg p-2 text-center text-xs transition-colors ${
              i === phase ? 'bg-blue-100 border border-blue-300' : i < phase ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
            }`}>
            <p className={`font-semibold ${i <= phase ? 'text-blue-700' : 'text-slate-400'}`}>{ph.label}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{ph.time}</p>
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
