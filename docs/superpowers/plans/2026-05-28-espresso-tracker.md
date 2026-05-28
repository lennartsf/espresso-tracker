# Espresso Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform PWA to log and analyse espresso shots, synced via Supabase without auth.

**Architecture:** React + Vite PWA on Vercel talks directly to Supabase (PostgreSQL) using the anon key. No backend server. Two tables: `coffees` and `shots`. Auth + RLS added in v2 via a migration script.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Query 5, Recharts 2, React Router 6, @supabase/supabase-js 2, Vitest, @testing-library/react

---

## File Map

```
espresso-tracker/
├── .env                              # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts                    # also Vitest config
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── public/
│   └── manifest.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                       # QueryClient, BrowserRouter, Routes
│   ├── index.css                     # Tailwind directives
│   ├── lib/
│   │   └── supabase.ts               # Supabase client singleton
│   ├── types/
│   │   └── index.ts                  # Coffee, Shot, NewCoffee, NewShot
│   ├── hooks/
│   │   ├── useCoffees.ts             # useCoffees, useCreateCoffee, useDeleteCoffee
│   │   └── useShots.ts               # useShots(coffeeId?), useCreateShot
│   ├── utils/
│   │   └── recipeCalc.ts             # calcBestRecipe(shots) → RecipeStats | null
│   ├── components/
│   │   ├── Layout.tsx                # Bottom nav + <Outlet />
│   │   ├── RatingInput.tsx           # 10 number buttons, orange highlight
│   │   ├── BrewTimer.tsx             # Start/Stop timer, calls onTime(s)
│   │   ├── ShotCard.tsx              # Shot list item with colour-coded rating
│   │   └── RecipeCard.tsx            # Best-recipe summary card
│   ├── pages/
│   │   ├── Dashboard.tsx             # Stats + last 5 shots + CTA
│   │   ├── NewShot.tsx               # Full shot form
│   │   ├── ShotHistory.tsx           # Full list + coffee filter
│   │   ├── CoffeeManager.tsx         # Add/delete coffees
│   │   └── Analysis.tsx              # Scatter plot + RecipeCard
│   └── __tests__/
│       ├── setup.ts
│       ├── RatingInput.test.tsx
│       ├── BrewTimer.test.tsx
│       ├── recipeCalc.test.ts
│       └── App.test.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/__tests__/setup.ts`, `src/__tests__/App.test.tsx`

- [ ] **Step 1: Scaffold Vite project**

Run in `/Users/lennartfriedel/Documents/`:
```bash
npm create vite@latest espresso-tracker -- --template react-ts
cd espresso-tracker
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @tanstack/react-query react-router-dom recharts
npm install -D tailwindcss postcss autoprefixer @types/node vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Replace `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

Replace `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Configure Vitest in vite.config.ts**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

- [ ] **Step 5: Create test setup file**

`src/__tests__/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Write smoke test**

`src/__tests__/App.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders without crashing', () => {
  render(<App />)
  expect(document.body).toBeTruthy()
})
```

- [ ] **Step 7: Replace src/App.tsx with minimal stub**

```typescript
export default function App() {
  return <div>Espresso Tracker</div>
}
```

- [ ] **Step 8: Run smoke test**

```bash
npm test -- --run
```
Expected: PASS (1 test)

- [ ] **Step 9: Create .gitignore and .env.example**

`.gitignore`:
```
node_modules
dist
.env
.env.local
```

`.env.example`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold React+Vite+Tailwind+Vitest project"
```

---

## Task 2: Supabase Project + Tables

**Files:** None in repo — steps done in Supabase dashboard + `.env`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project → name it `espresso-tracker` → choose a region close to you (e.g. Frankfurt) → save the database password.

- [ ] **Step 2: Create tables**

In Supabase Dashboard → SQL Editor → New query → paste and run:

```sql
create table coffees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roaster text,
  origin text,
  roast_date date,
  notes text,
  created_at timestamptz default now()
);

create table shots (
  id uuid primary key default gen_random_uuid(),
  coffee_id uuid references coffees(id) on delete cascade,
  grind_setting numeric not null,
  dose_g numeric,
  yield_g numeric,
  brew_time_s integer,
  temp_c numeric,
  rating integer check (rating between 1 and 10),
  tasting_notes text,
  pulled_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Allow public read/write (no auth in v1)
alter table coffees enable row level security;
alter table shots enable row level security;

create policy "Public access" on coffees for all using (true) with check (true);
create policy "Public access" on shots for all using (true) with check (true);
```

- [ ] **Step 3: Get credentials**

In Supabase Dashboard → Settings → API:
- Copy "Project URL" 
- Copy "anon public" key

- [ ] **Step 4: Create .env**

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Task 3: Types + Supabase Client

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create TypeScript types**

`src/types/index.ts`:
```typescript
export interface Coffee {
  id: string
  name: string
  roaster: string | null
  origin: string | null
  roast_date: string | null
  notes: string | null
  created_at: string
}

export interface Shot {
  id: string
  coffee_id: string
  grind_setting: number
  dose_g: number | null
  yield_g: number | null
  brew_time_s: number | null
  temp_c: number | null
  rating: number
  tasting_notes: string | null
  pulled_at: string
  created_at: string
}

export type NewCoffee = Omit<Coffee, 'id' | 'created_at'>
export type NewShot = Omit<Shot, 'id' | 'created_at'>
```

- [ ] **Step 2: Create Supabase client**

`src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(url, key)
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/lib/supabase.ts .env.example
git commit -m "feat: add types and Supabase client"
```

---

## Task 4: App Shell + Routing + Layout

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/Layout.tsx`
- Create stub pages: `src/pages/Dashboard.tsx`, `src/pages/NewShot.tsx`, `src/pages/ShotHistory.tsx`, `src/pages/CoffeeManager.tsx`, `src/pages/Analysis.tsx`

- [ ] **Step 1: Update main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 2: Create Layout with bottom nav**

`src/components/Layout.tsx`:
```tsx
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
```

- [ ] **Step 3: Create stub pages**

Each file returns a minimal placeholder. Example pattern — repeat for all 5 pages:

`src/pages/Dashboard.tsx`:
```tsx
export function Dashboard() {
  return <div className="text-slate-800">Dashboard</div>
}
```

`src/pages/NewShot.tsx`:
```tsx
export function NewShot() {
  return <div className="text-slate-800">Neuer Shot</div>
}
```

`src/pages/ShotHistory.tsx`:
```tsx
export function ShotHistory() {
  return <div className="text-slate-800">Shot-Liste</div>
}
```

`src/pages/CoffeeManager.tsx`:
```tsx
export function CoffeeManager() {
  return <div className="text-slate-800">Kaffees</div>
}
```

`src/pages/Analysis.tsx`:
```tsx
export function Analysis() {
  return <div className="text-slate-800">Analyse</div>
}
```

- [ ] **Step 4: Wire up App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { NewShot } from './pages/NewShot'
import { ShotHistory } from './pages/ShotHistory'
import { CoffeeManager } from './pages/CoffeeManager'
import { Analysis } from './pages/Analysis'

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
            <Route path="analyse" element={<Analysis />} />
            <Route path="kaffee" element={<CoffeeManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Update smoke test to match new App**

`src/__tests__/App.test.tsx`:
```tsx
import { render } from '@testing-library/react'
import App from '../App'

test('renders without crashing', () => {
  render(<App />)
  expect(document.body).toBeTruthy()
})
```

- [ ] **Step 6: Run tests**

```bash
npm test -- --run
```
Expected: PASS

- [ ] **Step 7: Run dev server and verify nav**

```bash
npm run dev
```
Open http://localhost:5173. Verify all 4 bottom-nav tabs load their stub pages.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: app shell with React Router and bottom navigation"
```

---

## Task 5: RatingInput Component (TDD)

**Files:**
- Create: `src/components/RatingInput.tsx`
- Create: `src/__tests__/RatingInput.test.tsx`

- [ ] **Step 1: Write failing tests**

`src/__tests__/RatingInput.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingInput } from '../components/RatingInput'

describe('RatingInput', () => {
  test('renders 10 buttons labelled 1–10', () => {
    render(<RatingInput value={null} onChange={() => {}} />)
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument()
    }
  })

  test('calls onChange with the clicked number', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RatingInput value={null} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '7' }))
    expect(onChange).toHaveBeenCalledWith(7)
  })

  test('highlights the selected button with orange class', () => {
    render(<RatingInput value={5} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '5' })).toHaveClass('bg-orange-500')
    expect(screen.getByRole('button', { name: '3' })).not.toHaveClass('bg-orange-500')
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
npm test -- --run RatingInput
```
Expected: FAIL — `RatingInput` not found

- [ ] **Step 3: Implement RatingInput**

`src/components/RatingInput.tsx`:
```tsx
interface Props {
  value: number | null
  onChange: (value: number) => void
}

export function RatingInput({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
            value === n
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npm test -- --run RatingInput
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/RatingInput.tsx src/__tests__/RatingInput.test.tsx
git commit -m "feat: RatingInput component — 1-10 number scale"
```

---

## Task 6: BrewTimer Component (TDD)

**Files:**
- Create: `src/components/BrewTimer.tsx`
- Create: `src/__tests__/BrewTimer.test.tsx`

- [ ] **Step 1: Write failing tests**

`src/__tests__/BrewTimer.test.tsx`:
```tsx
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrewTimer } from '../components/BrewTimer'

describe('BrewTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('shows Start button initially', () => {
    render(<BrewTimer onTime={() => {}} />)
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  test('switches to Stop button after clicking Start', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<BrewTimer onTime={() => {}} />)
    await user.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  test('calls onTime with elapsed seconds when stopped', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onTime = vi.fn()
    render(<BrewTimer onTime={onTime} />)
    await user.click(screen.getByRole('button', { name: /start/i }))
    act(() => { vi.advanceTimersByTime(5000) })
    await user.click(screen.getByRole('button', { name: /stop/i }))
    expect(onTime).toHaveBeenCalledWith(expect.any(Number))
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
npm test -- --run BrewTimer
```
Expected: FAIL

- [ ] **Step 3: Implement BrewTimer**

`src/components/BrewTimer.tsx`:
```tsx
import { useState, useRef } from 'react'

interface Props {
  onTime: (seconds: number) => void
}

export function BrewTimer({ onTime }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    startRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000))
    }, 100)
    setRunning(true)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    onTime(elapsed)
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
    startRef.current = null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-mono font-semibold text-slate-700 w-10">{elapsed}s</span>
      {!running ? (
        <button type="button" onClick={start} className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-sm hover:bg-slate-200">
          ▶ Start
        </button>
      ) : (
        <button type="button" onClick={stop} className="px-3 py-1 rounded bg-orange-500 text-white text-sm">
          ■ Stop
        </button>
      )}
      {elapsed > 0 && !running && (
        <button type="button" onClick={reset} className="px-2 py-1 rounded bg-slate-100 text-slate-400 text-sm">
          ↺
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npm test -- --run BrewTimer
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/BrewTimer.tsx src/__tests__/BrewTimer.test.tsx
git commit -m "feat: BrewTimer component with start/stop"
```

---

## Task 7: Recipe Calculation Utility (TDD)

**Files:**
- Create: `src/utils/recipeCalc.ts`
- Create: `src/__tests__/recipeCalc.test.ts`

- [ ] **Step 1: Write failing tests**

`src/__tests__/recipeCalc.test.ts`:
```typescript
import { calcBestRecipe } from '../utils/recipeCalc'
import type { Shot } from '../types'

const makeShot = (overrides: Partial<Shot>): Shot => ({
  id: '1',
  coffee_id: 'c1',
  grind_setting: 12,
  dose_g: 18,
  yield_g: 36,
  brew_time_s: 28,
  temp_c: 93,
  rating: 8,
  tasting_notes: null,
  pulled_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
})

describe('calcBestRecipe', () => {
  test('returns null when no shots have rating >= 8', () => {
    const shots = [makeShot({ rating: 5 }), makeShot({ rating: 7 })]
    expect(calcBestRecipe(shots)).toBeNull()
  })

  test('returns null for empty array', () => {
    expect(calcBestRecipe([])).toBeNull()
  })

  test('returns grind range from top-rated shots', () => {
    const shots = [
      makeShot({ rating: 9, grind_setting: 11 }),
      makeShot({ rating: 8, grind_setting: 13 }),
      makeShot({ rating: 5, grind_setting: 8 }),
    ]
    const result = calcBestRecipe(shots)!
    expect(result.grindMin).toBe(11)
    expect(result.grindMax).toBe(13)
  })

  test('includes only shots with rating >= 8 in shotCount', () => {
    const shots = [
      makeShot({ rating: 9 }),
      makeShot({ rating: 8 }),
      makeShot({ rating: 6 }),
    ]
    expect(calcBestRecipe(shots)!.shotCount).toBe(2)
  })

  test('averages dose and yield from top shots', () => {
    const shots = [
      makeShot({ rating: 9, dose_g: 18, yield_g: 36 }),
      makeShot({ rating: 8, dose_g: 18, yield_g: 38 }),
    ]
    const result = calcBestRecipe(shots)!
    expect(result.avgDose).toBe(18)
    expect(result.avgYield).toBe(37)
  })

  test('handles null optional fields gracefully', () => {
    const shots = [makeShot({ rating: 9, dose_g: null, yield_g: null, brew_time_s: null, temp_c: null })]
    const result = calcBestRecipe(shots)!
    expect(result.avgDose).toBeNull()
    expect(result.avgYield).toBeNull()
    expect(result.brewTimeMin).toBeNull()
    expect(result.avgTemp).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — verify FAIL**

```bash
npm test -- --run recipeCalc
```
Expected: FAIL

- [ ] **Step 3: Implement calcBestRecipe**

`src/utils/recipeCalc.ts`:
```typescript
import type { Shot } from '../types'

export interface RecipeStats {
  grindMin: number
  grindMax: number
  avgDose: number | null
  avgYield: number | null
  brewTimeMin: number | null
  brewTimeMax: number | null
  avgTemp: number | null
  avgRating: number
  shotCount: number
}

export function calcBestRecipe(shots: Shot[]): RecipeStats | null {
  const top = shots.filter(s => s.rating >= 8)
  if (top.length === 0) return null

  const avg = (arr: number[]): number | null =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  const grinds = top.map(s => s.grind_setting).sort((a, b) => a - b)
  const times = top.map(s => s.brew_time_s).filter((t): t is number => t !== null).sort((a, b) => a - b)
  const doses = top.map(s => s.dose_g).filter((d): d is number => d !== null)
  const yields = top.map(s => s.yield_g).filter((y): y is number => y !== null)
  const temps = top.map(s => s.temp_c).filter((t): t is number => t !== null)

  return {
    grindMin: grinds[0],
    grindMax: grinds[grinds.length - 1],
    avgDose: avg(doses),
    avgYield: avg(yields),
    brewTimeMin: times.length > 0 ? times[0] : null,
    brewTimeMax: times.length > 0 ? times[times.length - 1] : null,
    avgTemp: avg(temps),
    avgRating: avg(top.map(s => s.rating))!,
    shotCount: top.length,
  }
}
```

- [ ] **Step 4: Run tests — verify PASS**

```bash
npm test -- --run recipeCalc
```
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/recipeCalc.ts src/__tests__/recipeCalc.test.ts
git commit -m "feat: calcBestRecipe utility — TDD"
```

---

## Task 8: Data Hooks (Coffees + Shots)

**Files:**
- Create: `src/hooks/useCoffees.ts`
- Create: `src/hooks/useShots.ts`

- [ ] **Step 1: Create useCoffees**

`src/hooks/useCoffees.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Coffee, NewCoffee } from '../types'

export function useCoffees() {
  return useQuery({
    queryKey: ['coffees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Coffee[]
    },
  })
}

export function useCreateCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (coffee: NewCoffee) => {
      const { data, error } = await supabase
        .from('coffees')
        .insert(coffee)
        .select()
        .single()
      if (error) throw error
      return data as Coffee
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffees'] }),
  })
}

export function useDeleteCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coffees').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coffees'] })
      qc.invalidateQueries({ queryKey: ['shots'] })
    },
  })
}
```

- [ ] **Step 2: Create useShots**

`src/hooks/useShots.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Shot, NewShot } from '../types'

export type ShotWithCoffee = Shot & { coffees: { name: string } | null }

export function useShots(coffeeId?: string) {
  return useQuery({
    queryKey: ['shots', coffeeId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('shots')
        .select('*, coffees(name)')
        .order('pulled_at', { ascending: false })
      if (coffeeId) query = query.eq('coffee_id', coffeeId)
      const { data, error } = await query
      if (error) throw error
      return data as ShotWithCoffee[]
    },
  })
}

export function useCreateShot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (shot: NewShot) => {
      const { data, error } = await supabase
        .from('shots')
        .insert(shot)
        .select()
        .single()
      if (error) throw error
      return data as Shot
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shots'] }),
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: Supabase data hooks for coffees and shots"
```

---

## Task 9: ShotCard + RecipeCard Components

**Files:**
- Create: `src/components/ShotCard.tsx`
- Create: `src/components/RecipeCard.tsx`

- [ ] **Step 1: Create ShotCard**

`src/components/ShotCard.tsx`:
```tsx
import type { ShotWithCoffee } from '../hooks/useShots'

interface Props {
  shot: ShotWithCoffee
}

function ratingStyle(r: number) {
  if (r >= 8) return 'bg-green-100 text-green-700'
  if (r >= 5) return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-500'
}

export function ShotCard({ shot }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
      <div>
        <p className="font-medium text-slate-800 text-sm">{shot.coffees?.name ?? '—'}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Mahlgrad {shot.grind_setting}
          {shot.brew_time_s ? ` · ${shot.brew_time_s}s` : ''}
        </p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ${ratingStyle(shot.rating)}`}>
        {shot.rating}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create RecipeCard**

`src/components/RecipeCard.tsx`:
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
          Bestes Rezept
        </span>
        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
          Ø {stats.avgRating.toFixed(1)} · {stats.shotCount} Shots
        </span>
      </div>
      <div className="grid gap-2">
        <Row label="Mahlgrad" value={`${stats.grindMin}–${stats.grindMax}`} />
        {stats.avgDose !== null && stats.avgYield !== null && (
          <Row label="Ratio" value={`${stats.avgDose.toFixed(0)}g → ${stats.avgYield.toFixed(0)}g`} />
        )}
        {stats.brewTimeMin !== null && stats.brewTimeMax !== null && (
          <Row label="Brühzeit" value={`${stats.brewTimeMin}–${stats.brewTimeMax}s`} />
        )}
        {stats.avgTemp !== null && (
          <Row label="Temperatur" value={`${stats.avgTemp.toFixed(0)}°C`} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ShotCard.tsx src/components/RecipeCard.tsx
git commit -m "feat: ShotCard and RecipeCard display components"
```

---

## Task 10: CoffeeManager Page

**Files:**
- Modify: `src/pages/CoffeeManager.tsx`

- [ ] **Step 1: Implement CoffeeManager**

`src/pages/CoffeeManager.tsx`:
```tsx
import { useState } from 'react'
import { useCoffees, useCreateCoffee, useDeleteCoffee } from '../hooks/useCoffees'

export function CoffeeManager() {
  const { data: coffees = [], isLoading } = useCoffees()
  const createCoffee = useCreateCoffee()
  const deleteCoffee = useDeleteCoffee()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [roaster, setRoaster] = useState('')
  const [origin, setOrigin] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createCoffee.mutateAsync({
      name: name.trim(),
      roaster: roaster.trim() || null,
      origin: origin.trim() || null,
      roast_date: null,
      notes: null,
    })
    setName(''); setRoaster(''); setOrigin(''); setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">☕ Kaffees</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          {showForm ? 'Abbrechen' : '+ Neu'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-lg p-4 mb-4 grid gap-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name *"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={roaster}
              onChange={e => setRoaster(e.target.value)}
              placeholder="Rösterei"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Herkunft"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={createCoffee.isPending}
            className="bg-orange-500 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {createCoffee.isPending ? 'Speichern...' : 'Speichern'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid gap-2">
        {coffees.map(c => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-800 text-sm">{c.name}</p>
              {(c.roaster || c.origin) && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {[c.roaster, c.origin].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={() => deleteCoffee.mutate(c.id)}
              className="text-slate-300 hover:text-red-400 text-xl px-1 leading-none"
              aria-label={`${c.name} löschen`}
            >
              ×
            </button>
          </div>
        ))}
        {!isLoading && coffees.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">
            Noch keine Kaffees. Füge deinen ersten hinzu!
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test manually**

Run `npm run dev`, navigate to /kaffee, add a coffee, verify it appears in Supabase Table Editor.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CoffeeManager.tsx
git commit -m "feat: CoffeeManager page — add and delete coffees"
```

---

## Task 11: NewShot Page

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Step 1: Implement NewShot**

`src/pages/NewShot.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoffees, useCreateCoffee } from '../hooks/useCoffees'
import { useCreateShot } from '../hooks/useShots'
import { RatingInput } from '../components/RatingInput'
import { BrewTimer } from '../components/BrewTimer'

export function NewShot() {
  const navigate = useNavigate()
  const { data: coffees = [] } = useCoffees()
  const createShot = useCreateShot()
  const createCoffee = useCreateCoffee()

  const [coffeeId, setCoffeeId] = useState('')
  const [showNewCoffee, setShowNewCoffee] = useState(false)
  const [newCoffeeName, setNewCoffeeName] = useState('')
  const [grindSetting, setGrindSetting] = useState('')
  const [doseG, setDoseG] = useState('')
  const [yieldG, setYieldG] = useState('')
  const [brewTimeS, setBrewTimeS] = useState('')
  const [tempC, setTempC] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [tastingNotes, setTastingNotes] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!coffeeId && !newCoffeeName.trim()) {
      setError('Bitte einen Kaffee auswählen oder eingeben.')
      return
    }
    if (!grindSetting) {
      setError('Mahlgrad ist erforderlich.')
      return
    }
    if (!rating) {
      setError('Bitte den Shot bewerten.')
      return
    }

    let resolvedCoffeeId = coffeeId
    if (!coffeeId && newCoffeeName.trim()) {
      const coffee = await createCoffee.mutateAsync({
        name: newCoffeeName.trim(),
        roaster: null,
        origin: null,
        roast_date: null,
        notes: null,
      })
      resolvedCoffeeId = coffee.id
    }

    await createShot.mutateAsync({
      coffee_id: resolvedCoffeeId,
      grind_setting: parseFloat(grindSetting),
      dose_g: doseG ? parseFloat(doseG) : null,
      yield_g: yieldG ? parseFloat(yieldG) : null,
      brew_time_s: brewTimeS ? parseInt(brewTimeS, 10) : null,
      temp_c: tempC ? parseFloat(tempC) : null,
      rating,
      tasting_notes: tastingNotes.trim() || null,
      pulled_at: new Date().toISOString(),
    })

    navigate('/')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Neuer Shot</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Coffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
          {!showNewCoffee ? (
            <div className="flex gap-2">
              <select
                value={coffeeId}
                onChange={e => setCoffeeId(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
              >
                <option value="">Kaffee wählen...</option>
                {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button
                type="button"
                onClick={() => { setShowNewCoffee(true); setCoffeeId('') }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-white hover:bg-slate-50"
              >
                + Neu
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newCoffeeName}
                onChange={e => setNewCoffeeName(e.target.value)}
                placeholder="Kaffee-Name"
                className="flex-1 border border-orange-400 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewCoffee(false)}
                className="px-3 py-2 text-sm text-slate-400 hover:text-slate-600"
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>

        {/* Grind + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad *</label>
            <input
              type="number"
              step="0.5"
              value={grindSetting}
              onChange={e => setGrindSetting(e.target.value)}
              placeholder="12"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input
              type="number"
              value={tempC}
              onChange={e => setTempC(e.target.value)}
              placeholder="93"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Dose + Yield */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Einwaage (g)</label>
            <input
              type="number"
              step="0.1"
              value={doseG}
              onChange={e => setDoseG(e.target.value)}
              placeholder="18"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ausbeute (g)</label>
            <input
              type="number"
              step="0.1"
              value={yieldG}
              onChange={e => setYieldG(e.target.value)}
              placeholder="36"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Brew time */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit</label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={brewTimeS}
                onChange={e => setBrewTimeS(e.target.value)}
                placeholder="28"
                className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              <span className="text-sm text-slate-400">s</span>
            </div>
            <BrewTimer onTime={s => setBrewTimeS(String(s))} />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bewertung *</label>
          <RatingInput value={rating} onChange={setRating} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Geschmacksnotizen</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Schokolade, Nuss, leicht säuerlich..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createShot.isPending || createCoffee.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {createShot.isPending ? 'Speichern...' : 'Shot speichern'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Test manually**

Run dev server, add a coffee, fill out the form, save a shot, verify redirect to dashboard and shot in Supabase.

- [ ] **Step 3: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat: NewShot form with timer and rating scale"
```

---

## Task 12: Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Implement Dashboard**

`src/pages/Dashboard.tsx`:
```tsx
import { Link } from 'react-router-dom'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'

export function Dashboard() {
  const { data: shots = [], isLoading } = useShots()

  const avgRating = shots.length > 0
    ? (shots.reduce((sum, s) => sum + s.rating, 0) / shots.length).toFixed(1)
    : '—'

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">☕ Espresso</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{shots.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Shots total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avgRating}</p>
          <p className="text-xs text-slate-500 mt-0.5">Ø Bewertung</p>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Letzte Shots
      </h2>

      {isLoading && <p className="text-slate-400 text-sm text-center py-4">Laden...</p>}

      <div className="grid gap-2 mb-6">
        {shots.slice(0, 5).map(shot => (
          <ShotCard key={shot.id} shot={shot} />
        ))}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            Noch keine Shots. Zieh deinen ersten!
          </p>
        )}
      </div>

      <Link
        to="/shots/new"
        className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center font-semibold py-3 rounded-xl"
      >
        + Neuer Shot
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: Dashboard with shot stats and recent list"
```

---

## Task 13: ShotHistory Page

**Files:**
- Modify: `src/pages/ShotHistory.tsx`

- [ ] **Step 1: Implement ShotHistory**

`src/pages/ShotHistory.tsx`:
```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'

export function ShotHistory() {
  const [filterCoffeeId, setFilterCoffeeId] = useState('')
  const { data: coffees = [] } = useCoffees()
  const { data: shots = [], isLoading } = useShots(filterCoffeeId || undefined)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">📋 Shots</h1>
        <Link
          to="/shots/new"
          className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          + Neu
        </Link>
      </div>

      <select
        value={filterCoffeeId}
        onChange={e => setFilterCoffeeId(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-4 focus:outline-none focus:border-orange-400"
      >
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid gap-2">
        {shots.map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Keine Shots gefunden.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ShotHistory.tsx
git commit -m "feat: ShotHistory page with coffee filter"
```

---

## Task 14: Analysis Page

**Files:**
- Modify: `src/pages/Analysis.tsx`

- [ ] **Step 1: Implement Analysis**

`src/pages/Analysis.tsx`:
```tsx
import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useCoffees } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { RecipeCard } from '../components/RecipeCard'
import { calcBestRecipe } from '../utils/recipeCalc'

export function Analysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const { data: coffees = [] } = useCoffees()
  const { data: shots = [] } = useShots(coffeeId || undefined)

  const recipe = calcBestRecipe(shots)
  const scatterData = shots.map(s => ({
    x: s.grind_setting,
    y: s.rating,
    id: s.id,
  }))

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">📊 Analyse</h1>

      <select
        value={coffeeId}
        onChange={e => setCoffeeId(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-6 focus:outline-none focus:border-orange-400"
      >
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {shots.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          Noch keine Shots für diesen Kaffee.
        </p>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Mahlgrad → Bewertung
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="x"
                  type="number"
                  name="Mahlgrad"
                  domain={['auto', 'auto']}
                  label={{ value: 'Mahlgrad', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name="Bewertung"
                  domain={[0, 10]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={24}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null
                    const { x, y } = payload[0].payload
                    return (
                      <div className="bg-white border border-slate-200 rounded px-2 py-1 text-xs shadow">
                        <p>Mahlgrad: <strong>{x}</strong></p>
                        <p>Bewertung: <strong>{y}</strong></p>
                      </div>
                    )
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map(entry => (
                    <Cell
                      key={entry.id}
                      fill={entry.y >= 8 ? '#16a34a' : '#f97316'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 text-center mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1" />Bewertung ≥ 8
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mx-1 ml-3" />unter 8
            </p>
          </div>

          {recipe ? (
            <RecipeCard stats={recipe} />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-400">
              Noch keine Shots mit Bewertung ≥ 8. Weiter experimentieren!
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test manually**

Add several shots with different grind settings, go to Analyse, verify scatter plot and recipe card appear correctly.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Analysis.tsx
git commit -m "feat: Analysis page — scatter plot and best recipe card"
```

---

## Task 15: PWA Manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `index.html`

- [ ] **Step 1: Create manifest**

`public/manifest.json`:
```json
{
  "name": "Espresso Tracker",
  "short_name": "Espresso",
  "description": "Track and analyse your espresso shots",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Add manifest + mobile meta to index.html**

Replace the `<head>` section in `index.html`:
```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#f97316" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Espresso" />
  <link rel="manifest" href="/manifest.json" />
  <title>Espresso Tracker</title>
</head>
```

- [ ] **Step 3: Add a placeholder icon**

For a quick placeholder icon, create a simple orange square PNG (192×192 and 512×512) and save to `public/icon-192.png` and `public/icon-512.png`. You can use any image editor or a free online PNG generator. The icon is required for iOS "Add to Home Screen" to work properly.

- [ ] **Step 4: Test on iPhone**

Open http://your-vercel-url on iPhone Safari → Share → Add to Home Screen → confirm "Espresso" appears with your icon.

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/icon-192.png public/icon-512.png index.html
git commit -m "feat: PWA manifest for home screen install"
```

---

## Task 16: Deploy to Vercel

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json (SPA routing)**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/espresso-tracker.git
git push -u origin main
```

- [ ] **Step 3: Deploy on Vercel**

Go to https://vercel.com → New Project → Import from GitHub → select `espresso-tracker`.

In the Environment Variables section add:
- `VITE_SUPABASE_URL` → your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` → your Supabase anon key

Click Deploy.

- [ ] **Step 4: Verify deployed app**

Open the Vercel URL → add a coffee → add a shot → check Analyse page. Verify the app works identically on iPhone and desktop browser.

- [ ] **Step 5: Final commit**

```bash
git add vercel.json
git commit -m "feat: Vercel deployment config"
git push
```

---

## All Tests

Run the full test suite at any point:

```bash
npm test -- --run
```

Expected: all tests in `src/__tests__/` pass — RatingInput (3), BrewTimer (3), recipeCalc (6), App (1) = **13 tests**.
