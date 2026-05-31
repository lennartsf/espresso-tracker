# Brew Methods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a separate `/brews` page for French Press, V60, AeroPress and Moka Pot with method-specific parameters, MM:SS time inputs, and filter tabs.

**Architecture:** New `brews` Supabase table (already created). Follows the same patterns as shots: `useBrews` hook → `BrewCard` component → `Brews` list page → `NewBrew` form → `BrewDetail` view/edit. Two new utilities (`brewMethods.ts`, `timeFormat.ts`) keep label constants and time conversion logic out of components.

**Tech Stack:** React 18, TypeScript, @tanstack/react-query, Supabase, Tailwind CSS, Vitest + @testing-library/react

---

### Task 1: TypeScript Types + brewMethods Utility

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/utils/brewMethods.ts`
- Create: `src/__tests__/brewMethods.test.ts`

- [ ] **Step 1: Add Brew interface and NewBrew type to src/types/index.ts**

Append after the existing `export type NewBasket = ...` line:

```typescript
export interface Brew {
  id: string
  coffee_id: string
  grinder_id: string | null
  brew_method: string
  grind_setting: number | null
  dose_g: number | null
  water_ml: number | null
  temp_c: number | null
  brew_time_s: number | null
  rating: number
  tasting_notes: string | null
  bloom_ml: number | null
  bloom_time_s: number | null
  inverted: boolean
  first_stir_s: number | null
  brewed_at: string
  created_at: string
}

export type NewBrew = Omit<Brew, 'id' | 'created_at'>
```

- [ ] **Step 2: Write failing tests for brewMethods**

Create `src/__tests__/brewMethods.test.ts`:

```typescript
import { BREW_METHODS, brewMethodLabel } from '../utils/brewMethods'

test('BREW_METHODS enthält 4 Einträge', () => {
  expect(BREW_METHODS).toHaveLength(4)
})

test('brewMethodLabel gibt French Press zurück', () => {
  expect(brewMethodLabel('french_press')).toBe('French Press')
})

test('brewMethodLabel gibt V60 zurück', () => {
  expect(brewMethodLabel('v60')).toBe('V60')
})

test('brewMethodLabel gibt AeroPress zurück', () => {
  expect(brewMethodLabel('aeropress')).toBe('AeroPress')
})

test('brewMethodLabel gibt Moka Pot zurück', () => {
  expect(brewMethodLabel('moka_pot')).toBe('Moka Pot')
})

test('brewMethodLabel Fallback für unbekannten Wert', () => {
  expect(brewMethodLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/brewMethods.test.ts`
Expected: FAIL — "Cannot find module '../utils/brewMethods'"

- [ ] **Step 4: Create src/utils/brewMethods.ts**

```typescript
export const BREW_METHODS = [
  { value: 'french_press', label: 'French Press' },
  { value: 'v60',          label: 'V60' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'moka_pot',     label: 'Moka Pot' },
] as const

export function brewMethodLabel(value: string): string {
  return BREW_METHODS.find(m => m.value === value)?.label ?? value
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/brewMethods.test.ts`
Expected: 6 tests PASS

- [ ] **Step 6: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/types/index.ts src/utils/brewMethods.ts src/__tests__/brewMethods.test.ts
git commit -m "feat: add Brew type and brewMethods utility"
```

---

### Task 2: timeFormat Utility

**Files:**
- Create: `src/utils/timeFormat.ts`
- Create: `src/__tests__/timeFormat.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/timeFormat.test.ts`:

```typescript
import { secondsToMMSS, MMSSToSeconds, normalizeTimeInput } from '../utils/timeFormat'

test('secondsToMMSS konvertiert 240 zu 04:00', () => {
  expect(secondsToMMSS(240)).toBe('04:00')
})

test('secondsToMMSS konvertiert 90 zu 01:30', () => {
  expect(secondsToMMSS(90)).toBe('01:30')
})

test('secondsToMMSS konvertiert 0 zu 00:00', () => {
  expect(secondsToMMSS(0)).toBe('00:00')
})

test('secondsToMMSS konvertiert 65 zu 01:05', () => {
  expect(secondsToMMSS(65)).toBe('01:05')
})

test('MMSSToSeconds gibt 240 für "04:00"', () => {
  expect(MMSSToSeconds('04:00')).toBe(240)
})

test('MMSSToSeconds gibt 90 für "01:30"', () => {
  expect(MMSSToSeconds('01:30')).toBe(90)
})

test('MMSSToSeconds interpretiert "240" als 240 Sekunden', () => {
  expect(MMSSToSeconds('240')).toBe(240)
})

test('MMSSToSeconds gibt null für leere Eingabe', () => {
  expect(MMSSToSeconds('')).toBeNull()
})

test('MMSSToSeconds gibt null für ungültige Eingabe', () => {
  expect(MMSSToSeconds('abc')).toBeNull()
})

test('normalizeTimeInput konvertiert "240" zu "04:00"', () => {
  expect(normalizeTimeInput('240')).toBe('04:00')
})

test('normalizeTimeInput lässt "04:00" unverändert', () => {
  expect(normalizeTimeInput('04:00')).toBe('04:00')
})

test('normalizeTimeInput gibt leeren String für leere Eingabe', () => {
  expect(normalizeTimeInput('')).toBe('')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/timeFormat.test.ts`
Expected: FAIL — "Cannot find module '../utils/timeFormat'"

- [ ] **Step 3: Create src/utils/timeFormat.ts**

```typescript
export function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function MMSSToSeconds(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10)
    return isNaN(n) ? null : n
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
}

export function normalizeTimeInput(input: string): string {
  if (!input.trim()) return ''
  const seconds = MMSSToSeconds(input)
  if (seconds === null) return input
  return secondsToMMSS(seconds)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/timeFormat.test.ts`
Expected: 12 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/timeFormat.ts src/__tests__/timeFormat.test.ts
git commit -m "feat: add timeFormat utility (secondsToMMSS, MMSSToSeconds, normalizeTimeInput)"
```

---

### Task 3: useBrews Hooks

**Files:**
- Create: `src/hooks/useBrews.ts`
- Create: `src/__tests__/useBrews.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/useBrews.test.tsx`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { ReactNode } from 'react'
import { useBrews } from '../hooks/useBrews'
import type { BrewWithCoffee } from '../hooks/useBrews'

const mockBrew: BrewWithCoffee = {
  id: 'b1',
  coffee_id: 'c1',
  grinder_id: null,
  brew_method: 'v60',
  grind_setting: 20,
  dose_g: 15,
  water_ml: 250,
  temp_c: 93,
  brew_time_s: 210,
  rating: 8,
  tasting_notes: null,
  bloom_ml: 30,
  bloom_time_s: 45,
  inverted: false,
  first_stir_s: null,
  brewed_at: '2026-05-30T10:00:00Z',
  created_at: '2026-05-30T10:00:00Z',
  coffees: { name: 'Ethiopia' },
  grinders: null,
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [mockBrew], error: null }),
      }),
    }),
  },
}))

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

test('useBrews gibt Brews zurück', async () => {
  const { result } = renderHook(() => useBrews(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].brew_method).toBe('v60')
  expect(result.current.data![0].coffees?.name).toBe('Ethiopia')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/useBrews.test.tsx`
Expected: FAIL — "Cannot find module '../hooks/useBrews'"

- [ ] **Step 3: Create src/hooks/useBrews.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Brew, NewBrew } from '../types'

export type BrewWithCoffee = Brew & {
  coffees: { name: string } | null
  grinders: { name: string } | null
}

export function useBrews(coffeeId?: string, brewMethod?: string) {
  return useQuery({
    queryKey: ['brews', coffeeId ?? 'all', brewMethod ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('brews')
        .select('*, coffees(name), grinders(name)')
        .order('brewed_at', { ascending: false })
      if (coffeeId) query = query.eq('coffee_id', coffeeId)
      if (brewMethod) query = query.eq('brew_method', brewMethod)
      const { data, error } = await query
      if (error) throw error
      return data as BrewWithCoffee[]
    },
  })
}

export function useBrew(id: string) {
  return useQuery({
    queryKey: ['brew', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brews')
        .select('*, coffees(name), grinders(name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as BrewWithCoffee
    },
    enabled: !!id,
  })
}

export function useCreateBrew() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (brew: NewBrew) => {
      const { data, error } = await supabase.from('brews').insert(brew).select().single()
      if (error) throw error
      return data as Brew
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brews'] }),
  })
}

export function useUpdateBrew() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (brew: Partial<Brew> & { id: string }) => {
      const { id, ...fields } = brew
      const { data, error } = await supabase
        .from('brews').update(fields).eq('id', id).select().single()
      if (error) throw error
      return data as Brew
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['brews'] })
      qc.invalidateQueries({ queryKey: ['brew', data.id] })
    },
  })
}

export function useDeleteBrew() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brews'] }),
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/useBrews.test.tsx`
Expected: 1 test PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBrews.ts src/__tests__/useBrews.test.tsx
git commit -m "feat: add useBrews hooks"
```

---

### Task 4: BrewCard Component

**Files:**
- Create: `src/components/BrewCard.tsx`
- Create: `src/__tests__/BrewCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/BrewCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrewCard } from '../components/BrewCard'
import type { BrewWithCoffee } from '../hooks/useBrews'

const baseBrew: BrewWithCoffee = {
  id: 'b1',
  coffee_id: 'c1',
  grinder_id: null,
  brew_method: 'v60',
  grind_setting: 20,
  dose_g: 15,
  water_ml: 250,
  temp_c: 93,
  brew_time_s: 210,
  rating: 8,
  tasting_notes: null,
  bloom_ml: 30,
  bloom_time_s: 45,
  inverted: false,
  first_stir_s: null,
  brewed_at: '2026-05-30T10:00:00Z',
  created_at: '2026-05-30T10:00:00Z',
  coffees: { name: 'Ethiopia' },
  grinders: null,
}

function renderCard(brew: BrewWithCoffee) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <BrewCard brew={brew} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('zeigt Methoden-Badge V60', () => {
  renderCard(baseBrew)
  expect(screen.getByText('V60')).toBeInTheDocument()
})

test('zeigt Kaffee-Name', () => {
  renderCard(baseBrew)
  expect(screen.getByText('Ethiopia')).toBeInTheDocument()
})

test('zeigt Brühzeit als 03:30', () => {
  renderCard(baseBrew)
  expect(screen.getByText(/03:30/)).toBeInTheDocument()
})

test('zeigt Bewertungs-Badge', () => {
  renderCard(baseBrew)
  expect(screen.getByText('8')).toBeInTheDocument()
})

test('zeigt French Press Badge', () => {
  renderCard({ ...baseBrew, brew_method: 'french_press' })
  expect(screen.getByText('French Press')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/BrewCard.test.tsx`
Expected: FAIL — "Cannot find module '../components/BrewCard'"

- [ ] **Step 3: Create src/components/BrewCard.tsx**

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
    brew.grind_setting ? `Mahlgrad ${brew.grind_setting}` : null,
    brew.dose_g ? `${brew.dose_g}g` : null,
    brew.water_ml ? `${brew.water_ml} ml` : null,
    brew.brew_time_s ? secondsToMMSS(brew.brew_time_s) : null,
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/BrewCard.test.tsx`
Expected: 5 tests PASS

- [ ] **Step 5: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/BrewCard.tsx src/__tests__/BrewCard.test.tsx
git commit -m "feat: add BrewCard component"
```

---

### Task 5: Brews List Page

**Files:**
- Create: `src/pages/Brews.tsx`

- [ ] **Step 1: Create src/pages/Brews.tsx**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useBrews } from '../hooks/useBrews'
import { BrewCard } from '../components/BrewCard'

type MethodFilter = 'all' | 'french_press' | 'v60' | 'aeropress' | 'moka_pot'

const METHOD_FILTER_LABELS: Record<MethodFilter, string> = {
  all: 'Alle',
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
        <h1 className="text-xl font-bold text-slate-800">🫖 Brühen</h1>
        <Link to="/brews/new" className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
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
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {brews.map(brew => <BrewCard key={brew.id} brew={brew} />)}
        {!isLoading && brews.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10 md:col-span-2">
            Noch keine Brews. Füge deinen ersten hinzu!
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/Brews.tsx
git commit -m "feat: add Brews list page with method filter tabs"
```

---

### Task 6: NewBrew Form Page

**Files:**
- Create: `src/pages/NewBrew.tsx`

- [ ] **Step 1: Create src/pages/NewBrew.tsx**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders } from '../hooks/useEquipment'
import { useCreateBrew } from '../hooks/useBrews'
import { RatingInput } from '../components/RatingInput'
import { BREW_METHODS } from '../utils/brewMethods'
import { normalizeTimeInput, MMSSToSeconds, secondsToMMSS } from '../utils/timeFormat'

export function NewBrew() {
  const navigate = useNavigate()
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const createBrew = useCreateBrew()

  const [brewMethod, setBrewMethod] = useState('french_press')
  const [coffeeId, setCoffeeId] = useState('')
  const [grinderId, setGrinderId] = useState('')
  const [grindSetting, setGrindSetting] = useState('')
  const [doseG, setDoseG] = useState('')
  const [waterMl, setWaterMl] = useState('')
  const [tempC, setTempC] = useState('')
  const [brewTime, setBrewTime] = useState('')
  const [bloomMl, setBloomMl] = useState('')
  const [bloomTime, setBloomTime] = useState('')
  const [inverted, setInverted] = useState(false)
  const [firstStir, setFirstStir] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [tastingNotes, setTastingNotes] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!coffeeId) { setError('Bitte einen Kaffee auswählen.'); return }
    if (!rating) { setError('Bitte den Brew bewerten.'); return }

    const brewTimeS = MMSSToSeconds(brewTime)
    const firstStirS = firstStir ? MMSSToSeconds(firstStir) : null

    if (firstStirS !== null && brewTimeS !== null && firstStirS > brewTimeS) {
      setError('1. Umrühren darf die Brühzeit nicht überschreiten.')
      return
    }

    try {
      await createBrew.mutateAsync({
        coffee_id: coffeeId,
        grinder_id: grinderId || null,
        brew_method: brewMethod,
        grind_setting: grindSetting ? parseFloat(grindSetting) : null,
        dose_g: doseG ? parseFloat(doseG) : null,
        water_ml: waterMl ? parseFloat(waterMl) : null,
        temp_c: tempC ? parseFloat(tempC) : null,
        brew_time_s: brewTimeS,
        rating,
        tasting_notes: tastingNotes.trim() || null,
        bloom_ml: brewMethod === 'v60' && bloomMl ? parseFloat(bloomMl) : null,
        bloom_time_s: brewMethod === 'v60' ? MMSSToSeconds(bloomTime) : null,
        inverted: brewMethod === 'aeropress' ? inverted : false,
        first_stir_s: brewMethod === 'french_press' ? firstStirS : null,
        brewed_at: new Date().toISOString(),
      })
      navigate('/brews')
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-slate-400 text-lg">←</button>
        <h1 className="text-xl font-bold text-slate-800">Neuer Brew</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Brühmethode */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Brühmethode</label>
          <div className="flex flex-wrap gap-2">
            {BREW_METHODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setBrewMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  brewMethod === m.value
                    ? 'bg-orange-500 text-white'
                    : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kaffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
          <select
            value={coffeeId}
            onChange={e => setCoffeeId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="">Kaffee wählen...</option>
            {coffees.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>
            ))}
          </select>
        </div>

        {/* Mühle */}
        {grinders.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mühle</label>
            <select
              value={grinderId}
              onChange={e => setGrinderId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="">Mühle (optional)</option>
              {grinders.map(g => (
                <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Mahlgrad + Kaffee g */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad</label>
            <input
              type="number" step="0.5" value={grindSetting}
              onChange={e => setGrindSetting(e.target.value)}
              placeholder="20"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee (g)</label>
            <input
              type="number" step="0.1" value={doseG}
              onChange={e => setDoseG(e.target.value)}
              placeholder="15"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Wasser + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Wasser (ml)</label>
            <input
              type="number" step="10" value={waterMl}
              onChange={e => setWaterMl(e.target.value)}
              placeholder="250"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input
              type="number" value={tempC}
              onChange={e => setTempC(e.target.value)}
              placeholder="93"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Brühzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit (MM:SS)</label>
          <input
            type="text" value={brewTime}
            onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))}
            placeholder="04:00"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              1. Umrühren (MM:SS) <span className="text-slate-300 normal-case font-normal">optional</span>
            </label>
            <input
              type="text" value={firstStir}
              onChange={e => setFirstStir(e.target.value)}
              onBlur={e => setFirstStir(normalizeTimeInput(e.target.value))}
              placeholder="00:30"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        )}

        {/* V60: Bloom */}
        {brewMethod === 'v60' && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
            <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Bloom</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom (ml)</label>
                <input
                  type="number" step="5" value={bloomMl}
                  onChange={e => setBloomMl(e.target.value)}
                  placeholder="30"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom-Zeit (MM:SS)</label>
                <input
                  type="text" value={bloomTime}
                  onChange={e => setBloomTime(e.target.value)}
                  onBlur={e => setBloomTime(normalizeTimeInput(e.target.value))}
                  placeholder="00:45"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* AeroPress: Inverted */}
        {brewMethod === 'aeropress' && (
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox" checked={inverted}
                onChange={e => setInverted(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Inverted
            </label>
          </div>
        )}

        {/* Bewertung */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bewertung *</label>
          <RatingInput value={rating} onChange={setRating} />
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notizen</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            placeholder="Fruchtig, nussig..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={createBrew.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {createBrew.isPending ? 'Speichern...' : 'Brew speichern'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/NewBrew.tsx
git commit -m "feat: add NewBrew form with method-specific fields and MM:SS time inputs"
```

---

### Task 7: BrewDetail Page

**Files:**
- Create: `src/pages/BrewDetail.tsx`

- [ ] **Step 1: Create src/pages/BrewDetail.tsx**

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBrew, useUpdateBrew, useDeleteBrew } from '../hooks/useBrews'
import { useCoffees } from '../hooks/useCoffees'
import { useGrinders } from '../hooks/useEquipment'
import { RatingInput } from '../components/RatingInput'
import { ratingColor } from '../utils/ratingColor'
import { brewMethodLabel, BREW_METHODS } from '../utils/brewMethods'
import { secondsToMMSS, normalizeTimeInput, MMSSToSeconds } from '../utils/timeFormat'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function BrewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: brew, isLoading, error } = useBrew(id ?? '')
  const deleteBrew = useDeleteBrew()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Laden...</p>
  if (error || !brew) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Brew nicht gefunden.</p>
      <button onClick={() => navigate('/brews')} className="text-orange-500 text-sm font-semibold">← Zurück</button>
    </div>
  )

  if (editing) return <BrewEditForm brew={brew} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Brew wirklich löschen?')) return
    await deleteBrew.mutateAsync(brew!.id)
    navigate('/brews')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/brews')} className="text-slate-400 text-lg">←</button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">{brew.coffees?.name ?? '—'}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
              {brewMethodLabel(brew.brew_method)}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} disabled={deleteBrew.isPending} className="text-slate-300 hover:text-red-400 text-sm disabled:opacity-50">
            {deleteBrew.isPending ? 'Löschen...' : 'Löschen'}
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Bewertung</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingColor(brew.rating)}`}>{brew.rating}</span>
      </div>

      {/* Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {brew.grind_setting !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Mahlgrad</p>
            <p className="text-base font-bold text-slate-800">{brew.grind_setting}</p>
          </div>
        )}
        {brew.dose_g !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Kaffee</p>
            <p className="text-base font-bold text-slate-800">{brew.dose_g} g</p>
          </div>
        )}
        {brew.water_ml !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Wasser</p>
            <p className="text-base font-bold text-slate-800">{brew.water_ml} ml</p>
          </div>
        )}
        {brew.temp_c !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperatur</p>
            <p className="text-base font-bold text-slate-800">{brew.temp_c}°C</p>
          </div>
        )}
        {brew.brew_time_s !== null && (
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Brühzeit</p>
            <p className="text-base font-bold text-slate-800">{secondsToMMSS(brew.brew_time_s)}</p>
          </div>
        )}
      </div>

      {/* Method-specific */}
      {brew.brew_method === 'french_press' && brew.first_stir_s !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">1. Umrühren</p>
          <p className="text-sm font-bold text-slate-800">{secondsToMMSS(brew.first_stir_s)}</p>
        </div>
      )}

      {brew.brew_method === 'v60' && (brew.bloom_ml !== null || brew.bloom_time_s !== null) && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Bloom</p>
          <div className="grid gap-1">
            {brew.bloom_ml !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Menge</span>
                <span className="text-slate-800">{brew.bloom_ml} ml</span>
              </div>
            )}
            {brew.bloom_time_s !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Zeit</span>
                <span className="text-slate-800">{secondsToMMSS(brew.bloom_time_s)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {brew.brew_method === 'aeropress' && brew.inverted && (
        <div className="flex gap-2 mb-3">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">Inverted</span>
        </div>
      )}

      {/* Tasting notes */}
      {brew.tasting_notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-700 italic">„{brew.tasting_notes}"</p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-4">{formatDate(brew.brewed_at)}</p>
    </div>
  )
}

function BrewEditForm({
  brew, onCancel, onSaved,
}: {
  brew: ReturnType<typeof useBrew>['data'] & {}
  onCancel: () => void
  onSaved: () => void
}) {
  const updateBrew = useUpdateBrew()
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()

  const [brewMethod, setBrewMethod] = useState(brew.brew_method)
  const [coffeeId, setCoffeeId] = useState(brew.coffee_id)
  const [grinderId, setGrinderId] = useState(brew.grinder_id ?? '')
  const [grindSetting, setGrindSetting] = useState(brew.grind_setting ? String(brew.grind_setting) : '')
  const [doseG, setDoseG] = useState(brew.dose_g ? String(brew.dose_g) : '')
  const [waterMl, setWaterMl] = useState(brew.water_ml ? String(brew.water_ml) : '')
  const [tempC, setTempC] = useState(brew.temp_c ? String(brew.temp_c) : '')
  const [brewTime, setBrewTime] = useState(brew.brew_time_s ? secondsToMMSS(brew.brew_time_s) : '')
  const [bloomMl, setBloomMl] = useState(brew.bloom_ml ? String(brew.bloom_ml) : '')
  const [bloomTime, setBloomTime] = useState(brew.bloom_time_s ? secondsToMMSS(brew.bloom_time_s) : '')
  const [inverted, setInverted] = useState(brew.inverted)
  const [firstStir, setFirstStir] = useState(brew.first_stir_s ? secondsToMMSS(brew.first_stir_s) : '')
  const [rating, setRating] = useState<number | null>(brew.rating)
  const [tastingNotes, setTastingNotes] = useState(brew.tasting_notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!rating) { setError('Bitte den Brew bewerten.'); return }

    const brewTimeS = MMSSToSeconds(brewTime)
    const firstStirS = firstStir ? MMSSToSeconds(firstStir) : null

    if (firstStirS !== null && brewTimeS !== null && firstStirS > brewTimeS) {
      setError('1. Umrühren darf die Brühzeit nicht überschreiten.')
      return
    }

    try {
      await updateBrew.mutateAsync({
        id: brew.id,
        coffee_id: coffeeId,
        grinder_id: grinderId || null,
        brew_method: brewMethod,
        grind_setting: grindSetting ? parseFloat(grindSetting) : null,
        dose_g: doseG ? parseFloat(doseG) : null,
        water_ml: waterMl ? parseFloat(waterMl) : null,
        temp_c: tempC ? parseFloat(tempC) : null,
        brew_time_s: brewTimeS,
        rating,
        tasting_notes: tastingNotes.trim() || null,
        bloom_ml: brewMethod === 'v60' && bloomMl ? parseFloat(bloomMl) : null,
        bloom_time_s: brewMethod === 'v60' ? MMSSToSeconds(bloomTime) : null,
        inverted: brewMethod === 'aeropress' ? inverted : false,
        first_stir_s: brewMethod === 'french_press' ? firstStirS : null,
      })
      onSaved()
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">Brew bearbeiten</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Brühmethode */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Brühmethode</label>
          <div className="flex flex-wrap gap-2">
            {BREW_METHODS.map(m => (
              <button
                key={m.value} type="button" onClick={() => setBrewMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  brewMethod === m.value ? 'bg-orange-500 text-white' : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kaffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
          <select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
          </select>
        </div>

        {/* Mühle */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mühle</label>
          <select value={grinderId} onChange={e => setGrinderId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            <option value="">Mühle (optional)</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>)}
          </select>
        </div>

        {/* Mahlgrad + Dose */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad</label>
            <input type="number" step="0.5" value={grindSetting} onChange={e => setGrindSetting(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee (g)</label>
            <input type="number" step="0.1" value={doseG} onChange={e => setDoseG(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Wasser + Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Wasser (ml)</label>
            <input type="number" step="10" value={waterMl} onChange={e => setWaterMl(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
            <input type="number" value={tempC} onChange={e => setTempC(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        {/* Brühzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit (MM:SS)</label>
          <input type="text" value={brewTime} onChange={e => setBrewTime(e.target.value)}
            onBlur={e => setBrewTime(normalizeTimeInput(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        {/* French Press: First Stir */}
        {brewMethod === 'french_press' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              1. Umrühren (MM:SS) <span className="text-slate-300 normal-case font-normal">optional</span>
            </label>
            <input type="text" value={firstStir} onChange={e => setFirstStir(e.target.value)}
              onBlur={e => setFirstStir(normalizeTimeInput(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        )}

        {/* V60: Bloom */}
        {brewMethod === 'v60' && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
            <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Bloom</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom (ml)</label>
                <input type="number" step="5" value={bloomMl} onChange={e => setBloomMl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bloom-Zeit (MM:SS)</label>
                <input type="text" value={bloomTime} onChange={e => setBloomTime(e.target.value)}
                  onBlur={e => setBloomTime(normalizeTimeInput(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>
        )}

        {/* AeroPress: Inverted */}
        {brewMethod === 'aeropress' && (
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={inverted} onChange={e => setInverted(e.target.checked)}
                className="w-4 h-4 accent-orange-500" />
              Inverted
            </label>
          </div>
        )}

        {/* Bewertung */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bewertung *</label>
          <RatingInput value={rating} onChange={setRating} />
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notizen</label>
          <textarea value={tastingNotes} onChange={e => setTastingNotes(e.target.value)} rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={updateBrew.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {updateBrew.isPending ? 'Speichern...' : 'Änderungen speichern'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/BrewDetail.tsx
git commit -m "feat: add BrewDetail view and edit page"
```

---

### Task 8: Navigation + Routes

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add 🫖 Brühen nav item to src/components/Layout.tsx**

In `navItems`, add after `{ to: '/shots', label: 'Shots', icon: '📋' }`:

```typescript
{ to: '/brews', label: 'Brühen', icon: '🫖' },
```

- [ ] **Step 2: Add routes and imports to src/App.tsx**

Add imports after existing imports:
```typescript
import { Brews } from './pages/Brews'
import { NewBrew } from './pages/NewBrew'
import { BrewDetail } from './pages/BrewDetail'
```

Add routes inside `<Route element={<Layout />}>`, after the shots routes:
```tsx
<Route path="brews" element={<Brews />} />
<Route path="brews/new" element={<NewBrew />} />
<Route path="brews/:id" element={<BrewDetail />} />
```

- [ ] **Step 3: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 4: TypeScript + build check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit && npm run build 2>&1 | tail -3`
Expected: no TS errors, build ✓

- [ ] **Step 5: Commit and push**

```bash
git add src/components/Layout.tsx src/App.tsx
git commit -m "feat: add Brühen nav item and routes"
git push
```
