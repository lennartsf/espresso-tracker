import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'
import { BrewTimer } from '../components/BrewTimer'
import { BrewRatioBar } from '../components/BrewRatioBar'
import { RatingInput } from '../components/RatingInput'
import { RatingBadge } from '../components/ui'

/** Interactive demo sandbox — the core tools with mock state. No account, nothing saved. */
export function Try() {
  const [time, setTime] = useState<number | null>(null)
  const [dose, setDose] = useState(18)
  const [yieldG, setYieldG] = useState(36)
  const [rating, setRating] = useState<number | null>(8)

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-accent">Try it out</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-coffee-cream md:text-5xl">
          Play with the core tools
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-coffee-muted">
          The real timer, ratio bar and rating — live, with mock data. No account, nothing is saved.
        </p>
      </div>

      <div className="mt-12 grid gap-5">
        {/* Timer */}
        <div className="rounded-2xl border border-coffee-line bg-coffee-surface p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Shot timer</p>
          <BrewTimer onTime={setTime} />
          {time !== null && (
            <p className="mt-3 text-sm text-coffee-muted">Captured: <span className="font-semibold text-coffee-cream">{time}s</span></p>
          )}
        </div>

        {/* Ratio */}
        <div className="rounded-2xl border border-coffee-line bg-coffee-surface p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Brew ratio</p>
          <BrewRatioBar doseG={dose} yieldG={yieldG} />
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="mb-1 flex justify-between text-xs text-coffee-muted">
                <span>Dose</span><span className="text-coffee-cream">{dose} g</span>
              </span>
              <input type="range" min={14} max={22} step={0.5} value={dose}
                onChange={e => setDose(parseFloat(e.target.value))}
                className="w-full accent-coffee-accent" />
            </label>
            <label className="block">
              <span className="mb-1 flex justify-between text-xs text-coffee-muted">
                <span>Yield</span><span className="text-coffee-cream">{yieldG} g</span>
              </span>
              <input type="range" min={20} max={60} step={1} value={yieldG}
                onChange={e => setYieldG(parseFloat(e.target.value))}
                className="w-full accent-coffee-accent" />
            </label>
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-2xl border border-coffee-line bg-coffee-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-coffee-muted">Rate the shot</p>
            {rating !== null && <RatingBadge value={rating} />}
          </div>
          <RatingInput value={rating} onChange={setRating} />
        </div>
      </div>

      <div className="mt-12 flex justify-center gap-3">
        <Link
          to={ROUTES.app}
          className="rounded-full bg-coffee-accent px-6 py-3 font-semibold text-coffee-bg transition hover:bg-coffee-accent-soft"
        >
          Open the app →
        </Link>
        <Link
          to={ROUTES.home}
          className="rounded-full border border-coffee-line px-6 py-3 font-semibold text-coffee-cream transition hover:bg-coffee-surface"
        >
          Back
        </Link>
      </div>
    </section>
  )
}
