import { useState } from 'react'
import { useRamp } from './animationEngine'

type BoilerType = 'single' | 'hx' | 'dual' | 'thermoblock'

const TABS: { key: BoilerType; label: string }[] = [
  { key: 'single', label: 'Single Boiler' },
  { key: 'hx', label: 'Heat Exchanger' },
  { key: 'dual', label: 'Dual Boiler' },
  { key: 'thermoblock', label: 'Thermoblock' },
]

const DESCRIPTIONS: Record<BoilerType, string> = {
  single: 'One tank for everything. You wait for the temperature to switch between brewing and steaming.',
  hx: 'Large steam boiler with an inner tube (heat exchanger) for brew water. Both at once.',
  dual: 'Two separate boilers — one for brewing, one for steam. Full independent control.',
  thermoblock: 'Water heats as it flows through a metal block. Fast heat-up, less thermal mass.',
}

export function BoilerAnimation() {
  const [active, setActive] = useState<BoilerType>('single')
  const p = useRamp(active, 1300)
  // draw progress for the flow lines (pathLength-normalised, no DOM measuring)
  const flow = { pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: (1 - p).toFixed(3) }

  return (
    <div>
      {/* tabs */}
      <div className="flex gap-1 mb-4 bg-coffee-bg rounded-lg p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActive(t.key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              active === t.key ? 'bg-coffee-surface2 text-coffee-cream shadow-sm' : 'text-coffee-muted hover:text-coffee-cream'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-coffee-surface rounded-xl p-4 mb-4 border border-coffee-line">
        <svg viewBox="0 0 320 200" className="w-full">
          <defs>
            <linearGradient id="boiler-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b3631" /><stop offset="1" stopColor="#2a2521" />
            </linearGradient>
            <linearGradient id="boiler-heat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fed7aa" /><stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="boiler-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bae0fd" /><stop offset="1" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="boiler-stream" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <filter id="boiler-shadow" x="-15%" y="-15%" width="130%" height="135%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* machine body */}
          <g filter="url(#boiler-shadow)">
            <rect x="40" y="30" width="240" height="140" rx="12" fill="url(#boiler-body)" stroke="#4a443d" strokeWidth="2" />
          </g>

          {active === 'single' && (
            <>
              <rect x="110" y="55" width="100" height="90" rx="8" fill="url(#boiler-heat)" stroke="#ea7c1a" strokeWidth="2" />
              <text x="160" y="105" textAnchor="middle" fill="#9a3412" fontSize="10">Boiler</text>
              <path {...flow} d="M160 55 L160 35 L80 35 L80 180" fill="none" stroke="url(#boiler-stream)" strokeWidth="3.5" strokeLinecap="round" />
              <path {...flow} d="M160 55 L160 35 L240 35 L240 180" fill="none" stroke="url(#boiler-heat)" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {active === 'hx' && (
            <>
              <rect x="90" y="45" width="140" height="110" rx="8" fill="url(#boiler-heat)" stroke="#ea7c1a" strokeWidth="2" />
              <text x="160" y="80" textAnchor="middle" fill="#9a3412" fontSize="9">Steam Boiler</text>
              <rect x="130" y="65" width="60" height="70" rx="4" fill="url(#boiler-water)" stroke="#2563eb" strokeWidth="2" />
              <text x="160" y="105" textAnchor="middle" fill="#1d4ed8" fontSize="8">HX tube</text>
              <path {...flow} d="M160 135 L160 170 L80 170 L80 180" fill="none" stroke="url(#boiler-stream)" strokeWidth="3.5" strokeLinecap="round" />
              <path {...flow} d="M200 45 L200 35 L240 35 L240 180" fill="none" stroke="url(#boiler-heat)" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {active === 'dual' && (
            <>
              <rect x="60" y="55" width="80" height="80" rx="8" fill="url(#boiler-water)" stroke="#2563eb" strokeWidth="2" />
              <text x="100" y="100" textAnchor="middle" fill="#1d4ed8" fontSize="9">Brew</text>
              <rect x="180" y="55" width="80" height="80" rx="8" fill="url(#boiler-heat)" stroke="#ea7c1a" strokeWidth="2" />
              <text x="220" y="100" textAnchor="middle" fill="#9a3412" fontSize="9">Steam</text>
              <path {...flow} d="M100 55 L100 35 L80 35 L80 180" fill="none" stroke="url(#boiler-stream)" strokeWidth="3.5" strokeLinecap="round" />
              <path {...flow} d="M220 55 L220 35 L240 35 L240 180" fill="none" stroke="url(#boiler-heat)" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {active === 'thermoblock' && (
            <>
              <rect x="55" y="70" width="150" height="80" rx="8" fill="url(#boiler-body)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="130" y="64" textAnchor="middle" fill="#b45309" fontSize="9">Metal Block</text>
              <path {...flow} d="M60 80 L130 80 L130 100 L70 100 L70 120 L140 120 L140 140 L260 140"
                fill="none" stroke="url(#boiler-stream)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="60" cy="80" r="5" fill="#93c5fd" />
              <text x="40" y="84" fill="#3b82f6" fontSize="8">cold</text>
              <circle cx="260" cy="140" r="5" fill="#fb923c" />
              <text x="266" y="144" fill="#ea580c" fontSize="8">hot</text>
            </>
          )}

          {/* outlets */}
          <rect x="70" y="165" width="30" height="15" rx="3" fill="#94a3b8" />
          <text x="85" y="176" textAnchor="middle" fill="#f8fafc" fontSize="7">brew</text>
          <rect x="220" y="165" width="30" height="15" rx="3" fill="#94a3b8" />
          <text x="235" y="176" textAnchor="middle" fill="#f8fafc" fontSize="7">steam</text>
        </svg>
      </div>

      <p className="text-sm text-coffee-text bg-coffee-surface2 border border-coffee-line rounded-xl p-4">
        {DESCRIPTIONS[active]}
      </p>
    </div>
  )
}
