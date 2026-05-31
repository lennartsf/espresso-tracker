import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, useSpin, lerp } from './animationEngine'

type Mode = 'bloom' | 'pour' | 'drain'

type Phase = {
  label: string
  time: string
  g: string
  caption: string
  mode: Mode
  from: number // water-surface y at phase start
  peak: number // highest (most water) mid-pour
  to: number   // settles back down (never fully drains until drawdown)
}

// weighted durations: long bloom + 4 pulses + long drawdown
const DUR = [2600, 1500, 1500, 1500, 1500, 3200]

const TOP_Y = 20, APEX_Y = 120, TOP_L = 42, TOP_R = 198, APEX_X = 120, BED_TOP = 96
const leftX = (y: number) => TOP_L + (APEX_X - TOP_L) * (y - TOP_Y) / (APEX_Y - TOP_Y)
const rightX = (y: number) => TOP_R - (TOP_R - APEX_X) * (y - TOP_Y) / (APEX_Y - TOP_Y)

const PHASES: Phase[] = [
  { label: 'Bloom',  time: '0:00', g: '50 g',  caption: 'Pour 50 g and gently swirl to wet all the grounds', mode: 'bloom', from: 96, peak: 84, to: 88 },
  { label: 'Pour 1', time: '0:45', g: '100 g', caption: 'Top up to 100 g in slow, even circles',             mode: 'pour',  from: 88, peak: 68, to: 74 },
  { label: 'Pour 2', time: '1:10', g: '150 g', caption: 'Pulse to 150 g — keep the stream low and circling', mode: 'pour',  from: 74, peak: 60, to: 66 },
  { label: 'Pour 3', time: '1:30', g: '200 g', caption: 'Pulse to 200 g, gently agitating the bed',          mode: 'pour',  from: 66, peak: 52, to: 58 },
  { label: 'Pour 4', time: '1:50', g: '250 g', caption: 'Final pulse to 250 g',                              mode: 'pour',  from: 58, peak: 46, to: 52 },
  { label: 'Drain',  time: '2:00', g: '—',     caption: 'Final swirl, then let it draw down to a flat bed',  mode: 'drain', from: 52, peak: 52, to: 96 },
]

function waterY(phase: number, p: number) {
  if (phase < 0) return BED_TOP
  const ph = PHASES[phase]
  if (ph.mode === 'drain') return lerp(ph.from, ph.to, p)
  return p < 0.35 ? lerp(ph.from, ph.peak, p / 0.35) : lerp(ph.peak, ph.to, (p - 0.35) / 0.65)
}

// kettle position in the top view (gentle spiral, centre -> out)
function spiral(p: number) {
  const ang = p * Math.PI * 2.6
  const r = 4 + p * 34
  return { x: 60 + Math.cos(ang) * r, y: 60 + Math.sin(ang) * r }
}

export function V60Animation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, DUR)
  const p = useRamp(phase, DUR[Math.max(0, phase)] ?? 1000)
  const active = phase >= 0 ? PHASES[phase] : null
  const mode = active?.mode
  const swirling = mode === 'bloom'
  const angle = useSpin(swirling, 200)

  const ws = waterY(phase, p)
  const hasWater = ws < BED_TOP - 0.5
  const waterPts = `${leftX(ws).toFixed(1)},${ws.toFixed(1)} ${rightX(ws).toFixed(1)},${ws.toFixed(1)} ${rightX(BED_TOP).toFixed(1)},${BED_TOP} ${leftX(BED_TOP).toFixed(1)},${BED_TOP}`
  const pouring = mode === 'pour' && p < 0.85
  const dot = (mode === 'pour' || mode === 'bloom') && p < 0.95 ? spiral(p) : null

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cone ▼ */}
        <div className="flex-1">
          <svg viewBox="0 0 240 168" className="w-full">
            <defs>
              <linearGradient id="v60-cone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fdba74" /><stop offset="1" stopColor="#e8740c" />
              </linearGradient>
              <linearGradient id="v60-paper" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fffdf8" /><stop offset="1" stopColor="#fbe6c8" />
              </linearGradient>
              <linearGradient id="v60-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8fcaf6" /><stop offset="1" stopColor="#2f7fd6" />
              </linearGradient>
              <linearGradient id="v60-bed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8a5a32" /><stop offset="1" stopColor="#4a2a13" />
              </linearGradient>
              <linearGradient id="v60-glass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#dfe8f0" /><stop offset="0.5" stopColor="#f7fbff" /><stop offset="1" stopColor="#d3deea" />
              </linearGradient>
              <filter id="v60-shadow" x="-25%" y="-25%" width="150%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#0f172a" floodOpacity="0.16" />
              </filter>
            </defs>

            {/* carafe catching the brew */}
            <g filter="url(#v60-shadow)">
              <path d="M98 124 Q90 124 90 134 L94 146 Q96 151 105 151 L135 151 Q144 151 146 146 L150 134 Q150 124 142 124 Z" fill="url(#v60-glass)" stroke="#cbd5e1" strokeWidth="1.5" />
            </g>

            {/* steam wisps (heat retained between pulses) */}
            {mode === 'pour' && (
              <g stroke="#cbd5e1" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round">
                <path d="M104 70 q4 -6 0 -12 q-4 -6 0 -12" />
                <path d="M136 70 q4 -6 0 -12 q-4 -6 0 -12" />
              </g>
            )}

            {/* dripper cone + filter paper */}
            <g filter="url(#v60-shadow)">
              <polygon points="42,20 198,20 120,120" fill="url(#v60-cone)" />
            </g>
            <polygon points="49,24 191,24 120,115" fill="url(#v60-paper)" />
            {/* ribs (subtle, on the cone) */}
            <line x1="84" y1="24" x2="116" y2="112" stroke="#f0a35a" strokeWidth="0.8" opacity="0.45" />
            <line x1="156" y1="24" x2="124" y2="112" stroke="#f0a35a" strokeWidth="0.8" opacity="0.45" />

            {/* water */}
            {hasWater && <polygon points={waterPts} fill="url(#v60-water)" fillOpacity="0.82" />}
            {/* CO2 bubbles during bloom */}
            {mode === 'bloom' && [108, 120, 132].map((x, i) => (
              <circle key={i} cx={x} cy={(90 - p * 26 - i * 4).toFixed(1)} r={(2 - i * 0.3).toFixed(1)} fill="#e2e8f0" opacity={(0.7 * (1 - p)).toFixed(2)} />
            ))}
            {/* coffee bed at the point */}
            <polygon points={`${leftX(BED_TOP)},${BED_TOP} ${rightX(BED_TOP)},${BED_TOP} ${APEX_X},${APEX_Y}`} fill="url(#v60-bed)" />

            {/* rim mouth + thin outline */}
            <ellipse cx="120" cy="20" rx="78" ry="8" fill="none" stroke="#e8740c" strokeWidth="2" />
            <polygon points="42,20 198,20 120,120" fill="none" stroke="#c75e00" strokeWidth="1.5" />

            {/* pour stream */}
            {pouring && <line x1="120" y1="20" x2="120" y2={ws.toFixed(1)} stroke="url(#v60-water)" strokeWidth="4" strokeLinecap="round" />}
            <text x="120" y="162" textAnchor="middle" fontSize="9" fill="#64748b">Side — water level</text>
          </svg>
        </div>

        {/* TOP VIEW — pour pattern + swirl */}
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
            {/* bed seen from above */}
            <circle cx="60" cy="60" r="15" fill="#9a6a45" opacity="0.6" />
            {/* swirl indicator (bloom + drawdown) */}
            {swirling && (
              <g transform={`rotate(${angle.toFixed(1)} 60 60)`} opacity="0.8">
                <path d="M60 30 A30 30 0 0 1 88 52" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M60 90 A30 30 0 0 1 32 68" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
            {dot && <circle cx={dot.x.toFixed(1)} cy={dot.y.toFixed(1)} r="4" fill="#1e293b" />}
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — pour & swirl</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-4 min-h-[3rem]">
        {active ? <><span className="font-semibold text-slate-800">{active.time} · {active.g}</span> — {active.caption}</> : 'Starting…'}
      </p>

      {/* chips */}
      <div className="flex gap-1.5 mb-3">
        {PHASES.map((ph, i) => (
          <div key={ph.label}
            className={`flex-1 rounded-lg p-1.5 text-center transition-colors ${
              i === phase ? 'bg-blue-100 border border-blue-300' : i < phase ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
            }`}>
            <p className={`text-[11px] font-semibold ${i <= phase ? 'text-blue-700' : 'text-slate-400'}`}>{ph.label}</p>
            <p className={`text-[10px] ${i <= phase ? 'text-blue-500' : 'text-slate-300'}`}>{ph.time}</p>
          </div>
        ))}
      </div>

      {/* right/wrong hints */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700">✓ Low stream<br /><span className="text-green-500">near the surface</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Centre only<br /><span className="text-red-400">crater</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too coarse<br /><span className="text-red-400">sour / watery</span></div>
      </div>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Brewing…' : '↺ Replay'}
      </button>
    </div>
  )
}
