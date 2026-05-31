import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

type BoilerType = 'single' | 'hx' | 'dual' | 'thermoblock'

const TABS: { key: BoilerType; label: string }[] = [
  { key: 'single',      label: 'Single Boiler' },
  { key: 'hx',          label: 'Heat Exchanger' },
  { key: 'dual',        label: 'Dual Boiler' },
  { key: 'thermoblock', label: 'Thermoblock' },
]

const DESCRIPTIONS: Record<BoilerType, string> = {
  single:     'One tank for everything. Must wait for temperature to switch between brewing and steaming.',
  hx:         'Large steam boiler with an inner tube (heat exchanger) for brew water. Both at once.',
  dual:       'Two separate boilers — one for brewing, one for steam. Full independent control.',
  thermoblock:'Water heats as it flows through a metal block. Fast heat-up, less thermal mass.',
}

export function BoilerAnimation() {
  const [active, setActive] = useState<BoilerType>('single')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    anime.remove('.water-path')
    const paths = svgRef.current.querySelectorAll('.water-path')
    paths.forEach(p => {
      const length = (p as SVGPathElement).getTotalLength?.() ?? 100
      ;(p as SVGPathElement).style.strokeDasharray = String(length)
      ;(p as SVGPathElement).style.strokeDashoffset = String(length)
      ;(p as SVGPathElement).style.opacity = '0'
    })
    const activePaths = svgRef.current.querySelectorAll(`.path-${active}`)
    activePaths.forEach(p => {
      const length = (p as SVGPathElement).getTotalLength?.() ?? 100
      ;(p as SVGPathElement).style.strokeDasharray = String(length)
      ;(p as SVGPathElement).style.strokeDashoffset = String(length)
      ;(p as SVGPathElement).style.opacity = '1'
    })
    anime({
      targets: `.path-${active}`,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1200,
      delay: anime.stagger(200),
    })
  }, [active])

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              active === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl p-4 mb-4">
        <svg ref={svgRef} viewBox="0 0 320 200" className="w-full">
          <rect x="40" y="30" width="240" height="140" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="2"/>

          {active === 'single' && (
            <>
              <rect x="110" y="55" width="100" height="90" rx="8" fill="#fed7aa" stroke="#f97316" strokeWidth="2"/>
              <text x="160" y="105" textAnchor="middle" fill="#ea580c" fontSize="10" fontFamily="sans-serif">Boiler</text>
              <path className="water-path path-single" d="M160 55 L160 35 L80 35 L80 180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              <path className="water-path path-single" d="M160 55 L160 35 L240 35 L240 180" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3"/>
            </>
          )}

          {active === 'hx' && (
            <>
              <rect x="90" y="45" width="140" height="110" rx="8" fill="#fed7aa" stroke="#f97316" strokeWidth="2"/>
              <text x="160" y="80" textAnchor="middle" fill="#ea580c" fontSize="9" fontFamily="sans-serif">Steam Boiler</text>
              <rect x="130" y="65" width="60" height="70" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
              <text x="160" y="105" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontFamily="sans-serif">HX tube</text>
              <path className="water-path path-hx" d="M160 135 L160 170 L80 170 L80 180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              <path className="water-path path-hx" d="M200 45 L200 35 L240 35 L240 180" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3"/>
            </>
          )}

          {active === 'dual' && (
            <>
              <rect x="60" y="55" width="80" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
              <text x="100" y="100" textAnchor="middle" fill="#1d4ed8" fontSize="9" fontFamily="sans-serif">Brew</text>
              <rect x="180" y="55" width="80" height="80" rx="8" fill="#fed7aa" stroke="#f97316" strokeWidth="2"/>
              <text x="220" y="100" textAnchor="middle" fill="#ea580c" fontSize="9" fontFamily="sans-serif">Steam</text>
              <path className="water-path path-dual" d="M100 55 L100 35 L80 35 L80 180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              <path className="water-path path-dual" d="M220 55 L220 35 L240 35 L240 180" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3"/>
            </>
          )}

          {active === 'thermoblock' && (
            <>
              <path
                className="water-path path-thermoblock"
                d="M60 80 L130 80 L130 100 L70 100 L70 120 L140 120 L140 140 L260 140"
                fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
              />
              <rect x="55" y="70" width="150" height="80" rx="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3"/>
              <text x="130" y="65" textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="sans-serif">Metal Block</text>
              <circle cx="60" cy="80" r="5" fill="#93c5fd"/>
              <text x="42" y="84" fill="#93c5fd" fontSize="8" fontFamily="sans-serif">cold</text>
              <circle cx="260" cy="140" r="5" fill="#fb923c"/>
              <text x="265" y="144" fill="#fb923c" fontSize="8" fontFamily="sans-serif">hot</text>
            </>
          )}

          <rect x="70" y="165" width="30" height="15" rx="3" fill="#475569"/>
          <text x="85" y="176" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">brew</text>
          <rect x="220" y="165" width="30" height="15" rx="3" fill="#475569"/>
          <text x="235" y="176" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">steam</text>
        </svg>
      </div>

      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-4">
        {DESCRIPTIONS[active]}
      </p>
    </div>
  )
}
