import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/shots', label: 'Shots', icon: '📋' },
  { to: '/analyse', label: 'Analyse', icon: '📊' },
  { to: '/kaffee', label: 'Kaffee', icon: '☕' },
]

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full px-4 pt-6">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex safe-area-pb">
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
