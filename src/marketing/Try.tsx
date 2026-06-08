import { Link } from 'react-router-dom'
import { ROUTES } from '../lib/routes'

/** Platzhalter — interaktive Demo-Sandbox kommt in Phase 1. */
export function Try() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-accent">Ausprobieren</p>
      <h1 className="mt-5 font-display text-4xl font-semibold text-coffee-cream md:text-5xl">
        Demo-Sandbox — kommt in Phase&nbsp;1.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-coffee-muted">
        Hier werden bald die Kernelemente (Shot-Timer, Brew-Ratio-Bar, Bewertungen) mit
        Mock-Daten zum Anfassen vorgestellt — ohne Account, nichts wird gespeichert.
      </p>
      <div className="mt-9 flex justify-center gap-3">
        <Link
          to={ROUTES.app}
          className="rounded-full bg-coffee-accent px-6 py-3 font-semibold text-coffee-bg transition hover:bg-coffee-accent-soft"
        >
          Zur App →
        </Link>
        <Link
          to={ROUTES.home}
          className="rounded-full border border-coffee-line px-6 py-3 font-semibold text-coffee-cream transition hover:bg-coffee-surface"
        >
          Zurück
        </Link>
      </div>
    </section>
  )
}
