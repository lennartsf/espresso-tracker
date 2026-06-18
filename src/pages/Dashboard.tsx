import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'
import { ROUTES } from '../lib/routes'
import { buttonClasses, EmptyState } from '../components/ui'
import { EmbossedTile } from '../components/dashboard/EmbossedTile'
import { DialGauge } from '../components/dashboard/DialGauge'
import { LiquidBar } from '../components/dashboard/LiquidBar'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Monday 00:00 of the week containing `d`. */
function mondayOf(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const offset = (x.getDay() + 6) % 7 // Mon=0 … Sun=6
  x.setDate(x.getDate() - offset)
  return x
}

/** ISO-8601 week number. */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
}

function fmt(d: Date, opts: Intl.DateTimeFormatOptions) {
  return d.toLocaleDateString('en-GB', opts)
}

export function Dashboard() {
  const { data: shots = [], isLoading } = useShots()

  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))
  const thisMonday = useMemo(() => mondayOf(new Date()), [])
  const weekEnd = useMemo(() => {
    const e = new Date(weekStart); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999); return e
  }, [weekStart])
  const isCurrentWeek = weekStart.getTime() >= thisMonday.getTime()

  const shiftWeek = (deltaDays: number) =>
    setWeekStart(prev => {
      const n = new Date(prev); n.setDate(n.getDate() + deltaDays); return mondayOf(n)
    })

  // shots within the selected week (by pull date, fallback created)
  const weekShots = useMemo(() => shots.filter(s => {
    const t = new Date(s.pulled_at ?? s.created_at).getTime()
    return t >= weekStart.getTime() && t <= weekEnd.getTime()
  }), [shots, weekStart, weekEnd])

  const avgFlavor = weekShots.length
    ? weekShots.reduce((sum, s) => sum + s.rating, 0) / weekShots.length
    : NaN

  const ratioShots = weekShots.filter(s => (s.brew_ratio ?? (s.dose_g && s.yield_g ? s.yield_g / s.dose_g : null)) !== null)
  const avgRatio = ratioShots.length
    ? ratioShots.reduce((sum, s) => sum + (s.brew_ratio ?? (s.yield_g! / s.dose_g!)), 0) / ratioShots.length
    : null

  const byDay = useMemo(() => {
    const counts = DAYS.map((day, i) => ({ day, count: 0, i }))
    for (const s of weekShots) {
      const idx = (new Date(s.pulled_at ?? s.created_at).getDay() + 6) % 7
      counts[idx].count++
    }
    return counts
  }, [weekShots])

  const dateRange = weekStart.getMonth() === weekEnd.getMonth()
    ? `${fmt(weekStart, { day: '2-digit' })}–${fmt(weekEnd, { day: '2-digit', month: 'short' })}`
    : `${fmt(weekStart, { day: '2-digit', month: 'short' })} – ${fmt(weekEnd, { day: '2-digit', month: 'short' })}`

  const gridRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce || !gridRef.current) return
    gsap.from(gridRef.current.children, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', stagger: 0.08 })
  }, { scope: gridRef, dependencies: [weekStart] })

  return (
    <div className="rounded-2xl bg-[radial-gradient(140%_100%_at_50%_-20%,var(--coffee-surface),var(--coffee-bg))] p-2 sm:p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-coffee-cream">Espresso</h1>
        <Link to={ROUTES.shotNew} className={buttonClasses('glow')}>+ New Shot</Link>
      </div>

      {/* Week picker */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-coffee-line bg-coffee-surface2 px-3 py-2">
        <button
          aria-label="Previous week"
          onClick={() => shiftWeek(-7)}
          className="rounded-lg px-3 py-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream"
        >‹</button>
        <div className="text-center">
          <p className="font-display text-base font-semibold text-coffee-cream">
            KW {isoWeek(weekStart)}{isCurrentWeek ? ' · this week' : ''}
          </p>
          <p className="text-xs text-coffee-muted">{dateRange}</p>
        </div>
        <button
          aria-label="Next week"
          onClick={() => shiftWeek(7)}
          disabled={isCurrentWeek}
          className="rounded-lg px-3 py-1.5 text-coffee-muted hover:bg-coffee-surface hover:text-coffee-cream disabled:opacity-30"
        >›</button>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <EmbossedTile className="flex items-center justify-center md:row-span-2">
          <DialGauge value={avgFlavor} max={10} label="Ø Flavor · week" />
        </EmbossedTile>

        <EmbossedTile className="md:col-span-2">
          <LiquidBar doseG={avgRatio !== null ? 1 : null} yieldG={avgRatio} />
          <div className="mt-2 flex gap-4 text-xs text-coffee-muted">
            <span>{weekShots.length} shot{weekShots.length !== 1 ? 's' : ''} this week</span>
            <span>{weekShots.filter(s => s.rating >= 8).length} top (≥8)</span>
          </div>
        </EmbossedTile>

        <EmbossedTile className="md:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Shots per day</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byDay} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a89784' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a89784' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: 'rgba(233,201,135,0.06)' }} content={({ payload, label }) => {
                if (!payload?.length) return null
                return (
                  <div className="rounded border border-coffee-line bg-coffee-surface2 px-2 py-1 text-xs shadow">
                    <p>{label}: <strong>{payload[0].value}</strong></p>
                  </div>
                )
              }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byDay.map(d => (
                  <Cell key={d.day} fill={d.count > 0 ? '#c9a35e' : '#33291f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </EmbossedTile>
      </div>

      <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-coffee-muted">This week's shots</h2>
      {isLoading && <p className="py-4 text-center text-sm text-coffee-muted">Loading...</p>}
      <div className="mb-6 grid gap-2 md:grid-cols-2">
        {weekShots.map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && weekShots.length === 0 && (
          <EmptyState
            className="md:col-span-2"
            headline={isCurrentWeek ? 'Your first pull awaits.' : 'No shots this week.'}
            description={isCurrentWeek ? 'Log a shot and the week comes alive.' : 'Pick another week or log a new shot.'}
            ctaLabel="+ New Shot"
            ctaTo={ROUTES.shotNew}
          />
        )}
      </div>

      <Link to={ROUTES.shotNew} className={`md:hidden ${buttonClasses('glow', 'w-full')}`}>+ New Shot</Link>
    </div>
  )
}
