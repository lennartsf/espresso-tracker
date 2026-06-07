import { Link, NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '../lib/routes'

/**
 * Dunkle Shell für die öffentliche Website (Marketing + Demo + Auth).
 * Dark-Premium-Tokens (font-grotesk, coffee-*). Getrennt von der App-Shell
 * (src/components/Layout.tsx), die vorerst hell bleibt.
 */
export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-coffee-bg text-coffee-text font-grotesk antialiased">
      <header className="sticky top-0 z-40 border-b border-coffee-line bg-coffee-bg/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Link to={ROUTES.home} className="font-display text-lg font-semibold text-coffee-cream">
            SILVIA
          </Link>
          <div className="ml-auto flex items-center gap-1 text-sm">
            <TopLink to={ROUTES.home} label="Home" />
            <TopLink to={ROUTES.try} label="Ausprobieren" />
            <TopLink to={ROUTES.login} label="Login" />
            <Link
              to={ROUTES.signup}
              className="ml-2 rounded-full bg-coffee-accent px-4 py-2 font-semibold text-coffee-bg transition hover:bg-coffee-accent-soft"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <Outlet />

      <footer className="border-t border-coffee-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-coffee-muted sm:flex-row sm:items-center">
          <span className="font-display text-coffee-cream">SILVIA</span>
          <span className="sm:ml-auto">Espresso-Tracking für die Rancilio Silvia · Phase-0-Vorschau</span>
        </div>
      </footer>
    </div>
  )
}

function TopLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-full px-3 py-2 transition ${
          isActive ? 'text-coffee-cream' : 'text-coffee-muted hover:text-coffee-cream'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
