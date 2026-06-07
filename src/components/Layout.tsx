import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Home, ListChecks, CupSoda, BarChart3, Coffee, MapPin, Settings,
  BookOpen, Library, Clapperboard, MoreHorizontal,
} from 'lucide-react'
import { ROUTES } from '../lib/routes'

const navItems = [
  { to: ROUTES.app,       label: 'Home',      Icon: Home },
  { to: ROUTES.shots,     label: 'Shots',     Icon: ListChecks },
  { to: ROUTES.brews,     label: 'Brews',     Icon: CupSoda },
  { to: ROUTES.analysis,  label: 'Analysis',  Icon: BarChart3 },
  { to: ROUTES.coffees,   label: 'Coffees',   Icon: Coffee },
  { to: ROUTES.roasters,  label: 'Roasters',  Icon: MapPin },
  { to: ROUTES.equipment, label: 'Equipment', Icon: Settings },
  { to: ROUTES.guide,     label: 'Guide',     Icon: BookOpen },
  { to: ROUTES.glossary,  label: 'Glossary',  Icon: Library },
  { to: ROUTES.animate,   label: 'Animate',   Icon: Clapperboard },
]

const primaryNav = navItems.slice(0, 4)
const moreNav    = navItems.slice(4)

export function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const isMoreActive = moreNav.some(item =>
    item.to === ROUTES.app
      ? location.pathname === ROUTES.app
      : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex min-h-screen bg-coffee-bg text-coffee-text font-grotesk">

      {/* Sidebar — desktop only */}
      <nav className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-52 bg-coffee-surface border-r border-coffee-line py-8 px-3 z-10">
        <p className="font-display text-base font-semibold text-coffee-cream px-3 mb-6">Espresso</p>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.app}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                isActive
                  ? 'bg-coffee-accent/15 text-coffee-accent-soft'
                  : 'text-coffee-muted hover:text-coffee-cream hover:bg-coffee-surface2'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-52 pb-20 md:pb-10 px-4 md:px-10 pt-6 w-full">
        <div className="max-w-lg md:max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* "More" overlay — mobile only */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-coffee-surface border-t border-coffee-line shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 px-2 py-3">
              {moreNav.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === ROUTES.app}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-cream'
                    }`
                  }
                >
                  <Icon size={22} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-coffee-surface border-t border-coffee-line flex z-30">
        {primaryNav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.app}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-cream'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
            moreOpen || isMoreActive ? 'text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-cream'
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={1.75} />
          More
        </button>
      </nav>
    </div>
  )
}
