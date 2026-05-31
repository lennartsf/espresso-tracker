import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

const PHASES = [
  { label: 'Bloom',  time: '0:00', ml: '45 ml',  color: '#93c5fd', radius: 20 },
  { label: 'Pour 1', time: '1:00', ml: '60 ml',  color: '#60a5fa', radius: 30 },
  { label: 'Pour 2', time: '1:30', ml: '60 ml',  color: '#3b82f6', radius: 38 },
  { label: 'Pour 3', time: '2:00', ml: '60 ml',  color: '#2563eb', radius: 44 },
]

export function V60Animation() {
  const [phase, setPhase] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timelineRef = useRef<anime.AnimeTimelineInstance | null>(null)

  function replay() {
    setPhase(-1)
    setPlaying(true)
    if (timelineRef.current) timelineRef.current.pause()

    PHASES.forEach((_, i) => {
      const el = document.getElementById(`pour-circle-${i}`)
      if (el) { el.setAttribute('r', '0'); (el as unknown as SVGCircleElement).style.opacity = '0' }
    })

    const tl = anime.timeline({ easing: 'easeOutCubic' })
    PHASES.forEach((p, i) => {
      tl.add({
        targets: `#pour-circle-${i}`,
        r: p.radius,
        opacity: [0.8, 0.3],
        duration: 800,
        begin: () => setPhase(i),
      }, i === 0 ? 0 : '+=600')
    })
    tl.finished.then(() => setPlaying(false))
    timelineRef.current = tl
  }

  useEffect(() => { replay() }, [])

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
        <svg viewBox="0 0 280 220" className="w-full">
          <polygon points="140,20 230,190 50,190" fill="#fed7aa" stroke="#f97316" strokeWidth="2.5"/>
          <polygon points="140,30 220,185 60,185" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1"/>
          <ellipse cx="140" cy="175" rx="65" ry="12" fill="#92400e" opacity="0.7"/>
          <line x1="140" y1="40" x2="95" y2="170" stroke="#f97316" strokeWidth="0.8" opacity="0.4"/>
          <line x1="140" y1="40" x2="185" y2="170" stroke="#f97316" strokeWidth="0.8" opacity="0.4"/>
          <line x1="140" y1="40" x2="140" y2="175" stroke="#f97316" strokeWidth="0.8" opacity="0.4"/>
          {PHASES.map((p, i) => (
            <circle key={i} id={`pour-circle-${i}`} cx="140" cy="140" r="0" fill={p.color} opacity="0"/>
          ))}
          <circle cx="140" cy="190" r="5" fill="#1e293b"/>
        </svg>
      </div>

      <div className="flex gap-2 mb-4">
        {PHASES.map((p, i) => (
          <div
            key={i}
            className={`flex-1 rounded-lg p-2 text-center text-xs transition-colors ${
              i <= phase ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
            }`}
          >
            <p className={`font-semibold ${i <= phase ? 'text-blue-700' : 'text-slate-400'}`}>{p.label}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{p.time}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{p.ml}</p>
          </div>
        ))}
      </div>

      <button
        onClick={replay}
        disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
      >
        {playing ? 'Pouring...' : '↺ Replay'}
      </button>
    </div>
  )
}
