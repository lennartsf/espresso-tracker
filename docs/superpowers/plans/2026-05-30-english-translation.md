# English Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permanently translate all German UI strings, content files, and routes in the Espresso Tracker to English.

**Architecture:** Direct string replacement across all source files — no i18n framework. Routes renamed, one file renamed (Glossar.tsx → Glossary.tsx), all label util functions return English strings, all page/component JSX strings replaced, all prose content (glossaryContent.ts, guideContent.ts) rewritten in English.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase + react-router-dom v6

---

### Task 1: Translate label utils (drinkTypes, equipmentTypes, brewMethods)

**Files:**
- Modify: `src/utils/drinkTypes.ts`
- Modify: `src/utils/equipmentTypes.ts`
- Modify: `src/utils/brewMethods.ts`
- Modify: `src/__tests__/drinkTypes.test.ts`
- Modify: `src/__tests__/equipmentTypes.test.ts`
- Modify: `src/__tests__/brewMethods.test.ts`

- [ ] **Step 1: Update drinkTypes.ts**

Replace the full file content:

```ts
export const DRINK_TYPES = [
  { value: 'espresso',        label: 'Espresso' },
  { value: 'cappuccino',      label: 'Cappuccino' },
  { value: 'latte_macchiato', label: 'Latte Macchiato' },
  { value: 'flat_white',      label: 'Flat White' },
  { value: 'cortado',         label: 'Cortado' },
  { value: 'macchiato',       label: 'Macchiato' },
] as const

export const MILK_TYPES = [
  { value: 'vollmilch_38', label: 'Whole Milk 3.8%' },
  { value: 'vollmilch_35', label: 'Whole Milk 3.5%' },
  { value: 'fettarm_15',   label: 'Semi-Skimmed 1.5%' },
  { value: 'hafer',        label: 'Oat Milk' },
  { value: 'mandel',       label: 'Almond Milk' },
  { value: 'kokos',        label: 'Coconut Milk' },
  { value: 'soja',         label: 'Soy Milk' },
] as const

export function drinkTypeLabel(value: string): string {
  return DRINK_TYPES.find(d => d.value === value)?.label ?? value
}

export function milkTypeLabel(value: string): string {
  return MILK_TYPES.find(m => m.value === value)?.label ?? value
}
```

- [ ] **Step 2: Update equipmentTypes.ts**

```ts
export const GRINDER_TYPES = [
  { value: 'flat',    label: 'Flat Burr' },
  { value: 'conical', label: 'Conical Burr' },
] as const

export const FUNKTIONSWEISE_TYPES = [
  { value: 'einkreiser',  label: 'Single Boiler' },
  { value: 'zweikreiser', label: 'Heat Exchanger' },
  { value: 'dualboiler',  label: 'Dual Boiler' },
  { value: 'thermoblock', label: 'Thermoblock' },
] as const

export function grinderTypeLabel(value: string): string {
  return GRINDER_TYPES.find(g => g.value === value)?.label ?? value
}

export function funktionsweiseLabel(value: string): string {
  return FUNKTIONSWEISE_TYPES.find(f => f.value === value)?.label ?? value
}

export const DEVICE_TYPES = [
  { value: 'french_press', label: 'French Press' },
  { value: 'v60',          label: 'V60' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'moka_pot',     label: 'Moka Pot' },
  { value: 'chemex',       label: 'Chemex' },
  { value: 'other',        label: 'Other' },
] as const

export function deviceTypeLabel(value: string): string {
  return DEVICE_TYPES.find(d => d.value === value)?.label ?? value
}
```

- [ ] **Step 3: Update brewMethods.ts**

```ts
export const BREW_METHODS = [
  { value: 'french_press', label: 'French Press' },
  { value: 'v60',          label: 'V60' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'moka_pot',     label: 'Moka Pot' },
] as const

export const BREW_METHOD_INFO: Record<string, string> = {
  french_press: 'Coarsely ground coffee steeps for ~4 min in hot water — then press the plunger. Optional: stir once after 1 min.',
  v60:          'Pour-over filter: pour water in circular motions. Bloom (30–45 s) lets CO₂ escape and improves extraction.',
  aeropress:    'Quick brew under gentle pressure — short brew time (1–2 min), low bitterness. Inverted: coffee steeps longer before pressing.',
  moka_pot:     'Espresso-style coffee via steam pressure on the stovetop. No pressure adjustment — heat controls extraction.',
}

export function brewMethodLabel(value: string): string {
  return BREW_METHODS.find(m => m.value === value)?.label ?? value
}
```

- [ ] **Step 4: Update drinkTypes.test.ts** — update test descriptions and expected values for milk labels

```ts
import { drinkTypeLabel, milkTypeLabel, DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'

test('DRINK_TYPES has 6 entries', () => {
  expect(DRINK_TYPES).toHaveLength(6)
})

test('MILK_TYPES has 7 entries', () => {
  expect(MILK_TYPES).toHaveLength(7)
})

test('drinkTypeLabel returns Espresso', () => {
  expect(drinkTypeLabel('espresso')).toBe('Espresso')
})

test('drinkTypeLabel returns Cappuccino', () => {
  expect(drinkTypeLabel('cappuccino')).toBe('Cappuccino')
})

test('drinkTypeLabel returns Flat White', () => {
  expect(drinkTypeLabel('flat_white')).toBe('Flat White')
})

test('drinkTypeLabel returns Latte Macchiato', () => {
  expect(drinkTypeLabel('latte_macchiato')).toBe('Latte Macchiato')
})

test('drinkTypeLabel fallback for unknown value', () => {
  expect(drinkTypeLabel('unknown')).toBe('unknown')
})

test('milkTypeLabel returns Oat Milk', () => {
  expect(milkTypeLabel('hafer')).toBe('Oat Milk')
})

test('milkTypeLabel returns Whole Milk 3.8%', () => {
  expect(milkTypeLabel('vollmilch_38')).toBe('Whole Milk 3.8%')
})

test('milkTypeLabel fallback for unknown value', () => {
  expect(milkTypeLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 5: Update equipmentTypes.test.ts** — update descriptions and expected values

```ts
import {
  GRINDER_TYPES, FUNKTIONSWEISE_TYPES,
  grinderTypeLabel, funktionsweiseLabel,
  DEVICE_TYPES, deviceTypeLabel,
} from '../utils/equipmentTypes'

test('GRINDER_TYPES has 2 entries', () => {
  expect(GRINDER_TYPES).toHaveLength(2)
})

test('FUNKTIONSWEISE_TYPES has 4 entries', () => {
  expect(FUNKTIONSWEISE_TYPES).toHaveLength(4)
})

test('grinderTypeLabel returns Flat Burr', () => {
  expect(grinderTypeLabel('flat')).toBe('Flat Burr')
})

test('grinderTypeLabel returns Conical Burr', () => {
  expect(grinderTypeLabel('conical')).toBe('Conical Burr')
})

test('grinderTypeLabel fallback for unknown value', () => {
  expect(grinderTypeLabel('unknown')).toBe('unknown')
})

test('funktionsweiseLabel returns Single Boiler', () => {
  expect(funktionsweiseLabel('einkreiser')).toBe('Single Boiler')
})

test('funktionsweiseLabel returns Dual Boiler', () => {
  expect(funktionsweiseLabel('dualboiler')).toBe('Dual Boiler')
})

test('funktionsweiseLabel returns Heat Exchanger', () => {
  expect(funktionsweiseLabel('zweikreiser')).toBe('Heat Exchanger')
})

test('funktionsweiseLabel returns Thermoblock', () => {
  expect(funktionsweiseLabel('thermoblock')).toBe('Thermoblock')
})

test('funktionsweiseLabel fallback for unknown value', () => {
  expect(funktionsweiseLabel('unknown')).toBe('unknown')
})

test('DEVICE_TYPES has 6 entries', () => {
  expect(DEVICE_TYPES).toHaveLength(6)
})

test('deviceTypeLabel returns French Press', () => {
  expect(deviceTypeLabel('french_press')).toBe('French Press')
})

test('deviceTypeLabel returns V60', () => {
  expect(deviceTypeLabel('v60')).toBe('V60')
})

test('deviceTypeLabel fallback for unknown value', () => {
  expect(deviceTypeLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 6: Update brewMethods.test.ts** — translate test description strings only (expected values don't change)

```ts
import { BREW_METHODS, brewMethodLabel } from '../utils/brewMethods'

test('BREW_METHODS has 4 entries', () => {
  expect(BREW_METHODS).toHaveLength(4)
})

test('brewMethodLabel returns French Press', () => {
  expect(brewMethodLabel('french_press')).toBe('French Press')
})

test('brewMethodLabel returns V60', () => {
  expect(brewMethodLabel('v60')).toBe('V60')
})

test('brewMethodLabel returns AeroPress', () => {
  expect(brewMethodLabel('aeropress')).toBe('AeroPress')
})

test('brewMethodLabel returns Moka Pot', () => {
  expect(brewMethodLabel('moka_pot')).toBe('Moka Pot')
})

test('brewMethodLabel fallback for unknown value', () => {
  expect(brewMethodLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 7: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker
npm test -- --testPathPattern="drinkTypes|equipmentTypes|brewMethods" --no-coverage
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/utils/drinkTypes.ts src/utils/equipmentTypes.ts src/utils/brewMethods.ts \
  src/__tests__/drinkTypes.test.ts src/__tests__/equipmentTypes.test.ts src/__tests__/brewMethods.test.ts
git commit -m "feat: translate label utils to English"
```

---

### Task 2: Routes, nav labels, and file rename

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`
- Rename: `src/pages/Glossar.tsx` → `src/pages/Glossary.tsx` (change export name too)

- [ ] **Step 1: Rename Glossar.tsx and update export**

Open `src/pages/Glossar.tsx`. Change:
- filename to `Glossary.tsx`
- `CATEGORY_LABELS` key `milch` → `milk`
- All German UI strings

Full replacement of `src/pages/Glossary.tsx`:

```tsx
import { useState } from 'react'
import { GLOSSARY } from '../utils/glossaryContent'

const CATEGORY_LABELS = {
  espresso:  '☕ Espresso',
  brew:      '🫖 Brew',
  equipment: '⚙️ Equipment',
  milk:      '🥛 Milk',
}

export function Glossary() {
  const [query, setQuery] = useState('')

  const filtered = GLOSSARY.filter(entry =>
    entry.term.toLowerCase().includes(query.toLowerCase()) ||
    entry.definition.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">📚 Glossary</h1>
      <p className="text-sm text-slate-500 mb-4">{GLOSSARY.length} terms</p>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search terms..."
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 mb-4"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">No terms found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(entry => (
            <div key={entry.term} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="font-semibold text-slate-800 text-sm">{entry.term}</h2>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  {CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{entry.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

Delete `src/pages/Glossar.tsx` (create new file `src/pages/Glossary.tsx` with the above content).

- [ ] **Step 2: Update App.tsx** — change import, route paths

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { NewShot } from './pages/NewShot'
import { ShotHistory } from './pages/ShotHistory'
import { CoffeeManager } from './pages/CoffeeManager'
import { Analysis } from './pages/Analysis'
import { Roasters } from './pages/Roasters'
import { ShotDetail } from './pages/ShotDetail'
import { Equipment } from './pages/Equipment'
import { Brews } from './pages/Brews'
import { NewBrew } from './pages/NewBrew'
import { BrewDetail } from './pages/BrewDetail'
import { Guide } from './pages/Guide'
import { GuideDetail } from './pages/GuideDetail'
import { Glossary } from './pages/Glossary'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="shots" element={<ShotHistory />} />
            <Route path="shots/new" element={<NewShot />} />
            <Route path="shots/:id" element={<ShotDetail />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="coffees" element={<CoffeeManager />} />
            <Route path="roasters" element={<Roasters />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="brews" element={<Brews />} />
            <Route path="brews/new" element={<NewBrew />} />
            <Route path="brews/:id" element={<BrewDetail />} />
            <Route path="guide" element={<Guide />} />
            <Route path="guide/:id" element={<GuideDetail />} />
            <Route path="glossary" element={<Glossary />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: Update Layout.tsx** — nav labels and route `to` paths

```tsx
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
```

- [ ] **Step 4: Run all tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass (App.test.tsx checks routing, should still pass since the file structure is consistent).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/Layout.tsx src/pages/Glossary.tsx
git rm src/pages/Glossar.tsx
git commit -m "feat: rename routes and nav labels to English"
```

---

### Task 3: Dashboard, ShotHistory, ShotCard, BrewCard

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/ShotHistory.tsx`
- Modify: `src/components/ShotCard.tsx`
- Modify: `src/components/BrewCard.tsx`
- Modify: `src/__tests__/ShotCard.test.tsx`
- Modify: `src/__tests__/BrewCard.test.tsx`

- [ ] **Step 1: Update Dashboard.tsx**

Replace all German strings:

```tsx
import { Link } from 'react-router-dom'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { ShotCard } from '../components/ShotCard'
import { BrewCard } from '../components/BrewCard'

export function Dashboard() {
  const { data: shots = [], isLoading } = useShots()
  const { data: brews = [] } = useBrews()

  const avgRating = shots.length > 0
    ? (shots.reduce((sum, s) => sum + s.rating, 0) / shots.length).toFixed(1)
    : '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">☕ Espresso</h1>
        <Link
          to="/shots/new"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          + New Shot
        </Link>
      </div>

      {/* Shot Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{shots.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Shots total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avgRating}</p>
          <p className="text-xs text-slate-500 mt-0.5">Avg Flavor</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {shots.filter(s => s.rating >= 8).length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Top Shots (≥8)</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {shots.length > 0
              ? (shots.reduce((s, x) => s + (x.brew_ratio ?? 0), 0) / shots.filter(x => x.brew_ratio !== null).length || 0).toFixed(2)
              : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Avg Ratio</p>
        </div>
      </div>

      {/* Brew Stats */}
      {brews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{brews.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Brews total</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">
              {(brews.reduce((sum, b) => sum + b.rating, 0) / brews.length).toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Avg Brew Rating</p>
          </div>
        </div>
      )}
      {brews.length === 0 && <div className="mb-8" />}

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Recent Shots
      </h2>

      {isLoading && <p className="text-slate-400 text-sm text-center py-4">Loading...</p>}

      <div className="grid md:grid-cols-2 gap-2 mb-6">
        {shots.slice(0, 6).map(shot => (
          <ShotCard key={shot.id} shot={shot} />
        ))}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8 md:col-span-2">
            No shots yet. Pull your first!
          </p>
        )}
      </div>

      {brews.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Recent Brews
          </h2>
          <div className="grid md:grid-cols-2 gap-2 mb-6">
            {brews.slice(0, 4).map(brew => (
              <BrewCard key={brew.id} brew={brew} />
            ))}
          </div>
        </>
      )}

      <Link
        to="/shots/new"
        className="md:hidden block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold py-3 rounded-xl"
      >
        + New Shot
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Update ShotHistory.tsx**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'

type DrinkFilter = 'all' | 'espresso' | 'milk'

const DRINK_FILTER_LABELS: Record<DrinkFilter, string> = {
  all: 'All',
  espresso: 'Espresso',
  milk: 'Milk Drinks',
}

export function ShotHistory() {
  const [filterCoffeeId, setFilterCoffeeId] = useState('')
  const [drinkFilter, setDrinkFilter] = useState<DrinkFilter>('all')
  const { data: coffees = [] } = useCoffees()
  const { data: shots = [], isLoading } = useShots(
    filterCoffeeId || undefined,
    undefined,
    drinkFilter === 'all' ? undefined : drinkFilter,
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">📋 Shots</h1>
        <Link
          to="/shots/new"
          className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          + New
        </Link>
      </div>

      <div className="flex border-b border-slate-200 mb-4">
        {(['all', 'espresso', 'milk'] as const).map(f => (
          <button
            key={f}
            onClick={() => setDrinkFilter(f)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              drinkFilter === f
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {DRINK_FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <select
        value={filterCoffeeId}
        onChange={e => setFilterCoffeeId(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-4 focus:outline-none focus:border-orange-400"
      >
        <option value="">All Coffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Loading...</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {shots.map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10 md:col-span-2">No shots found.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update ShotCard.tsx** — "Mahlgrad" → "Grind", "Röstung" → "Roast", locale 'de-DE' → 'en-GB'

```tsx
import { Link } from 'react-router-dom'
import { ratingColor } from '../utils/ratingColor'
import { drinkTypeLabel, milkTypeLabel } from '../utils/drinkTypes'
import type { ShotWithCoffee } from '../hooks/useShots'

interface Props {
  shot: ShotWithCoffee
}

export function ShotCard({ shot }: Props) {
  const isMilkDrink = shot.drink_type !== 'espresso'

  const roastDate = shot.roast_dates?.roast_date
    ? new Date(shot.roast_dates.roast_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const subtitle = isMilkDrink
    ? [
        shot.milk_type ? milkTypeLabel(shot.milk_type) : null,
        shot.milk_ml ? `${shot.milk_ml} ml` : null,
        `Grind ${shot.grind_setting}`,
        shot.grinders?.name ?? null,
      ].filter(Boolean).join(' · ')
    : [
        `Grind ${shot.grind_setting}`,
        shot.brew_time_s ? `${shot.brew_time_s}s` : null,
        shot.grinders?.name ?? null,
        roastDate ? `Roast ${roastDate}` : null,
      ].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/shots/${shot.id}`}
      className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-orange-300 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${
            isMilkDrink
              ? 'bg-orange-50 text-orange-700 border border-orange-200'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {drinkTypeLabel(shot.drink_type)}
          </span>
          <p className="font-medium text-slate-800 text-sm truncate">{shot.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ml-3 flex-shrink-0 ${ratingColor(shot.rating)}`}>
        {shot.rating}
      </span>
    </Link>
  )
}
```

- [ ] **Step 4: Update BrewCard.tsx** — "Mahlgrad" → "Grind"

```tsx
import { Link } from 'react-router-dom'
import { ratingColor } from '../utils/ratingColor'
import { brewMethodLabel } from '../utils/brewMethods'
import { secondsToMMSS } from '../utils/timeFormat'
import type { BrewWithCoffee } from '../hooks/useBrews'

interface Props {
  brew: BrewWithCoffee
}

export function BrewCard({ brew }: Props) {
  const subtitle = [
    brew.grind_setting != null ? `Grind ${brew.grind_setting}` : null,
    brew.dose_g != null ? `${brew.dose_g}g` : null,
    brew.water_ml != null ? `${brew.water_ml} ml` : null,
    brew.brew_time_s != null ? secondsToMMSS(brew.brew_time_s) : null,
    brew.grinders?.name ?? null,
    brew.brew_devices?.name ?? null,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/brews/${brew.id}`}
      className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-orange-300 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 flex-shrink-0">
            {brewMethodLabel(brew.brew_method)}
          </span>
          <p className="font-medium text-slate-800 text-sm truncate">{brew.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ml-3 flex-shrink-0 ${ratingColor(brew.rating)}`}>
        {brew.rating}
      </span>
    </Link>
  )
}
```

- [ ] **Step 5: Update ShotCard.test.tsx**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShotCard } from '../components/ShotCard'
import type { ShotWithCoffee } from '../hooks/useShots'

const baseShot: ShotWithCoffee = {
  id: 's1',
  coffee_id: 'c1',
  roast_date_id: null,
  grind_setting: 12,
  dose_g: 18,
  yield_g: 36,
  brew_time_s: 28,
  temp_c: 93,
  pressure_bar: 9,
  rating: 8,
  body_score: null,
  acidity_score: null,
  bitterness_score: null,
  preinfusion_s: null,
  brew_ratio: 2,
  tasting_notes: null,
  used_rdt: false,
  used_wdt: false,
  used_leveler: false,
  grinder_id: null,
  machine_id: null,
  basket_id: null,
  drink_type: 'espresso',
  milk_type: null,
  milk_ml: null,
  pulled_at: '2026-05-30T10:00:00Z',
  created_at: '2026-05-30T10:00:00Z',
  coffees: { name: 'Ethiopia' },
  roast_dates: null,
  grinders: null,
  machines: null,
  baskets: null,
}

function renderCard(shot: ShotWithCoffee) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ShotCard shot={shot} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('shows Espresso badge for espresso shots', () => {
  renderCard(baseShot)
  expect(screen.getByText('Espresso')).toBeInTheDocument()
})

test('shows Cappuccino badge for cappuccino shots', () => {
  renderCard({ ...baseShot, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120 })
  expect(screen.getByText('Cappuccino')).toBeInTheDocument()
})

test('shows milk type and ml in subtitle for milk drinks', () => {
  renderCard({ ...baseShot, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120 })
  expect(screen.getByText(/Oat Milk/)).toBeInTheDocument()
  expect(screen.getByText(/120 ml/)).toBeInTheDocument()
})

test('shows grind setting in subtitle for espresso', () => {
  renderCard(baseShot)
  expect(screen.getByText(/Grind 12/)).toBeInTheDocument()
})
```

- [ ] **Step 6: Update BrewCard.test.tsx** — update test description strings only (the functional assertions don't check German strings)

Open `src/__tests__/BrewCard.test.tsx`. Change:
- `test('zeigt Kaffee-Name', ...` → `test('shows coffee name', ...`
- `test('zeigt Brühzeit als 03:30', ...` → `test('shows brew time as 03:30', ...`

- [ ] **Step 7: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/ShotHistory.tsx \
  src/components/ShotCard.tsx src/components/BrewCard.tsx \
  src/__tests__/ShotCard.test.tsx src/__tests__/BrewCard.test.tsx
git commit -m "feat: translate Dashboard, ShotHistory, ShotCard, BrewCard"
```

---

### Task 4: Analysis page and RecipeCard

**Files:**
- Modify: `src/pages/Analysis.tsx`
- Modify: `src/components/RecipeCard.tsx`

- [ ] **Step 1: Update Analysis.tsx**

Key string replacements (apply to the full file):

| German | English |
|--------|---------|
| `type AnalysisTab = 'espresso' \| 'brews' \| 'milch'` | `type AnalysisTab = 'espresso' \| 'brews' \| 'milk'` |
| `tab === 'milch'` | `tab === 'milk'` |
| `'milch'` (TABS key) | `'milk'` |
| `'🥛 Milch'` | `'🥛 Milk'` |
| `function MilchAnalysis()` | `function MilkAnalysis()` |
| `{tab === 'milch' && <MilchAnalysis />}` | `{tab === 'milk' && <MilkAnalysis />}` |
| `label: 'Geschmack'` | `label: 'Flavor'` |
| `label: 'Körper'` | `label: 'Body'` |
| `label: 'Säure'` | `label: 'Acidity'` |
| `label: 'Bitterkeit'` | `label: 'Bitterness'` |
| `'📊 Analyse'` | `'📊 Analysis'` |
| `'Alle Kaffees'` | `'All Coffees'` |
| `'Alle Röstungen'` | `'All Roasts'` |
| `' (aktuell)'` | `' (current)'` |
| `'Alle Mühlen'` | `'All Grinders'` |
| `'Alle Methoden'` | `'All Methods'` |
| `'💡 Tipp: Filtere auf eine Mühle — Mahlgrad-Zahlen sind nur innerhalb derselben Mühle vergleichbar.'` | `'💡 Tip: Filter by one grinder — grind numbers are only comparable within the same grinder.'` |
| `'Noch keine Espresso-Shots für diese Auswahl.'` | `'No espresso shots for this selection.'` |
| `'Noch keine Brews für diese Auswahl.'` | `'No brews for this selection.'` |
| `'Noch keine Milchgetränke.'` | `'No milk drinks yet.'` |
| `'Getränke total'` | `'Drinks total'` |
| `'Ø Bewertung'` | `'Avg Rating'` |
| `'Nach Getränketyp'` | `'By Drink Type'` |
| `'Noch keine Shots mit Geschmack ≥ 8.'` | `'No shots with Flavor ≥ 8.'` |
| `'Noch keine Brews mit Bewertung ≥ 8.'` | `'No brews with Rating ≥ 8.'` |
| `'Top-Rezept'` | `'Top Recipe'` |
| `'Ø Mahlgrad'` | `'Avg Grind'` |
| `'Ø Verhältnis'` | `'Avg Ratio'` |
| `'Ø Temperatur'` | `'Avg Temp'` |
| `'Ø Brühzeit'` | `'Avg Brew Time'` |
| `'Mahlgrad → '` | `'Grind → '` |
| `xLabel="Mahlgrad"` | `xLabel="Grind"` |
| `'Noch keine Daten mit'` + yLabel + `'-Bewertung.'` | `'No data yet for'` + yLabel + `'rating.'` |
| `'de-DE'` in formatDate | `'en-GB'` |
| `useShots(..., 'milk')` — already correct in MilkAnalysis; the `useShots` call in `MilchAnalysis` passes `'milk'` so no change needed |

- [ ] **Step 2: Update RecipeCard.tsx**

```tsx
import type { RecipeStats } from '../utils/recipeCalc'

interface Props {
  stats: RecipeStats
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}

export function RecipeCard({ stats }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Best Recipe
        </span>
        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
          Avg {stats.avgRating.toFixed(1)} · {stats.shotCount} Shots
        </span>
      </div>
      <div className="grid gap-2">
        <Row label="Grind" value={`${stats.grindMin}–${stats.grindMax}`} />
        {stats.avgDose !== null && stats.avgYield !== null && (
          <Row label="Ratio" value={`${stats.avgDose.toFixed(0)}g → ${stats.avgYield.toFixed(0)}g`} />
        )}
        {stats.brewTimeMin !== null && stats.brewTimeMax !== null && (
          <Row label="Brew Time" value={`${stats.brewTimeMin}–${stats.brewTimeMax}s`} />
        )}
        {stats.avgTemp !== null && (
          <Row label="Temperature" value={`${stats.avgTemp.toFixed(0)}°C`} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Analysis.tsx src/components/RecipeCard.tsx
git commit -m "feat: translate Analysis page and RecipeCard"
```

---

### Task 5: NewShot page

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Step 1: Update RATING_INFO and all UI strings in NewShot.tsx**

Replace the `RATING_INFO` constant:

```tsx
const RATING_INFO = {
  rating:          { question: 'How good does the shot taste overall?', low: 'barely drinkable',  high: 'perfect espresso'   },
  body_score:      { question: 'How full and creamy does the espresso feel?', low: 'thin & watery', high: 'rich & creamy'   },
  acidity_score:   { question: 'How pronounced is the acidity in the shot?', low: 'very mild',     high: 'bright & lively'   },
  bitterness_score:{ question: 'How strong is the bitterness in the shot?', low: 'barely bitter',  high: 'very bitter'       },
}
```

Replace all German UI strings in JSX and logic (search for each one):

| German | English |
|--------|---------|
| `'Bitte einen Kaffee auswählen oder eingeben.'` | `'Please select or enter a coffee.'` |
| `'Mahlgrad ist erforderlich.'` | `'Grind setting is required.'` |
| `'Bitte den Shot bewerten.'` | `'Please rate the shot.'` |
| `'Neuer Shot'` | `'New Shot'` |
| `'Getränketyp'` | `'Drink Type'` |
| `'Kaffee *'` | `'Coffee *'` |
| `'Kaffee wählen...'` | `'Select coffee...'` |
| `'+ Neu'` | `'+ New'` |
| `'Kaffee-Name'` | `'Coffee name'` |
| `'Abbrechen'` | `'Cancel'` |
| `'Röstdatum'` | `'Roast Date'` |
| `'Keine Angabe'` | `'Not specified'` |
| `'Aktuell'` | `'Current'` |
| `'Mühle (optional)'` | `'Grinder (optional)'` |
| `'Mahlgrad *'` | `'Grind Setting *'` |
| `'Druck (bar)'` | `'Pressure (bar)'` |
| `'Einwaage (g)'` | `'Dose (g)'` |
| `'Ausbeute (g)'` | `'Yield (g)'` |
| `'Brühzeit'` | `'Brew Time'` |
| `'Milch'` (section label) | `'Milk'` |
| `'Sorte'` | `'Type'` |
| `'Menge'` | `'Amount'` |
| `'Wählen...'` | `'Select...'` |
| `'Vorbereitung'` | `'Prep'` |
| `'Ausrüstung'` | `'Equipment'` |
| `'Maschine (optional)'` | `'Machine (optional)'` |
| `'Sieb (optional)'` | `'Basket (optional)'` |
| `label="Geschmack" required` | `label="Flavor" required` |
| `label="Körper"` | `label="Body"` |
| `label="Säure"` | `label="Acidity"` |
| `label="Bitterkeit"` | `label="Bitterness"` |
| `'Geschmacksnotizen'` | `'Tasting Notes'` |
| `placeholder="Schokolade, Nuss, leicht säuerlich..."` | `placeholder="Chocolate, nuts, slightly acidic..."` |
| `'Speichern...'` | `'Saving...'` |
| `'Shot speichern'` | `'Save Shot'` |
| `'de-DE'` in formatDate | `'en-GB'` |

- [ ] **Step 2: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat: translate NewShot page"
```

---

### Task 6: ShotDetail page

**Files:**
- Modify: `src/pages/ShotDetail.tsx`
- Modify: `src/__tests__/ShotDetail.test.tsx`

- [ ] **Step 1: Update all German strings in ShotDetail.tsx**

Key replacements (the file is ~650 lines — apply all of these):

| German | English |
|--------|---------|
| `'de-DE'` in formatDate | `'en-GB'` |
| `'Laden...'` | `'Loading...'` |
| `'Fehler beim Laden des Shots.'` | `'Error loading shot.'` |
| `'← Zurück'` | `'← Back'` |
| `'Shot nicht gefunden.'` | `'Shot not found.'` |
| `'Shot wirklich löschen?'` | `'Delete this shot?'` |
| `'Bearbeiten'` | `'Edit'` |
| `'Löschen...'` | `'Deleting...'` |
| `'Löschen'` | `'Delete'` |
| `'Gesamtbewertung'` | `'Overall Rating'` |
| `'Körper'` | `'Body'` |
| `'Säure'` | `'Acidity'` |
| `'Bitterkeit'` | `'Bitterness'` |
| `'Mahlgrad'` | `'Grind Setting'` |
| `'Einwaage'` | `'Dose'` |
| `'Ausbeute'` | `'Yield'` |
| `'Brühzeit'` | `'Brew Time'` |
| `'Temperatur'` | `'Temperature'` |
| `'Druck'` | `'Pressure'` |
| `'Preinfusion'` | `'Preinfusion'` |
| `'Röstdatum'` | `'Roast Date'` |
| `'Mühle'` | `'Grinder'` |
| `'Maschine'` | `'Machine'` |
| `'Sieb'` | `'Basket'` |
| `'Gerät'` | `'Device'` |
| `'Geschmacksnotizen'` | `'Tasting Notes'` |
| `'Vorbereitung'` | `'Prep'` |
| `'Milch'` | `'Milk'` |
| `'Sorte'` | `'Type'` |
| `'Menge'` | `'Amount'` |
| `'Gespeichert'` / `'Speichern'` | `'Saved'` / `'Save'` |
| `'Abbrechen'` | `'Cancel'` |
| `'Kaffee wählen...'` | `'Select coffee...'` |
| `'Keine Angabe'` | `'Not specified'` |
| `'Mühle (optional)'` | `'Grinder (optional)'` |
| `'Maschine (optional)'` | `'Machine (optional)'` |
| `'Sieb (optional)'` | `'Basket (optional)'` |
| `'Wählen...'` | `'Select...'` |
| `'Aktuell'` | `'Current'` |
| `'Röstung'` (in roast date label) | `'Roast'` |
| All RATING_INFO strings (same pattern as NewShot Task 5) | English equivalents |

- [ ] **Step 2: Update ShotDetail.test.tsx** — update German test descriptions and "Hafermilch" assertion

Open `src/__tests__/ShotDetail.test.tsx`. Find all German test description strings (`'zeigt ...'`) and translate them to English (`'shows ...'`). Also update:

```ts
// Find line ~141:
expect(screen.getByText('Hafermilch')).toBeInTheDocument()
// Change to:
expect(screen.getByText('Oat Milk')).toBeInTheDocument()
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ShotDetail.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: translate ShotDetail page"
```

---

### Task 7: Brews, NewBrew, BrewDetail

**Files:**
- Modify: `src/pages/Brews.tsx`
- Modify: `src/pages/NewBrew.tsx`
- Modify: `src/pages/BrewDetail.tsx`

- [ ] **Step 1: Update Brews.tsx**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useBrews } from '../hooks/useBrews'
import { BrewCard } from '../components/BrewCard'

type MethodFilter = 'all' | 'french_press' | 'v60' | 'aeropress' | 'moka_pot'

const METHOD_FILTER_LABELS: Record<MethodFilter, string> = {
  all: 'All',
  french_press: 'French Press',
  v60: 'V60',
  aeropress: 'AeroPress',
  moka_pot: 'Moka Pot',
}

export function Brews() {
  const [filterCoffeeId, setFilterCoffeeId] = useState('')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const { data: coffees = [] } = useCoffees()
  const { data: brews = [], isLoading } = useBrews(
    filterCoffeeId || undefined,
    methodFilter === 'all' ? undefined : methodFilter,
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">🫖 Brews</h1>
        <Link to="/brews/new" className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + New
        </Link>
      </div>

      <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
        {(['all', 'french_press', 'v60', 'aeropress', 'moka_pot'] as const).map(f => (
          <button
            key={f}
            onClick={() => setMethodFilter(f)}
            className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              methodFilter === f
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {METHOD_FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <select
        value={filterCoffeeId}
        onChange={e => setFilterCoffeeId(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-4 focus:outline-none focus:border-orange-400"
      >
        <option value="">All Coffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Loading...</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {brews.map(brew => <BrewCard key={brew.id} brew={brew} />)}
        {!isLoading && brews.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10 md:col-span-2">
            No brews yet. Add your first!
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update NewBrew.tsx** — RATING_INFO and all UI strings

Replace RATING_INFO:

```tsx
const RATING_INFO = {
  rating:          { question: 'How good does the brew taste overall?', low: 'barely drinkable', high: 'perfect brew'    },
  acidity_score:   { question: 'How pronounced is the acidity in the brew?', low: 'very mild',   high: 'bright & lively' },
  bitterness_score:{ question: 'How strong is the bitterness in the brew?', low: 'barely bitter', high: 'very bitter'    },
}
```

Key string replacements in NewBrew.tsx JSX:

| German | English |
|--------|---------|
| `'Neuer Brew'` | `'New Brew'` |
| `'Methode'` | `'Method'` |
| `'ℹ️'` tooltip text for method | English (see brewMethods.ts already updated) |
| `'Kaffee'` | `'Coffee'` |
| `'Kaffee wählen...'` | `'Select coffee...'` |
| `'Mühle (optional)'` | `'Grinder (optional)'` |
| `'Gerät (optional)'` | `'Device (optional)'` |
| `'Mahlgrad'` | `'Grind Setting'` |
| `'Einwaage (g)'` | `'Dose (g)'` |
| `'Wasser (ml)'` | `'Water (ml)'` |
| `'Temp (°C)'` | `'Temp (°C)'` |
| `'Brühzeit'` | `'Brew Time'` |
| `'Bloom (ml)'` | `'Bloom (ml)'` |
| `'Bloom-Zeit'` | `'Bloom Time'` |
| `'Invertiert'` | `'Inverted'` |
| `'Erster Rührstich (s)'` | `'First Stir (s)'` |
| `'Geschmack'` label | `'Flavor'` |
| `'Säure'` label | `'Acidity'` |
| `'Bitterkeit'` label | `'Bitterness'` |
| `'Geschmacksnotizen'` | `'Tasting Notes'` |
| `'Speichern...'` | `'Saving...'` |
| `'Brew speichern'` | `'Save Brew'` |
| `'Bitte Kaffee auswählen.'` | `'Please select a coffee.'` |
| `'Bewertung erforderlich.'` | `'Rating is required.'` |
| `'Brühzeit muss MM:SS sein.'` | `'Brew time must be MM:SS.'` |

- [ ] **Step 3: Update BrewDetail.tsx** — same pattern as ShotDetail

Key string replacements in BrewDetail.tsx:

| German | English |
|--------|---------|
| `'de-DE'` in formatDate | `'en-GB'` |
| `'Laden...'` | `'Loading...'` |
| `'Fehler beim Laden'` | `'Error loading brew.'` |
| `'← Zurück'` | `'← Back'` |
| `'Brew nicht gefunden.'` | `'Brew not found.'` |
| `'Brew wirklich löschen?'` | `'Delete this brew?'` |
| `'Bearbeiten'` | `'Edit'` |
| `'Löschen...'` | `'Deleting...'` |
| `'Löschen'` | `'Delete'` |
| `'Gesamtbewertung'` | `'Overall Rating'` |
| `'Säure'` | `'Acidity'` |
| `'Bitterkeit'` | `'Bitterness'` |
| `'Mahlgrad'` | `'Grind Setting'` |
| `'Einwaage'` | `'Dose'` |
| `'Wasser'` | `'Water'` |
| `'Brühzeit'` | `'Brew Time'` |
| `'Temperatur'` | `'Temperature'` |
| `'Bloom'` stays |  |
| `'Bloom-Zeit'` | `'Bloom Time'` |
| `'Invertiert'` | `'Inverted'` |
| `'Erster Rührstich'` | `'First Stir'` |
| `'Mühle'` | `'Grinder'` |
| `'Gerät'` | `'Device'` |
| `'Geschmacksnotizen'` | `'Tasting Notes'` |
| `'Speichern'` | `'Save'` |
| `'Abbrechen'` | `'Cancel'` |
| `'Kaffee wählen...'` | `'Select coffee...'` |
| `'Mühle (optional)'` | `'Grinder (optional)'` |
| `'Gerät (optional)'` | `'Device (optional)'` |
| RATING_INFO same pattern | English |

- [ ] **Step 4: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Brews.tsx src/pages/NewBrew.tsx src/pages/BrewDetail.tsx
git commit -m "feat: translate Brews, NewBrew, BrewDetail pages"
```

---

### Task 8: Guide, GuideDetail pages

**Files:**
- Modify: `src/pages/Guide.tsx`
- Modify: `src/pages/GuideDetail.tsx`

- [ ] **Step 1: Update Guide.tsx**

```tsx
import { Link } from 'react-router-dom'
import { GUIDES } from '../utils/guideContent'

export function Guide() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">📖 Guide</h1>
      <p className="text-sm text-slate-500 mb-6">Guides & Troubleshooting</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GUIDES.map(guide => (
          <Link
            key={guide.id}
            to={`/guide/${guide.id}`}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow block"
          >
            <div className="text-3xl mb-2">{guide.icon}</div>
            <div className="font-semibold text-sm text-slate-800 mb-0.5">{guide.title}</div>
            <div className="text-xs text-slate-500 mb-2">{guide.description}</div>
            <div className="flex flex-wrap gap-1">
              {guide.quickProblems.slice(0, 2).map(qp => (
                <span
                  key={qp.targetId}
                  className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                >
                  {qp.label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update GuideDetail.tsx** — translate section headings

```tsx
// Change these strings in the JSX:
// '📋 Schritt-für-Schritt'  →  '📋 Step by Step'
// 'Häufige Probleme'        →  'Common Problems'
// '⚠️ Troubleshooting'     →  '⚠️ Troubleshooting'  (stays)
// 'Ursache:'                →  'Cause:'
```

Full replacement of the two heading strings and the "Ursache:" label:

In `src/pages/GuideDetail.tsx` line ~37:
```tsx
<p className="text-xs uppercase tracking-wide text-slate-400 mb-3">Common Problems</p>
```

Line ~53:
```tsx
<h2 className="text-sm font-semibold text-slate-700 mb-3">📋 Step by Step</h2>
```

Line ~91 (inside accordion):
```tsx
<p className="text-xs text-slate-500 mb-2">
  <strong>Cause:</strong> {item.cause}
</p>
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Guide.tsx src/pages/GuideDetail.tsx
git commit -m "feat: translate Guide and GuideDetail pages"
```

---

### Task 9: CoffeeManager, Roasters, Equipment, PhotoUpload

**Files:**
- Modify: `src/pages/CoffeeManager.tsx`
- Modify: `src/pages/Roasters.tsx`
- Modify: `src/pages/Equipment.tsx`
- Modify: `src/components/PhotoUpload.tsx`

- [ ] **Step 1: Update CoffeeManager.tsx** — translate all German strings

Key replacements (CoffeeManager.tsx is ~666 lines):

| German | English |
|--------|---------|
| `'☕ Kaffee'` | `'☕ Coffees'` |
| `'+ Neuer Kaffee'` | `'+ New Coffee'` |
| `'Kaffee-Name *'` | `'Coffee Name *'` |
| `'Rösterei'` | `'Roaster'` |
| `'Herkunft'` | `'Origin'` |
| `'Röstgrad (1–10)'` | `'Roast Level (1–10)'` |
| `'Arabica %'` | `'Arabica %'` |
| `'Robusta %'` | `'Robusta %'` |
| `'Ursprungsland'` | `'Country of Origin'` |
| `'Region'` | `'Region'` |
| `'Höhe (m)'` | `'Altitude (m)'` |
| `'Notizen'` | `'Notes'` |
| `'Speichern'` | `'Save'` |
| `'Abbrechen'` | `'Cancel'` |
| `'Bearbeiten'` | `'Edit'` |
| `'Löschen'` | `'Delete'` |
| `'Röstdaten'` | `'Roast Dates'` |
| `'+ Röstdatum'` | `'+ Roast Date'` |
| `'Röstdatum löschen?'` | `'Delete roast date?'` |
| `'Laden...'` | `'Loading...'` |
| `'Noch keine Kaffees.'` | `'No coffees yet.'` |
| `'Kaffee löschen?'` | `'Delete coffee?'` |
| `'Speichern...'` | `'Saving...'` |
| `placeholder="Name"` | `placeholder="Name"` (stays) |
| German error messages | English equivalents |

- [ ] **Step 2: Update Roasters.tsx** — translate all German strings

Key replacements:

| German | English |
|--------|---------|
| `'📍 Röstereien'` | `'📍 Roasters'` |
| `'+ Neue Rösterei'` | `'+ New Roaster'` |
| `'Name *'` | `'Name *'` |
| `'Adresse'` | `'Address'` |
| `'Webseite'` | `'Website'` |
| `'Notizen'` | `'Notes'` |
| `'Speichern'` | `'Save'` |
| `'Abbrechen'` | `'Cancel'` |
| `'Bearbeiten'` | `'Edit'` |
| `'Löschen'` | `'Delete'` |
| `'Laden...'` | `'Loading...'` |
| `'Noch keine Röstereien.'` | `'No roasters yet.'` |
| `'Rösterei löschen?'` | `'Delete roaster?'` |
| `'Speichern...'` | `'Saving...'` |

- [ ] **Step 3: Update Equipment.tsx** — translate all German strings (~1025 lines)

Key replacements:

| German | English |
|--------|---------|
| `'⚙️ Ausrüstung'` | `'⚙️ Equipment'` |
| Tab labels: `'Mühlen'` | `'Grinders'` |
| Tab labels: `'Maschinen'` | `'Machines'` |
| Tab labels: `'Siebe'` | `'Baskets'` |
| Tab labels: `'Geräte'` | `'Devices'` |
| `'+ Neue Mühle'` | `'+ New Grinder'` |
| `'+ Neue Maschine'` | `'+ New Machine'` |
| `'+ Neues Sieb'` | `'+ New Basket'` |
| `'+ Neues Gerät'` | `'+ New Device'` |
| `'Name *'` | `'Name *'` |
| `'Marke'` | `'Brand'` |
| `'Typ'` | `'Type'` |
| `'Mahlwerk (mm)'` | `'Burr Size (mm)'` |
| `'Leistung (W)'` | `'Power (W)'` |
| `'Stufenlos'` | `'Stepless'` |
| `'Behälter'` | `'Hopper'` |
| `'Funktionsweise'` | `'Boiler Type'` |
| `'Brühgruppe'` | `'Group Head'` |
| `'Größe (mm)'` | `'Size (mm)'` |
| `'Nenndosis (g)'` | `'Rated Dose (g)'` |
| `'Durchmesser (mm)'` | `'Diameter (mm)'` |
| `'Notizen'` | `'Notes'` |
| `'Speichern'` | `'Save'` |
| `'Abbrechen'` | `'Cancel'` |
| `'Bearbeiten'` | `'Edit'` |
| `'Löschen'` | `'Delete'` |
| `'Favorit'` | `'Favorite'` |
| `'Standard für ▾'` | `'Default for ▾'` (keep the ▾) |
| `'Standard gesetzt'` | `'Default set'` |
| `'Laden...'` | `'Loading...'` |
| `'Noch keine Mühlen.'` | `'No grinders yet.'` |
| `'Noch keine Maschinen.'` | `'No machines yet.'` |
| `'Noch keine Siebe.'` | `'No baskets yet.'` |
| `'Noch keine Geräte.'` | `'No devices yet.'` |
| `'löschen?'` in confirm dialogs | `'delete?'` |
| `'Speichern...'` | `'Saving...'` |

- [ ] **Step 4: Update PhotoUpload.tsx**

```tsx
// Change these strings only:
// 'Datei zu groß (max 5 MB)'   →  'File too large (max 5 MB)'
// 'Upload fehlgeschlagen'       →  'Upload failed'
// 'Foto konnte nicht entfernt werden.'  →  'Could not remove photo.'
// aria-label="Foto entfernen"   →  aria-label="Remove photo"
```

- [ ] **Step 5: Run all tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CoffeeManager.tsx src/pages/Roasters.tsx src/pages/Equipment.tsx \
  src/components/PhotoUpload.tsx
git commit -m "feat: translate CoffeeManager, Roasters, Equipment, PhotoUpload"
```

---

### Task 10: Translate glossaryContent.ts

**Files:**
- Modify: `src/utils/glossaryContent.ts`

- [ ] **Step 1: Update GlossaryTerm interface and translate all 46 entries**

Replace the full file:

```ts
export interface GlossaryTerm {
  term: string
  definition: string
  category: 'espresso' | 'brew' | 'equipment' | 'milk'
}

const GLOSSARY_RAW: GlossaryTerm[] = [
  // Brew
  { term: 'Bloom', category: 'brew', definition: 'A short pre-wet with a small amount of water (approx. 2× the coffee dose) that lets CO₂ escape before brewing. Improves extraction in pour-over methods.' },
  { term: 'Body', category: 'espresso', definition: 'The mouthfeel of the espresso — how creamy, thick, and full it feels. Determined by oils and colloids in the extract.' },
  { term: 'Brew Ratio', category: 'espresso', definition: 'The ratio of coffee dose to extracted weight (yield). A typical espresso is 1:2 — e.g., 18 g coffee → 36 g yield.' },
  { term: 'Group Head', category: 'equipment', definition: 'The part of the espresso machine where the portafilter is locked in. Delivers water at constant pressure through the coffee puck.' },
  { term: 'Brew Temperature', category: 'espresso', definition: 'Temperature of the water as it passes through the coffee grounds. Typically 88–96°C for espresso. Too hot = over-extraction, too cold = under-extraction.' },
  { term: 'Brew Time', category: 'espresso', definition: 'Time from start to end of the espresso pull. Typically 25–35 seconds. Strongly influenced by grind size and tamp pressure.' },
  { term: 'Burr', category: 'equipment', definition: 'The grinding element in a grinder. Flat burrs (ring-shaped) or conical burrs grind coffee between two surfaces.' },
  { term: 'Channeling', category: 'espresso', definition: 'Water breaks through a channel in the coffee puck instead of flowing evenly. Leads to uneven extraction and sour or bitter results.' },
  { term: 'Crema', category: 'espresso', definition: 'The golden-brown foam layer on top of espresso. Formed by CO₂ bubbles dissolving in fats and emulsifiers. Indicates freshness and correct pressure.' },
  { term: 'Steam Wand', category: 'equipment', definition: 'The metal tube on an espresso machine for frothing milk. Injects steam that incorporates air and heats the milk.' },
  { term: 'Dose', category: 'espresso', definition: 'The measured amount of ground coffee in grams placed in the portafilter basket. Typically 16–20 g for espresso.' },
  { term: 'Pressure', category: 'espresso', definition: 'Water pressure during the espresso pull, measured in bar. Standard is 9 bar. Some machines allow pressure profiling.' },
  { term: 'Dual Boiler', category: 'equipment', definition: 'Machine type with two separate boilers — one for brew water, one for steam. Allows simultaneous brewing and steaming at optimal temperatures.' },
  { term: 'Single Boiler', category: 'equipment', definition: 'Simplest machine type with one boiler for everything. Cannot brew and steam simultaneously — you must wait for the temperature to switch.' },
  { term: 'Espresso', category: 'espresso', definition: 'Concentrated coffee beverage made by forcing hot water at ~9 bar through finely ground coffee. The base of many milk drinks.' },
  { term: 'Extraction', category: 'espresso', definition: 'The process by which flavors, oils, and soluble compounds pass from the coffee grounds into the water. The goal is a balanced extraction (18–22% EY).' },
  { term: 'Extraction Yield (EY)', category: 'espresso', definition: 'The percentage of soluble solids extracted from the coffee grounds. Ideal: 18–22%. Measured with a refractometer.' },
  { term: 'Filter Coffee', category: 'brew', definition: 'Brewing method where water passes through ground coffee and a filter. Produces a clear, lighter coffee without sediment.' },
  { term: 'Flat Burr', category: 'equipment', definition: 'Burr shape with two parallel ring-shaped discs. Grinds evenly and produces a uniform particle size. Typical in high-end grinders.' },
  { term: 'French Press', category: 'brew', definition: 'Brewing method where coarsely ground coffee steeps in hot water and is then separated by pressing a plunger.' },
  { term: 'Inverted (AeroPress)', category: 'brew', definition: 'Upside-down AeroPress method: device sits on the plunger, coffee steeps longer before filtering. Gives more control over steep time.' },
  { term: 'Conical Burr', category: 'equipment', definition: 'Burr shape with a conical inner and ring-shaped outer burr. Produces a bimodal grind — coarse and fine particles. Common in budget grinders.' },
  { term: 'Leveler', category: 'equipment', definition: 'A tool for evenly distributing and leveling the coffee grounds in the basket after dosing. Reduces channeling.' },
  { term: 'Latte Art', category: 'milk', definition: 'The technique of creating patterns (heart, rosetta, tulip) on milk drinks by pouring steamed milk in a controlled way.' },
  { term: 'Grind Setting', category: 'espresso', definition: 'The adjustment on the grinder that determines how fine or coarse the coffee is ground. Finer = slower shot, coarser = faster shot.' },
  { term: 'Microfoam', category: 'milk', definition: 'Fine-textured, velvety milk foam without visible bubbles. Created by correct stretching technique. Ideal for latte art and smooth milk drinks.' },
  { term: 'Moka Pot', category: 'brew', definition: 'A stovetop pot that uses steam pressure to push hot water through coffee grounds. Produces strong, espresso-like coffee without a pump.' },
  { term: 'Over-extraction', category: 'espresso', definition: 'Too many bitter compounds dissolved from the coffee. Result: bitter, astringent, burnt. Cause: too fine, too hot, too long.' },
  { term: 'Puck', category: 'espresso', definition: 'The compressed coffee grounds in the portafilter basket after tamping. A good puck is even, firm, and water-resistant.' },
  { term: 'Pour Over', category: 'brew', definition: 'Hand-brewed filter coffee (V60, Chemex) where water is poured manually in circular motions over the coffee grounds.' },
  { term: 'Preinfusion', category: 'espresso', definition: 'A short pre-wet of the coffee grounds at low pressure (2–4 bar) before the full pull. Evenly saturates the puck and reduces channeling.' },
  { term: 'Refractometer', category: 'equipment', definition: 'An optical device for measuring dissolved solids concentration in coffee (TDS). Enables accurate calculation of extraction yield.' },
  { term: 'RDT (Ross Droplet Technique)', category: 'equipment', definition: 'Method: add a drop of water to the beans before grinding. Reduces static charge and prevents coffee from clinging to the grinder.' },
  { term: 'Roast Level', category: 'espresso', definition: 'Scale of coffee roast from light (fruity, acidic) to dark (chocolatey, bitter). Affects grind setting and optimal brew temperature.' },
  { term: 'Basket', category: 'equipment', definition: 'The metal basket in the portafilter with holes that holds the coffee and distributes water evenly. Various sizes (14–22 g) and precision baskets (VST, IMS).' },
  { term: 'Portafilter', category: 'equipment', definition: 'The handle with metal basket locked into the group head. Holds the coffee grounds during the pull.' },
  { term: 'Stretching', category: 'milk', definition: 'First phase of steaming milk: hold the wand just below the surface, incorporate air until volume increases by ~50%.' },
  { term: 'Stepless Grinder', category: 'equipment', definition: 'A grinder without click-stop steps — grind setting can be adjusted infinitely. More precision than stepped grinders.' },
  { term: 'Tamping', category: 'espresso', definition: 'Pressing the coffee grounds evenly in the basket with a tamper (~15 kg pressure). Creates an even, dense surface for water flow.' },
  { term: 'TDS (Total Dissolved Solids)', category: 'espresso', definition: 'Total dissolved solids in the coffee as a percentage. Espresso: 8–12%, filter coffee: 1–1.5%. Measured with a refractometer.' },
  { term: 'Texturing', category: 'milk', definition: 'Second phase of steaming milk: submerge the wand deeper, swirl milk and heat to 60–65°C. Integrates foam into a silky texture.' },
  { term: 'Thermoblock', category: 'equipment', definition: 'Simple heating system where water is heated through a metal block instead of a boiler. Fast heat-up but less stable temperature.' },
  { term: 'Under-extraction', category: 'espresso', definition: 'Too few flavors dissolved from the coffee. Result: sour, watery, astringent. Cause: too coarse, too cold, too short.' },
  { term: 'V60', category: 'brew', definition: 'Pour-over filter by Hario with a 60° angle and spiral ribs. Water is poured in circular motions. Produces a clean, aromatic coffee.' },
  { term: 'WDT (Weiss Distribution Technique)', category: 'equipment', definition: 'Method: use a thin needle or dedicated tool to stir and distribute coffee grounds in the basket. Breaks up clumps and reduces channeling.' },
  { term: 'Yield', category: 'espresso', definition: 'The weight of the extracted espresso in the cup in grams. Together with the dose it gives the brew ratio (e.g., 18 g dose → 36 g yield = 1:2).' },
  { term: 'Heat Exchanger', category: 'equipment', definition: 'Machine type with one main steam boiler and a separate heat exchanger for brew water. Allows simultaneous brewing and steaming.' },
]

export const GLOSSARY: GlossaryTerm[] = GLOSSARY_RAW.sort((a, b) => a.term.localeCompare(b.term, 'en'))
```

- [ ] **Step 2: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass (guideContent.test.ts only checks IDs, not text).

- [ ] **Step 3: Commit**

```bash
git add src/utils/glossaryContent.ts
git commit -m "feat: translate glossaryContent to English"
```

---

### Task 11: Translate guideContent.ts

**Files:**
- Modify: `src/utils/guideContent.ts`

- [ ] **Step 1: Replace full guideContent.ts with English translation**

```ts
export interface QuickProblem {
  label: string
  targetId: string
}

export interface TroubleshootingItem {
  id: string
  problem: string
  cause: string
  solutions: string[]
}

export interface Step {
  title: string
  detail: string
}

export interface Guide {
  id: string
  title: string
  icon: string
  description: string
  quickProblems: QuickProblem[]
  steps: Step[]
  troubleshooting: TroubleshootingItem[]
}

export const GUIDES: Guide[] = [
  {
    id: 'espresso',
    title: 'Espresso',
    icon: '☕',
    description: 'Extraction · Troubleshooting',
    quickProblems: [
      { label: 'Too sour?',      targetId: 'zu-sauer' },
      { label: 'Too bitter?',    targetId: 'zu-bitter' },
      { label: 'Channeling?',    targetId: 'channeling' },
      { label: 'Too fast?',      targetId: 'zu-schnell' },
      { label: 'Too watery?',    targetId: 'zu-waessrig' },
      { label: 'No crema?',      targetId: 'kein-crema' },
    ],
    steps: [
      { title: 'Prepare grinder', detail: 'Run a purge, check grind setting against your last successful pull.' },
      { title: 'Dose', detail: 'Weigh ground coffee — typically 16–18 g depending on basket size.' },
      { title: 'Distribute & tamp', detail: 'Use WDT if available, level with a leveler, then tamp evenly (~15 kg pressure).' },
      { title: 'Lock in & start', detail: 'Start the shot immediately after locking in the portafilter to avoid scorching.' },
      { title: 'Watch brew time', detail: 'Target: 25–35 seconds for ~32–36 g yield (1:2 ratio).' },
      { title: 'Rate & log', detail: 'Record flavor, crema color, and flow in the tracker.' },
    ],
    troubleshooting: [
      {
        id: 'zu-sauer',
        problem: 'Espresso too sour / astringent',
        cause: 'Under-extraction — water flows too quickly through the grounds.',
        solutions: [
          'Grind finer (small steps)',
          'Increase brew temperature (90–96°C)',
          'Slightly increase dose',
          'Check brew ratio — more coffee, less yield',
        ],
      },
      {
        id: 'zu-bitter',
        problem: 'Espresso too bitter / burnt',
        cause: 'Over-extraction — water pulls too long through the grounds.',
        solutions: [
          'Grind coarser',
          'Lower brew temperature (88–92°C)',
          'Increase yield — less coffee relative to water',
          'Check brew time — over 35 s is often too long',
        ],
      },
      {
        id: 'channeling',
        problem: 'Channeling (uneven extraction)',
        cause: 'Water breaks through a channel in the puck and extracts unevenly.',
        solutions: [
          'Use WDT to break up clumps',
          'Use a leveler for an even surface',
          'Tamp with even pressure and straight alignment',
          'Check dose — too little coffee promotes channeling',
        ],
      },
      {
        id: 'zu-schnell',
        problem: 'Shot runs too fast (under 20 s)',
        cause: 'Grind too coarse, dose too low, or channeling.',
        solutions: [
          'Grind finer',
          'Increase dose',
          'Check for channeling',
          'Apply more tamp pressure',
        ],
      },
      {
        id: 'zu-waessrig',
        problem: 'Espresso watery / thin body',
        cause: 'Yield too high or extraction time too short.',
        solutions: [
          'Reduce yield (less water → stronger)',
          'Check brew ratio: target ~1:2 (dose:yield)',
          'Extend brew time by grinding finer',
        ],
      },
      {
        id: 'kein-crema',
        problem: 'No or very little crema',
        cause: 'Coffee too old, machine not up to temperature, or wrong grind size.',
        solutions: [
          'Use a fresher roast date (ideal 5–30 days after roast)',
          'Allow machine to pre-heat longer',
          'Grind finer',
          'Coffee with higher robusta content produces more crema',
        ],
      },
    ],
  },
  {
    id: 'french-press',
    title: 'French Press',
    icon: '🫖',
    description: 'Guide · Troubleshooting',
    quickProblems: [
      { label: 'Too cloudy?',  targetId: 'zu-trueb' },
      { label: 'Too bitter?',  targetId: 'fp-zu-bitter' },
      { label: 'Too weak?',    targetId: 'zu-schwach' },
      { label: 'Grounds in cup?', targetId: 'satz-im-glas' },
    ],
    steps: [
      { title: 'Heat water', detail: 'Aim for 90–95°C — wait a moment after boiling.' },
      { title: 'Grind coffee', detail: 'Coarse grind (like coarse sea salt), approx. 60 g per litre of water.' },
      { title: 'Add coffee & bloom', detail: 'Add coffee, pour a little water, wait 30 s for bloom.' },
      { title: 'Pour & steep', detail: 'Add remaining water, place lid on top (plunger up), steep for 4 minutes.' },
      { title: 'Press & pour', detail: 'Press slowly and evenly, pour immediately to prevent over-extraction.' },
    ],
    troubleshooting: [
      {
        id: 'zu-trueb',
        problem: 'Coffee too cloudy / lots of sediment',
        cause: 'Grind too fine or plunger pressed too slowly.',
        solutions: [
          'Grind coarser',
          'Press the plunger evenly and steadily',
          'Let coffee settle 1 min after pressing before pouring',
          'Use a higher quality mesh filter',
        ],
      },
      {
        id: 'fp-zu-bitter',
        problem: 'Coffee too bitter',
        cause: 'Over-extraction from too long a steep or too fine a grind.',
        solutions: [
          'Reduce steep time to 3–4 minutes',
          'Grind coarser',
          'Lower water temperature (88–93°C)',
          'Pour immediately after pressing',
        ],
      },
      {
        id: 'zu-schwach',
        problem: 'Coffee too weak / watery',
        cause: 'Too little coffee, too short a steep, or too coarse a grind.',
        solutions: [
          'Increase coffee amount (60–70 g/L)',
          'Extend steep time to 4–5 minutes',
          'Grind slightly finer',
        ],
      },
      {
        id: 'satz-im-glas',
        problem: 'Coffee grounds in the cup',
        cause: 'Plunger not pressed all the way down or mesh damaged.',
        solutions: [
          'Press plunger all the way to the bottom',
          'Inspect mesh for damage',
          'Grind slightly coarser',
          'Pour through a paper filter',
        ],
      },
    ],
  },
  {
    id: 'v60',
    title: 'V60',
    icon: '🌊',
    description: 'Pour Over · Guide',
    quickProblems: [
      { label: 'Too slow?',   targetId: 'v60-zu-langsam' },
      { label: 'Too fast?',   targetId: 'v60-zu-schnell' },
      { label: 'Too sour?',   targetId: 'v60-zu-sauer' },
      { label: 'Too bitter?', targetId: 'v60-zu-bitter' },
    ],
    steps: [
      { title: 'Rinse filter', detail: 'Place paper filter in V60, rinse with hot water, discard rinse water.' },
      { title: 'Grind coffee', detail: 'Medium-fine grind (like fine sea salt), 15 g coffee per 250 ml water.' },
      { title: 'Bloom', detail: 'Pour 30–45 ml water, wait 30–45 s for CO₂ to escape.' },
      { title: 'Main pour', detail: 'Pour in circular motions, 3–4 pours of ~60 ml each, total brew time 2:30–3:30 min.' },
      { title: 'Drain', detail: 'Let coffee drain completely — the bed should look flat and even.' },
    ],
    troubleshooting: [
      {
        id: 'v60-zu-langsam',
        problem: 'Coffee drains too slowly (over 4 min)',
        cause: 'Grind too fine, filter blocked, or too much coffee.',
        solutions: [
          'Grind coarser',
          'Seat filter correctly without air gaps',
          'Slightly reduce coffee amount',
          'Pour in spirals for an even bed',
        ],
      },
      {
        id: 'v60-zu-schnell',
        problem: 'Coffee drains too quickly (under 2 min)',
        cause: 'Grind too coarse or too little coffee.',
        solutions: [
          'Grind finer',
          'Slightly increase coffee amount',
          'Slow down your pour rate',
        ],
      },
      {
        id: 'v60-zu-sauer',
        problem: 'Coffee too sour / flat',
        cause: 'Under-extraction — brew time too short or water too cold.',
        solutions: [
          'Increase water temperature (92–96°C)',
          'Grind finer for a longer brew time',
          'Extend bloom time',
        ],
      },
      {
        id: 'v60-zu-bitter',
        problem: 'Coffee too bitter',
        cause: 'Over-extraction — brew time too long or water too hot.',
        solutions: [
          'Grind coarser',
          'Lower water temperature (88–93°C)',
          'Keep total brew time under 3:30 min',
        ],
      },
    ],
  },
  {
    id: 'aeropress',
    title: 'AeroPress',
    icon: '🧪',
    description: 'Guide · Variations',
    quickProblems: [
      { label: 'Too bitter?',       targetId: 'ap-zu-bitter' },
      { label: 'Plunger too hard?', targetId: 'kolben-schwer' },
      { label: 'Too watery?',       targetId: 'ap-zu-waessrig' },
    ],
    steps: [
      { title: 'Rinse paper filter', detail: 'Place filter in cap, rinse with hot water.' },
      { title: 'Dose coffee', detail: '15–18 g medium-fine ground — slightly coarser than espresso.' },
      { title: 'Add water', detail: 'Pour 200–220 ml at 80–90°C, stir for 10–20 s.' },
      { title: 'Steep', detail: '1:00–1:30 min, then attach cap.' },
      { title: 'Press', detail: 'Press slowly and evenly over 20–30 s — stop at the first hiss.' },
    ],
    troubleshooting: [
      {
        id: 'ap-zu-bitter',
        problem: 'Coffee too bitter',
        cause: 'Over-extraction from too long a steep, water too hot, or grind too fine.',
        solutions: [
          'Lower water temperature (80–85°C)',
          'Reduce steep time to 1 minute',
          'Grind slightly coarser',
        ],
      },
      {
        id: 'kolben-schwer',
        problem: 'Plunger is hard to press',
        cause: 'Grind too fine or too much coffee.',
        solutions: [
          'Grind coarser',
          'Slightly reduce coffee amount',
          'Press more evenly and slowly',
        ],
      },
      {
        id: 'ap-zu-waessrig',
        problem: 'Coffee too watery / weak',
        cause: 'Too little coffee, too short a steep, or grind too coarse.',
        solutions: [
          'Increase coffee amount (up to 18 g)',
          'Extend steep time (up to 2 min)',
          'Grind slightly finer',
        ],
      },
    ],
  },
  {
    id: 'moka-pot',
    title: 'Moka Pot',
    icon: '🔥',
    description: 'Stovetop · Guide',
    quickProblems: [
      { label: 'Sputtering?',  targetId: 'spritzt' },
      { label: 'Burnt taste?', targetId: 'verbrannt' },
      { label: 'Too weak?',    targetId: 'mp-zu-schwach' },
      { label: 'Stalling?',    targetId: 'stockt' },
    ],
    steps: [
      { title: 'Fill with water', detail: 'Fill with cold water up to the safety valve — not above it.' },
      { title: 'Fill basket', detail: 'Add coffee loosely (do not tamp!), level off the top.' },
      { title: 'Assemble & heat', detail: 'Screw together firmly, place on medium heat, leave lid open.' },
      { title: 'Watch the flow', detail: 'Once coffee flows golden-brown and steady: reduce heat to low.' },
      { title: 'Remove from heat', detail: 'Remove as soon as it starts gurgling — briefly run the base under cold water.' },
    ],
    troubleshooting: [
      {
        id: 'spritzt',
        problem: 'Coffee sputters / overflows',
        cause: 'Heat too high or water was already too hot when filling.',
        solutions: [
          'Reduce heat to medium-low',
          'Fill with cold water (not pre-heated)',
          'Never leave unattended',
        ],
      },
      {
        id: 'verbrannt',
        problem: 'Coffee tastes burnt / bitter',
        cause: 'Left on heat too long or heat too high.',
        solutions: [
          'Remove immediately when gurgling starts',
          'Use lower heat from the start',
          'Keep lid open to watch the flow',
        ],
      },
      {
        id: 'mp-zu-schwach',
        problem: 'Coffee too weak / watery',
        cause: 'Too little coffee or grind too coarse.',
        solutions: [
          'Fill basket completely (without tamping)',
          'Grind slightly finer',
          'Use a moka-specific grind (finer than filter, coarser than espresso)',
        ],
      },
      {
        id: 'stockt',
        problem: 'Coffee stops flowing / stalls',
        cause: 'Valve blocked, grind too fine, or heat too low.',
        solutions: [
          'Check safety valve for blockage and clean',
          'Grind coarser',
          'Increase heat',
          'Check gasket for wear',
        ],
      },
    ],
  },
  {
    id: 'milch',
    title: 'Milk',
    icon: '🥛',
    description: 'Steaming · Latte Art',
    quickProblems: [
      { label: 'Too much foam?',   targetId: 'zu-viel-schaum' },
      { label: 'No microfoam?',    targetId: 'kein-mikroschaum' },
      { label: 'Milk scorching?',  targetId: 'verbrennt-milch' },
      { label: 'Separating?',      targetId: 'trennt-sich' },
    ],
    steps: [
      { title: 'Prepare milk', detail: 'Cold whole milk (3.5% fat), fill jug to 1/3–1/2.' },
      { title: 'Position steam wand', detail: 'Tip just below the surface (5 mm), angled slightly toward center.' },
      { title: 'Incorporate air (stretching)', detail: 'Open steam: hold wand at the surface until a hissing sound — volume increases by ~50%.' },
      { title: 'Heat milk (texturing)', detail: 'Submerge wand deeper, swirl milk until warm to the touch on the outside (~65°C).' },
    ],
    troubleshooting: [
      {
        id: 'zu-viel-schaum',
        problem: 'Too much / coarse foam (large bubbles)',
        cause: 'Too much air incorporated or wand held too high.',
        solutions: [
          'Shorten the stretching phase',
          'Submerge the tip only just below the surface',
          'Tap jug on the counter and swirl to smooth out foam',
        ],
      },
      {
        id: 'kein-mikroschaum',
        problem: 'No microfoam / bubbles stay coarse',
        cause: 'Wand not positioned correctly or steam pressure too low.',
        solutions: [
          'Lift tip lightly toward the surface until hissing is audible',
          'Pre-heat machine longer for full steam pressure',
          'Use cold milk — frothing warm milk takes longer',
        ],
      },
      {
        id: 'verbrennt-milch',
        problem: 'Milk scorches / smells burnt',
        cause: 'Milk heated above 70°C.',
        solutions: [
          'Hold hand on jug — stop immediately if it hurts',
          'Use a thermometer — target 60–65°C',
          'End the stretching phase earlier',
        ],
      },
      {
        id: 'trennt-sich',
        problem: 'Milk and foam separate',
        cause: 'Milk frothed too hot or wrong milk type.',
        solutions: [
          'Keep temperature below 65°C',
          'Use whole milk with higher fat content',
          'Use milk immediately after steaming',
        ],
      },
    ],
  },
]
```

- [ ] **Step 2: Run tests**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/utils/guideContent.ts
git commit -m "feat: translate guideContent to English"
```

---

### Task 12: Update CLAUDE.md and final test run

**Files:**
- Modify: `/Users/lennartfriedel/Documents/espresso-tracker/CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

In the `## Implementierter Stand (Mai 2026)` section, update the English translation entry:
- Change `- [ ] **App auf Englisch** — komplette UI-Übersetzung` to `- [x] **App in English** — complete UI translation`

In `## Weitere geplante Features`, remove the English translation line if it still appears (it was already removed at planning stage, but double-check).

Update the nav/routes section to reflect new English routes if documented.

- [ ] **Step 2: Full test suite run**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: TypeScript build check**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md — English translation complete"
```
