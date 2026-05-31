import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/',          label: 'Home',      icon: '🏠' },
  { to: '/shots',     label: 'Shots',     icon: '📋' },
  { to: '/brews',     label: 'Brews',     icon: '🫖' },
  { to: '/analysis',  label: 'Analysis',  icon: '📊' },
  { to: '/coffees',   label: 'Coffees',   icon: '☕' },
  { to: '/roasters',  label: 'Roasters',  icon: '📍' },
  { to: '/equipment', label: 'Equipment', icon: '⚙️' },
  { to: '/guide',     label: 'Guide',     icon: '📖' },
  { to: '/glossary',  label: 'Glossary',  icon: '📚' },
  { to: '/animate',   label: 'Animate',   icon: '🎬' },
]

const primaryNav = navItems.slice(0, 4)
const moreNav    = navItems.slice(4)

export function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const isMoreActive = moreNav.some(item =>
    item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar — desktop only */}
      <nav className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-52 bg-white border-r border-slate-200 py-8 px-3 z-10">
        <p className="text-base font-bold text-slate-800 px-3 mb-6">☕ Espresso</p>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <span className="text-lg leading-none">{icon}</span>
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
        <div
          className="md:hidden fixed inset-0 z-20"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white border-t border-slate-200 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 px-2 py-3">
              {moreNav.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'
                    }`
                  }
                >
                  <span className="text-2xl leading-tight mb-0.5">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-30">
        {primaryNav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <span className="text-xl leading-tight">{icon}</span>
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
            moreOpen || isMoreActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl leading-tight">⋯</span>
          More
        </button>
      </nav>
    </div>
  )
}
