import { usePhaseTimeline } from './usePhaseTimeline'
import { useRamp, useSpin, lerp } from './animationEngine'

type Mode = 'purge' | 'stretch' | 'roll' | 'finish'
type Phase = { label: string; caption: string; mode: Mode }

// weighted: short purge, stretch ~1/3, roll ~2/3, short finish
const DUR = [700, 2600, 4200, 1000]

const PHASES: Phase[] = [
  { label: 'Purge',   mode: 'purge',   caption: 'Purge the wand, then set the tip just below the surface, in the spout' },
  { label: 'Stretch', mode: 'stretch', caption: 'Tip at the surface — fold in air with a soft "slurp" until the volume grows ~25%' },
  { label: 'Roll',    mode: 'roll',    caption: 'Raise the pitcher slightly so the tip runs deeper — the whirlpool whisks the bubbles into microfoam' },
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

// Only the PITCHER moves; the wand tip is fixed at y=66. Pitcher y shifts the
// milk surface (= 60 + py), so the tip sits at different depths:
//   purge  py 2  -> surface 62, tip just below
//   stretch py 2->8 -> surface rises to 68, tip ends just AT/above the surface (air)
//   roll   py 8->-4 -> pitcher RAISES, surface 56, tip runs deeper
//   finish py -4->26 -> jug taken away, tip lifts clear
function pitcherY(phase: number, p: number) {
  if (phase <= 0) return 2
  if (phase === 1) return lerp(2, 8, p)    // stretch: lower slightly -> tip to the surface
  if (phase === 2) return lerp(8, -4, Math.min(1, p / 0.18))   // roll: quick raise right after stretch, then hold
  return lerp(-4, 26, p)                                         // finish: take the jug away
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
  // vortex builds up: slow at first, faster while rolling
  const spinSpeed = mode === 'roll' ? lerp(170, 410, p) : mode === 'stretch' ? lerp(45, 150, p) : 0
  const angle = useSpin(spinning, spinSpeed)
  const py = pitcherY(phase, p)
  const fh = foamH(phase, p)
  const vortexOpacity = mode === 'roll' ? lerp(0.55, 0.9, p) : mode === 'stretch' ? lerp(0.15, 0.5, p) : 0

  return (
    <div>
      <div className="bg-coffee-surface rounded-xl p-4 mb-4 border border-coffee-line flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cross-section: pitcher moves, wand fixed in the spout */}
        <div className="flex-1">
          <svg viewBox="0 0 200 174" className="w-full">
            <defs>
              <clipPath id="milk-vessel">
                <path d="M52 60 C44 64 44 110 53 121 C57 127 66 128 76 128 L124 128 C134 128 143 127 147 121 C156 110 156 64 148 60 Z" />
              </clipPath>
              <linearGradient id="milk-steel" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#aab3bf" /><stop offset="0.5" stopColor="#eef2f6" /><stop offset="1" stopColor="#9aa4b1" />
              </linearGradient>
              <linearGradient id="milk-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fffdf0" /><stop offset="1" stopColor="#f0e7bc" />
              </linearGradient>
              <linearGradient id="milk-foam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#eeeee4" />
              </linearGradient>
              <filter id="milk-shadow" x="-30%" y="-25%" width="160%" height="150%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.16" />
              </filter>
            </defs>
            <g transform={`translate(0 ${py.toFixed(1)})`}>
              {/* steel pitcher body */}
              <g filter="url(#milk-shadow)">
                <path d="M52 58 C44 62 44 110 53 122 C57 128 66 130 76 130 L124 130 C134 130 143 128 147 122 C156 110 156 62 148 58 Z" fill="url(#milk-steel)" stroke="#9aa4b1" strokeWidth="1.5" />
              </g>
              {/* milk + foam */}
              <g clipPath="url(#milk-vessel)">
                <rect x="46" y={SY} width="108" height={130 - SY} fill="url(#milk-fill)" />
                <rect x="46" y={SY} width="108" height={fh.toFixed(1)} fill="url(#milk-foam)" />
              </g>
              {/* rim highlight + spout (left) + handle (right) */}
              <ellipse cx="100" cy="58" rx="48" ry="4" fill="none" stroke="#eef2f6" strokeWidth="2" />
              <path d="M52 58 C44 52 36 52 32 58 C38 56 45 57 52 62" fill="none" stroke="#b9c2cd" strokeWidth="2.5" />
              <path d="M148 66 C166 66 166 96 148 98" fill="none" stroke="url(#milk-steel)" strokeWidth="4" />
              <path d="M148 66 C166 66 166 96 148 98" fill="none" stroke="#9aa4b1" strokeWidth="1" />
            </g>
            {/* steam wand — fixed in the spout (only the pitcher moves) */}
            <line x1="56" y1="6" x2="62" y2="66" stroke="url(#milk-steel)" strokeWidth="6" strokeLinecap="round" />
            <line x1="56" y1="6" x2="62" y2="66" stroke="#8b94a1" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <text x="100" y="170" textAnchor="middle" fontSize="9" fill="#a89784">Side — only the pitcher moves</text>
          </svg>
        </div>

        {/* TOP VIEW — whirlpool, lance off-centre (left) */}
        <div className="flex-1">
          <svg viewBox="0 0 200 174" className="w-full">
            <defs>
              <radialGradient id="milk-top" cx="0.42" cy="0.4" r="0.72">
                <stop offset="0" stopColor="#fffdf0" /><stop offset="1" stopColor="#ece2b8" />
              </radialGradient>
              <filter id="milk-disc-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.14" />
              </filter>
            </defs>
            <g transform="translate(100 82) scale(1.3) translate(-60 -60)">
              <g filter="url(#milk-disc-shadow)">
                <circle cx="60" cy="60" r="48" fill="url(#milk-top)" stroke="#e2d8a8" strokeWidth="2" />
              </g>
              <circle cx="60" cy="60" r="46" fill="none" stroke="white" strokeWidth="3" opacity="0.6" />
              {spinning && (
                <g transform={`rotate(${angle.toFixed(1)} 60 60)`} opacity={vortexOpacity}>
                  <path d={SPIN_PATH} fill="none" stroke="#d99e1f" strokeWidth="1.7" strokeLinecap="round" />
                </g>
              )}
              <ellipse cx="60" cy="60" rx={spinning ? 9 : 4} ry={spinning ? 6 : 3} fill="#caa12e" opacity="0.35" />
              {/* lance position — off-centre, left, between centre and rim */}
              <circle cx="34" cy="60" r="4.5" fill="#8b94a1" stroke="#64748b" strokeWidth="1" />
            </g>
            <text x="100" y="170" textAnchor="middle" fontSize="9" fill="#a89784">Top — vortex, tip off-centre</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-coffee-text bg-coffee-surface2 border border-coffee-line rounded-xl p-3 mb-3 min-h-[3rem]">
        {active ? active.caption : 'Starting…'}
      </p>

      {/* phase chips */}
      <div className="flex gap-2 mb-3">
        {PHASES.map((ph, i) => (
          <div key={ph.label}
            className={`flex-1 rounded-lg p-2 text-center text-xs font-semibold transition-colors ${
              i === phase ? 'bg-coffee-accent/15 border border-coffee-accent/40 text-coffee-accent-soft' : i < phase ? 'bg-coffee-accent/10 border border-coffee-accent/20 text-coffee-accent' : 'bg-coffee-surface2 border border-coffee-line text-coffee-muted'
            }`}>
            {ph.label}
          </div>
        ))}
      </div>

      {/* right/wrong hints */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-green-300">✓ Tip at surface<br /><span className="text-green-400/80">fine microfoam</span></div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-red-300">✗ Too deep<br /><span className="text-red-400/80">no foam</span></div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-red-300">✗ Air too long<br /><span className="text-red-400/80">big bubbles</span></div>
      </div>

      <p className="text-xs text-coffee-muted text-center mb-3">Air goes in early (cold milk). Stop when the jug is too hot to hold (~60–65 °C) — never above 68 °C.</p>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-coffee-accent text-coffee-bg text-sm font-semibold disabled:opacity-50">
        {playing ? 'Steaming…' : '↺ Replay'}
      </button>
    </div>
  )
}
