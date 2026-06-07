import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { ShotCard } from '../components/ShotCard'
import { BrewCard } from '../components/BrewCard'
import { CountUp } from '../components/CountUp'
import { ROUTES } from '../lib/routes'

export function Dashboard() {
  const { data: shots = [], isLoading } = useShots()
  const { data: brews = [] } = useBrews()

  const avgRating = shots.length > 0
    ? shots.reduce((sum, s) => sum + s.rating, 0) / shots.length
    : NaN
  const topShots = shots.filter(s => s.rating >= 8).length
  const ratioShots = shots.filter(s => s.brew_ratio !== null)
  const avgRatio = ratioShots.length > 0
    ? ratioShots.reduce((sum, s) => sum + (s.brew_ratio ?? 0), 0) / ratioShots.length
    : NaN
  const avgBrewRating = brews.length > 0
    ? brews.reduce((sum, b) => sum + b.rating, 0) / brews.length
    : NaN

  // GSAP: Stat-Karten gestaffelt einblenden beim Mount
  const statsRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce || !statsRef.current) return
    gsap.from(statsRef.current.children, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.08,
    })
  }, { scope: statsRef })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">☕ Espresso</h1>
        <Link
          to={ROUTES.shotNew}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          + New Shot
        </Link>
      </div>

      {/* Shot Stats */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600"><CountUp end={shots.length} /></p>
          <p className="text-xs text-slate-500 mt-0.5">Shots total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600"><CountUp end={avgRating} decimals={1} /></p>
          <p className="text-xs text-slate-500 mt-0.5">Avg Flavor</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600"><CountUp end={topShots} /></p>
          <p className="text-xs text-slate-500 mt-0.5">Top Shots (≥8)</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600"><CountUp end={avgRatio} decimals={2} /></p>
          <p className="text-xs text-slate-500 mt-0.5">Avg Ratio</p>
        </div>
      </div>

      {/* Brew Stats */}
      {brews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-600"><CountUp end={brews.length} /></p>
            <p className="text-xs text-slate-500 mt-0.5">Brews total</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-600"><CountUp end={avgBrewRating} decimals={1} /></p>
            <p className="text-xs text-slate-500 mt-0.5">Avg Brew Rating</p>
          </div>
        </div>
      )}
      {brews.length === 0 && <div className="mb-8" />}

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Recent Shots
      </h2>

      {isLoading && <p className="text-slate-400 text-sm text-center py-4">Loading...</p>}

      <div className="grid md:grid-cols-2 gap-2 mb-6">
        {shots.slice(0, 6).map(shot => (
          <ShotCard key={shot.id} shot={shot} />
        ))}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8 md:col-span-2">
            No shots yet. Pull your first!
          </p>
        )}
      </div>

      {brews.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Recent Brews
          </h2>
          <div className="grid md:grid-cols-2 gap-2 mb-6">
            {brews.slice(0, 4).map(brew => (
              <BrewCard key={brew.id} brew={brew} />
            ))}
          </div>
        </>
      )}

      {/* CTA only on mobile */}
      <Link
        to={ROUTES.shotNew}
        className="md:hidden block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold py-3 rounded-xl"
      >
        + New Shot
      </Link>
    </div>
  )
}
