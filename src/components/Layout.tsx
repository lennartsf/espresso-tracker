import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useWriteQueue } from '../hooks/useWriteQueue'
import { useAuth } from '../lib/AuthContext'
import {
  Home, ListChecks, CupSoda, BarChart3, Coffee, MapPin, Settings,
  BookOpen, Library, Sparkles, LogOut, MoreHorizontal,
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
  { to: ROUTES.animate,   label: 'Animate',   Icon: Sparkles },
]

const primaryNav = navItems.slice(0, 4)
const moreNav    = navItems.slice(4)

export function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { online, pending } = useWriteQueue()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate(ROUTES.login)
  }

  const isMoreActive = moreNav.some(item =>
    item.to === ROUTES.app
      ? location.pathname === ROUTES.app
      : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex min-h-screen bg-coffee-bg text-coffee-text font-grotesk">

      {/* Offline / sync status — writes are buffered locally and replayed on reconnect */}
      {(!online || pending > 0) && (
        <div role="status" className="fixed top-0 left-0 right-0 z-40 bg-coffee-surface2 border-b border-coffee-line px-4 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-center text-xs text-coffee-accent-soft">
          {!online
            ? pending > 0
              ? `You're offline — ${pending} change${pending > 1 ? 's' : ''} saved locally, will sync when you're back.`
              : "You're offline — new shots and brews save locally and sync when you're back."
            : `Syncing ${pending} saved change${pending > 1 ? 's' : ''}…`}
        </div>
      )}

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
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-coffee-muted transition-colors hover:bg-coffee-surface2 hover:text-coffee-cream"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Log out
        </button>
      </nav>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-hidden md:ml-52 pb-20 md:pb-10 px-4 md:px-10 pt-6 w-full">
        <div className="min-w-0 max-w-lg md:max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* "More" overlay — mobile only */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 bg-coffee-surface border-t border-coffee-line shadow-lg"
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
              <button
                onClick={() => { setMoreOpen(false); handleLogout() }}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium text-coffee-muted hover:text-coffee-cream"
              >
                <LogOut size={22} strokeWidth={1.75} />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-coffee-surface border-t border-coffee-line flex z-30 pb-[env(safe-area-inset-bottom)]">
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
