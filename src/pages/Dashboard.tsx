import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { ShotCard } from '../components/ShotCard'
import { BrewCard } from '../components/BrewCard'
import { ROUTES } from '../lib/routes'
import { buttonClasses } from '../components/ui'
import { EmbossedTile } from '../components/dashboard/EmbossedTile'
import { DialGauge } from '../components/dashboard/DialGauge'
import { LiquidBar } from '../components/dashboard/LiquidBar'
import { CorrelationScatter, type ScatterPoint } from '../components/dashboard/CorrelationScatter'

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
    : null

  const scatterPoints: ScatterPoint[] = shots
    .filter(s => s.brew_ratio !== null)
    .map(s => ({ ratio: s.brew_ratio as number, flavor: s.rating, rating: s.rating }))

  const gridRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce || !gridRef.current) return
    gsap.from(gridRef.current.children, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', stagger: 0.08 })
  }, { scope: gridRef })

  return (
    <div className="rounded-2xl bg-[radial-gradient(140%_100%_at_50%_-20%,var(--coffee-surface),var(--coffee-bg))] p-2 sm:p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-coffee-cream">Espresso</h1>
        <Link to={ROUTES.shotNew} className={buttonClasses('glow')}>+ New Shot</Link>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <EmbossedTile className="flex items-center justify-center md:row-span-2">
          <DialGauge value={avgRating} max={10} label="Ø Flavor" />
        </EmbossedTile>

        <EmbossedTile className="md:col-span-2">
          <LiquidBar doseG={avgRatio !== null ? 1 : null} yieldG={avgRatio} />
          <div className="mt-2 flex gap-4 text-xs text-coffee-muted">
            <span>{shots.length} Shots</span><span>{topShots} Top (≥8)</span>
          </div>
        </EmbossedTile>

        <EmbossedTile className="md:col-span-2">
          <CorrelationScatter points={scatterPoints} />
        </EmbossedTile>
      </div>

      <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Recent Shots</h2>
      {isLoading && <p className="py-4 text-center text-sm text-coffee-muted">Loading...</p>}
      <div className="mb-6 grid gap-2 md:grid-cols-2">
        {shots.slice(0, 6).map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          <p className="py-8 text-center text-sm text-coffee-muted md:col-span-2">No shots yet. Pull your first!</p>
        )}
      </div>

      {brews.length > 0 && (
        <>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Recent Brews</h2>
          <div className="mb-6 grid gap-2 md:grid-cols-2">
            {brews.slice(0, 4).map(brew => <BrewCard key={brew.id} brew={brew} />)}
          </div>
        </>
      )}

      <Link to={ROUTES.shotNew} className={`md:hidden ${buttonClasses('glow', 'w-full')}`}>+ New Shot</Link>
    </div>
  )
}
