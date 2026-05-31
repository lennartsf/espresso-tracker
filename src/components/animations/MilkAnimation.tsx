import { useEffect, useState } from 'react'
import anime from 'animejs'

type DrinkType = 'cappuccino' | 'latte' | 'flat-white' | 'cortado'

const DRINKS: { key: DrinkType; label: string; espresso: number; milk: number; foam: number; desc: string }[] = [
  { key: 'cappuccino', label: 'Cappuccino',     espresso: 33, milk: 33, foam: 34, desc: 'Equal thirds: espresso, steamed milk, thick foam.' },
  { key: 'latte',      label: 'Latte Macchiato', espresso: 25, milk: 50, foam: 25, desc: 'More milk, medium foam. Espresso poured last through foam.' },
  { key: 'flat-white', label: 'Flat White',      espresso: 30, milk: 68, foam: 2,  desc: 'Double ristretto, mostly microfoam — almost no visible foam layer.' },
  { key: 'cortado',    label: 'Cortado',          espresso: 50, milk: 48, foam: 2,  desc: 'Equal espresso and warm milk. Minimal foam.' },
]

const CUP_HEIGHT = 120
const CUP_Y = 60

export function MilkAnimation() {
  const [active, setActive] = useState<DrinkType>('cappuccino')

  const drink = DRINKS.find(d => d.key === active)!

  const foamH = CUP_HEIGHT * (drink.foam / 100)
  const milkH = CUP_HEIGHT * (drink.milk / 100)
  const espH  = CUP_HEIGHT * (drink.espresso / 100)

  const espY  = CUP_Y + CUP_HEIGHT - espH
  const milkY = espY - milkH
  const foamY = milkY - foamH

  useEffect(() => {
    anime({ targets: '#layer-espresso', y: espY,  height: espH,  duration: 600, easing: 'easeOutCubic' })
    anime({ targets: '#layer-milk',     y: milkY, height: milkH, duration: 600, easing: 'easeOutCubic' })
    anime({ targets: '#layer-foam',     y: foamY, height: foamH, duration: 600, easing: 'easeOutCubic' })
  }, [active, espY, espH, milkY, milkH, foamY, foamH])

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {DRINKS.map(d => (
          <button
            key={d.key}
            onClick={() => setActive(d.key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              active === d.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex justify-center">
        <svg viewBox="0 0 200 220" className="w-48">
          <path d="M55 60 L55 180 Q55 195 70 195 L130 195 Q145 195 145 180 L145 60 Z" fill="white" stroke="#cbd5e1" strokeWidth="2"/>
          <defs>
            <clipPath id="cup-clip">
              <path d="M56 61 L56 179 Q56 194 70 194 L130 194 Q144 194 144 179 L144 61 Z"/>
            </clipPath>
          </defs>
          <rect id="layer-espresso" x="56" y={espY} width="88" height={espH} fill="#92400e" clipPath="url(#cup-clip)"/>
          <rect id="layer-milk"     x="56" y={milkY} width="88" height={milkH} fill="#fef9c3" clipPath="url(#cup-clip)"/>
          <rect id="layer-foam"     x="56" y={foamY} width="88" height={foamH} fill="white" opacity="0.9" clipPath="url(#cup-clip)"/>
          {foamH > 8 && [70, 90, 110, 80, 100].map((x, i) => (
            <circle key={i} cx={x} cy={foamY + foamH / 2} r="2" fill="#e2e8f0" clipPath="url(#cup-clip)"/>
          ))}
          <path d="M55 60 L55 180 Q55 195 70 195 L130 195 Q145 195 145 180 L145 60 Z" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
          {foamH > 12 && <text x="100" y={foamY + foamH / 2 + 4} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">Foam</text>}
          {milkH > 12 && <text x="100" y={milkY + milkH / 2 + 4} textAnchor="middle" fill="#78350f" fontSize="9" fontFamily="sans-serif">Milk</text>}
          {espH > 12 && <text x="100" y={espY + espH / 2 + 4} textAnchor="middle" fill="#fef3c7" fontSize="9" fontFamily="sans-serif">Espresso</text>}
          <path d="M145 100 Q175 100 175 130 Q175 160 145 160" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
        </svg>
      </div>

      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-4">
        {drink.desc}
      </p>
    </div>
  )
}
