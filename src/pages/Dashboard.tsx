import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { ShotCard } from '../components/ShotCard'
import { BrewCard } from '../components/BrewCard'
import { ROUTES } from '../lib/routes'
import { PageHeader, StatCard, buttonClasses } from '../components/ui'

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
      <PageHeader
        title="Espresso"
        action={
          <Link to={ROUTES.shotNew} className={buttonClasses('primary')}>
            + New Shot
          </Link>
        }
      />

      {/* Shot Stats */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard value={shots.length} label="Shots total" />
        <StatCard value={avgRating} label="Avg Flavor" decimals={1} />
        <StatCard value={topShots} label="Top Shots (≥8)" />
        <StatCard value={avgRatio} label="Avg Ratio" decimals={2} />
      </div>

      {/* Brew Stats */}
      {brews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard value={brews.length} label="Brews total" />
          <StatCard value={avgBrewRating} label="Avg Brew Rating" decimals={1} />
        </div>
      )}
      {brews.length === 0 && <div className="mb-8" />}

      <h2 className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
        Recent Shots
      </h2>

      {isLoading && <p className="text-coffee-muted text-sm text-center py-4">Loading...</p>}

      <div className="grid md:grid-cols-2 gap-2 mb-6">
        {shots.slice(0, 6).map(shot => (
          <ShotCard key={shot.id} shot={shot} />
        ))}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-coffee-muted text-sm py-8 md:col-span-2">
            No shots yet. Pull your first!
          </p>
        )}
      </div>

      {brews.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
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
      <Link to={ROUTES.shotNew} className={`md:hidden ${buttonClasses('primary', 'w-full')}`}>
        + New Shot
      </Link>
    </div>
  )
}
