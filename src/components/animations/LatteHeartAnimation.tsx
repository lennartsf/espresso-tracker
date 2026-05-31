import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

export function LatteHeartAnimation() {
  const [playing, setPlaying] = useState(false)
  const streamRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  function replay() {
    if (playing) return
    setPlaying(true)

    const stream = streamRef.current
    const dot = dotRef.current
    if (!stream || !dot) return

    stream.style.strokeDashoffset = String(stream.getTotalLength())
    stream.style.opacity = '0'

    const tl = anime.timeline({ easing: 'easeInOutSine' })

    tl.add({
      targets: '#base-circle',
      r: [0, 38],
      opacity: [0, 0.9],
      duration: 1000,
    })

    tl.add({
      targets: stream,
      strokeDashoffset: [stream.getTotalLength(), 0],
      opacity: [0, 1],
      duration: 1600,
      easing: 'easeInOutQuad',
    }, '+=200')

    tl.add({
      targets: dot,
      translateX: anime.path('#heart-path')('x'),
      translateY: anime.path('#heart-path')('y'),
      duration: 1600,
      easing: 'easeInOutQuad',
    }, '-=1600')

    tl.finished.then(() => setPlaying(false))
  }

  useEffect(() => {
    if (streamRef.current) {
      const len = streamRef.current.getTotalLength()
      streamRef.current.style.strokeDasharray = String(len)
      streamRef.current.style.strokeDashoffset = String(len)
    }
    replay()
  }, [])

  return (
    <div>
      <div className="bg-slate-900 rounded-xl p-4 mb-4 flex justify-center">
        <svg viewBox="0 0 240 240" className="w-56">
          <circle cx="120" cy="120" r="100" fill="#451a03" stroke="#92400e" strokeWidth="3"/>
          <circle cx="120" cy="120" r="97" fill="#78350f"/>
          <circle id="base-circle" cx="120" cy="130" r="0" fill="white" opacity="0"/>
          <path
            id="heart-path"
            d="M120 90 C120 70, 90 70, 90 90 C90 110, 120 130, 120 150 C120 130, 150 110, 150 90 C150 70, 120 70, 120 90"
            fill="none"
            stroke="none"
          />
          <path
            ref={streamRef}
            d="M120 90 C120 70, 90 70, 90 90 C90 110, 120 130, 120 150 C120 130, 150 110, 150 90 C150 70, 120 70, 120 90"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0"
          />
          <circle ref={dotRef} cx="120" cy="90" r="5" fill="#fb923c"/>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <p className="font-semibold text-slate-700">1. Base pour</p>
          <p className="text-slate-400">White spreads in center</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <p className="font-semibold text-slate-700">2. Heart shape</p>
          <p className="text-slate-400">Pitcher traces lobes</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <p className="font-semibold text-slate-700">3. Cut through</p>
          <p className="text-slate-400">Forward motion finishes</p>
        </div>
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
