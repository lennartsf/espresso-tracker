import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/shots', label: 'Shots', icon: '📋' },
  { to: '/brews', label: 'Brühen', icon: '🫖' },
  { to: '/analyse', label: 'Analyse', icon: '📊' },
  { to: '/kaffee', label: 'Kaffee', icon: '☕' },
  { to: '/roasters', label: 'Röstereien', icon: '📍' },
  { to: '/ausruestung', label: 'Ausrüstung', icon: '⚙️' },
  { to: '/guide', label: 'Guide', icon: '📖' },
]

export function Layout() {
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

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-10">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
      </nav>
    </div>
  )
}
