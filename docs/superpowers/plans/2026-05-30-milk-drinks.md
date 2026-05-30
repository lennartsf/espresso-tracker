# Milk Drinks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drink type (Espresso/Cappuccino/Latte Macchiato/Flat White/Cortado/Macchiato) and milk parameters (type + ml) to shot entries, with filter tabs in ShotHistory.

**Architecture:** Extend the existing `shots` table with `drink_type` (text, DEFAULT 'espresso'), `milk_type` (text, nullable), `milk_ml` (float4, nullable). A new `drinkTypes.ts` utility holds the label constants. All existing Espresso shots automatically get `drink_type = 'espresso'` via the DEFAULT. `useShots` gains an optional `drinkFilter` parameter. NewShot, ShotCard, ShotHistory, and ShotDetail are updated to show/edit drink type and milk data.

**Tech Stack:** React 18, TypeScript, @tanstack/react-query, Supabase, Tailwind CSS, Vitest + @testing-library/react

---

### Task 1: SQL Migrations + TypeScript Types + Fix Existing Mocks

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/__tests__/ShotDetail.test.tsx`
- Modify: `src/__tests__/recipeCalc.test.ts`

- [ ] **Step 1: Run SQL migrations in Supabase**

Run in the Supabase SQL Editor (Dashboard → SQL Editor):

```sql
ALTER TABLE shots ADD COLUMN drink_type text NOT NULL DEFAULT 'espresso';
ALTER TABLE shots ADD COLUMN milk_type text;
ALTER TABLE shots ADD COLUMN milk_ml float4;
```

- [ ] **Step 2: Add three fields to the Shot interface in src/types/index.ts**

In the `Shot` interface, add after `basket_id: string | null`:

```typescript
drink_type: string
milk_type: string | null
milk_ml: number | null
```

- [ ] **Step 3: Update ShotDetail test mock in src/__tests__/ShotDetail.test.tsx**

In the `vi.fn(() => ({` mock object, add after `basket_id: null,`:

```typescript
drink_type: 'espresso',
milk_type: null,
milk_ml: null,
```

Also in the equipment-chips test (`vi.mocked(useShot).mockReturnValueOnce`), add the same three fields after `basket_id: 'b1',`:

```typescript
drink_type: 'espresso',
milk_type: null,
milk_ml: null,
```

- [ ] **Step 4: Update recipeCalc test mock in src/__tests__/recipeCalc.test.ts**

In `makeShot`, add after `basket_id: null,`:

```typescript
drink_type: 'espresso',
milk_type: null,
milk_ml: null,
```

- [ ] **Step 5: Run build and tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npm run build 2>&1 | tail -5 && npx vitest run 2>&1 | tail -3`
Expected: build ✓, 39 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/__tests__/ShotDetail.test.tsx src/__tests__/recipeCalc.test.ts
git commit -m "feat: add drink_type, milk_type, milk_ml to Shot type"
```

---

### Task 2: drinkTypes Utility + Tests

**Files:**
- Create: `src/utils/drinkTypes.ts`
- Create: `src/__tests__/drinkTypes.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/drinkTypes.test.ts`:

```typescript
import { drinkTypeLabel, milkTypeLabel, DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'

test('DRINK_TYPES enthält 6 Einträge', () => {
  expect(DRINK_TYPES).toHaveLength(6)
})

test('MILK_TYPES enthält 7 Einträge', () => {
  expect(MILK_TYPES).toHaveLength(7)
})

test('drinkTypeLabel gibt Espresso zurück', () => {
  expect(drinkTypeLabel('espresso')).toBe('Espresso')
})

test('drinkTypeLabel gibt Cappuccino zurück', () => {
  expect(drinkTypeLabel('cappuccino')).toBe('Cappuccino')
})

test('drinkTypeLabel gibt Flat White zurück', () => {
  expect(drinkTypeLabel('flat_white')).toBe('Flat White')
})

test('drinkTypeLabel gibt Latte Macchiato zurück', () => {
  expect(drinkTypeLabel('latte_macchiato')).toBe('Latte Macchiato')
})

test('drinkTypeLabel Fallback für unbekannten Wert', () => {
  expect(drinkTypeLabel('unknown')).toBe('unknown')
})

test('milkTypeLabel gibt Hafermilch zurück', () => {
  expect(milkTypeLabel('hafer')).toBe('Hafermilch')
})

test('milkTypeLabel gibt Vollmilch 3,8% zurück', () => {
  expect(milkTypeLabel('vollmilch_38')).toBe('Vollmilch 3,8%')
})

test('milkTypeLabel Fallback für unbekannten Wert', () => {
  expect(milkTypeLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/drinkTypes.test.ts`
Expected: FAIL — "Cannot find module '../utils/drinkTypes'"

- [ ] **Step 3: Create src/utils/drinkTypes.ts**

```typescript
export const DRINK_TYPES = [
  { value: 'espresso',        label: 'Espresso' },
  { value: 'cappuccino',      label: 'Cappuccino' },
  { value: 'latte_macchiato', label: 'Latte Macchiato' },
  { value: 'flat_white',      label: 'Flat White' },
  { value: 'cortado',         label: 'Cortado' },
  { value: 'macchiato',       label: 'Macchiato' },
] as const

export const MILK_TYPES = [
  { value: 'vollmilch_38', label: 'Vollmilch 3,8%' },
  { value: 'vollmilch_35', label: 'Vollmilch 3,5%' },
  { value: 'fettarm_15',   label: 'Fettarme Milch 1,5%' },
  { value: 'hafer',        label: 'Hafermilch' },
  { value: 'mandel',       label: 'Mandelmilch' },
  { value: 'kokos',        label: 'Kokosmilch' },
  { value: 'soja',         label: 'Sojamilch' },
] as const

export function drinkTypeLabel(value: string): string {
  return DRINK_TYPES.find(d => d.value === value)?.label ?? value
}

export function milkTypeLabel(value: string): string {
  return MILK_TYPES.find(m => m.value === value)?.label ?? value
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/drinkTypes.test.ts`
Expected: 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/drinkTypes.ts src/__tests__/drinkTypes.test.ts
git commit -m "feat: add drinkTypes utility with DRINK_TYPES and MILK_TYPES constants"
```

---

### Task 3: useShots drinkFilter Parameter

**Files:**
- Modify: `src/hooks/useShots.ts:13-28`

- [ ] **Step 1: Update useShots to accept optional drinkFilter**

Replace the `useShots` function in `src/hooks/useShots.ts` (lines 13–28):

```typescript
export function useShots(coffeeId?: string, roastDateId?: string, drinkFilter?: 'espresso' | 'milk') {
  return useQuery({
    queryKey: ['shots', coffeeId ?? 'all', roastDateId ?? 'all', drinkFilter ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('shots')
        .select('*, coffees(name), roast_dates(roast_date), grinders(name), machines(name), baskets(name, size_g)')
        .order('pulled_at', { ascending: false })
      if (coffeeId) query = query.eq('coffee_id', coffeeId)
      if (roastDateId) query = query.eq('roast_date_id', roastDateId)
      if (drinkFilter === 'espresso') query = query.eq('drink_type', 'espresso')
      if (drinkFilter === 'milk') query = query.neq('drink_type', 'espresso')
      const { data, error } = await query
      if (error) throw error
      return data as ShotWithCoffee[]
    },
  })
}
```

- [ ] **Step 2: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all 49 tests PASS (39 existing + 10 new drinkTypes tests)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useShots.ts
git commit -m "feat: add drinkFilter param to useShots"
```

---

### Task 4: NewShot — Drink Type Chips + Milk Section

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Step 1: Add import**

At the top of `src/pages/NewShot.tsx`, add after the existing imports:

```typescript
import { DRINK_TYPES, MILK_TYPES } from '../utils/drinkTypes'
```

- [ ] **Step 2: Add state variables**

Inside `NewShot()`, after `const [usedLeveler, setUsedLeveler] = useState(false)`:

```typescript
const [drinkType, setDrinkType] = useState('espresso')
const [milkType, setMilkType] = useState('')
const [milkMl, setMilkMl] = useState('')
```

- [ ] **Step 3: Add fields to submit payload**

In `handleSubmit`, inside `createShot.mutateAsync({...})`, add after `used_leveler: usedLeveler,`:

```typescript
drink_type: drinkType,
milk_type: drinkType !== 'espresso' ? (milkType || null) : null,
milk_ml: drinkType !== 'espresso' ? (milkMl ? parseFloat(milkMl) : null) : null,
```

- [ ] **Step 4: Add drink type chips at the top of the form**

In the form JSX, add as the FIRST block (before `{/* Coffee */}`):

```tsx
{/* Getränketyp */}
<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Getränketyp</label>
  <div className="flex flex-wrap gap-2">
    {DRINK_TYPES.map(dt => (
      <button
        key={dt.value}
        type="button"
        onClick={() => setDrinkType(dt.value)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          drinkType === dt.value
            ? 'bg-orange-500 text-white'
            : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
        }`}
      >
        {dt.label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 5: Add milk section**

Add the following block AFTER the brew time section (`{/* Brew time */}`) and BEFORE the prep tools section (`{/* Prep Tools */}`):

```tsx
{/* Milch */}
{drinkType !== 'espresso' && (
  <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
    <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Milch</label>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Sorte</label>
        <select
          value={milkType}
          onChange={e => setMilkType(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">Wählen...</option>
          {MILK_TYPES.map(mt => (
            <option key={mt.value} value={mt.value}>{mt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Menge</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="10"
            value={milkMl}
            onChange={e => setMilkMl(e.target.value)}
            placeholder="120"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <span className="text-sm text-slate-400">ml</span>
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 6: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat: add drink type chips and milk section to NewShot"
```

---

### Task 5: ShotHistory — Drink Filter Tabs

**Files:**
- Modify: `src/pages/ShotHistory.tsx`

- [ ] **Step 1: Update ShotHistory**

Replace the full content of `src/pages/ShotHistory.tsx`:

```typescript
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCoffees } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { ShotCard } from '../components/ShotCard'

type DrinkFilter = 'all' | 'espresso' | 'milk'

const DRINK_FILTER_LABELS: Record<DrinkFilter, string> = {
  all: 'Alle',
  espresso: 'Espresso',
  milk: 'Milchgetränke',
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
          + Neu
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
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid md:grid-cols-2 gap-2">
        {shots.map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10 md:col-span-2">Keine Shots gefunden.</p>
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
git add src/pages/ShotHistory.tsx
git commit -m "feat: add drink filter tabs to ShotHistory"
```

---

### Task 6: ShotCard — Drink Type Badge

**Files:**
- Modify: `src/components/ShotCard.tsx`
- Create: `src/__tests__/ShotCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/ShotCard.test.tsx`:

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

test('zeigt Espresso-Badge für espresso shots', () => {
  renderCard(baseShot)
  expect(screen.getByText('Espresso')).toBeInTheDocument()
})

test('zeigt Cappuccino-Badge für cappuccino shots', () => {
  renderCard({ ...baseShot, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120 })
  expect(screen.getByText('Cappuccino')).toBeInTheDocument()
})

test('zeigt Milchsorte + ml in der Unterzeile bei Milchgetränken', () => {
  renderCard({ ...baseShot, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120 })
  expect(screen.getByText(/Hafermilch/)).toBeInTheDocument()
  expect(screen.getByText(/120 ml/)).toBeInTheDocument()
})

test('zeigt Mahlgrad in der Unterzeile bei Espresso', () => {
  renderCard(baseShot)
  expect(screen.getByText(/Mahlgrad 12/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/ShotCard.test.tsx`
Expected: FAIL — badge not found (ShotCard doesn't show drink_type yet)

- [ ] **Step 3: Update src/components/ShotCard.tsx**

Replace the full file content:

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
    ? new Date(shot.roast_dates.roast_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const subtitle = isMilkDrink
    ? [
        shot.milk_type ? milkTypeLabel(shot.milk_type) : null,
        shot.milk_ml ? `${shot.milk_ml} ml` : null,
        `Mahlgrad ${shot.grind_setting}`,
      ].filter(Boolean).join(' · ')
    : [
        `Mahlgrad ${shot.grind_setting}`,
        shot.brew_time_s ? `${shot.brew_time_s}s` : null,
        roastDate ? `Röstung ${roastDate}` : null,
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/ShotCard.test.tsx`
Expected: 4 tests PASS

- [ ] **Step 5: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ShotCard.tsx src/__tests__/ShotCard.test.tsx
git commit -m "feat: add drink type badge and milk subtitle to ShotCard"
```

---

### Task 7: ShotDetail — Badge + Milk Card + Edit Form

**Files:**
- Modify: `src/pages/ShotDetail.tsx`
- Modify: `src/__tests__/ShotDetail.test.tsx`

- [ ] **Step 1: Add imports to src/pages/ShotDetail.tsx**

At the top of the file, add after the existing imports:

```typescript
import { DRINK_TYPES, MILK_TYPES, drinkTypeLabel, milkTypeLabel } from '../utils/drinkTypes'
```

- [ ] **Step 2: Add drink type badge to view-mode header**

In the view return, replace:

```tsx
<h1 className="text-xl font-bold text-slate-800">{shot.coffees?.name ?? '—'}</h1>
```

with:

```tsx
<div className="flex items-center gap-2 flex-wrap">
  <h1 className="text-xl font-bold text-slate-800">{shot.coffees?.name ?? '—'}</h1>
  {shot.drink_type !== 'espresso' && (
    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
      {drinkTypeLabel(shot.drink_type)}
    </span>
  )}
</div>
```

- [ ] **Step 3: Add milk card to view mode**

In the view return, add after the `{/* Temp + Druck + Röstdatum */}` block and BEFORE `{/* Tasting notes */}`:

```tsx
{/* Milch */}
{shot.drink_type !== 'espresso' && (shot.milk_type || shot.milk_ml) && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Milch</p>
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-800">
        {shot.milk_type ? milkTypeLabel(shot.milk_type) : '—'}
      </span>
      {shot.milk_ml && (
        <span className="text-sm font-semibold text-slate-600">{shot.milk_ml} ml</span>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 4: Add drink type state to ShotEditForm**

Inside `ShotEditForm`, add after `const [pressureBar, setPressureBar] = useState(...)`:

```typescript
const [drinkType, setDrinkType] = useState(shot.drink_type ?? 'espresso')
const [milkType, setMilkType] = useState(shot.milk_type ?? '')
const [milkMl, setMilkMl] = useState(shot.milk_ml != null ? String(shot.milk_ml) : '')
```

- [ ] **Step 5: Add drink fields to ShotEditForm submit payload**

In `handleSubmit`, inside `updateShot.mutateAsync({...})`, add after `basket_id: basketId || null,`:

```typescript
drink_type: drinkType,
milk_type: drinkType !== 'espresso' ? (milkType || null) : null,
milk_ml: drinkType !== 'espresso' ? (milkMl ? parseFloat(milkMl) : null) : null,
```

- [ ] **Step 6: Add drink type chips to ShotEditForm**

In the edit form JSX, add as the FIRST block inside `<form>` (before `{/* Datum & Uhrzeit */}`):

```tsx
{/* Getränketyp */}
<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Getränketyp</label>
  <div className="flex flex-wrap gap-2">
    {DRINK_TYPES.map(dt => (
      <button
        key={dt.value}
        type="button"
        onClick={() => setDrinkType(dt.value)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          drinkType === dt.value
            ? 'bg-orange-500 text-white'
            : 'border border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
        }`}
      >
        {dt.label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 7: Add milk section to ShotEditForm**

In the edit form, add AFTER the brew time block and BEFORE `{/* Prep Tools */}`:

```tsx
{/* Milch */}
{drinkType !== 'espresso' && (
  <div className="border border-orange-200 bg-orange-50 rounded-xl p-3">
    <label className="block text-xs font-semibold text-orange-600 uppercase mb-3">Milch</label>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Sorte</label>
        <select
          value={milkType}
          onChange={e => setMilkType(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">Wählen...</option>
          {MILK_TYPES.map(mt => (
            <option key={mt.value} value={mt.value}>{mt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Menge</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="10"
            value={milkMl}
            onChange={e => setMilkMl(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <span className="text-sm text-slate-400">ml</span>
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 8: Add milk drink test to ShotDetail.test.tsx**

In `src/__tests__/ShotDetail.test.tsx`, add this test after the existing tests:

```typescript
test('zeigt Getränketyp-Badge für Cappuccino', () => {
  vi.mocked(useShot).mockReturnValueOnce({
    data: {
      id: 'shot-1',
      coffee_id: 'coffee-1',
      roast_date_id: null,
      grind_setting: 12.5,
      dose_g: 18,
      yield_g: 36,
      brew_ratio: 2.0,
      pressure_bar: 9,
      brew_time_s: 28,
      temp_c: 93,
      rating: 8,
      body_score: 7,
      acidity_score: 5,
      tasting_notes: null,
      used_rdt: false,
      used_wdt: false,
      used_leveler: false,
      grinder_id: null,
      machine_id: null,
      basket_id: null,
      drink_type: 'cappuccino',
      milk_type: 'hafer',
      milk_ml: 120,
      pulled_at: '2026-05-30T10:00:00Z',
      created_at: '2026-05-30T10:00:00Z',
      coffees: { name: 'Ethiopia Yirgacheffe' },
      roast_dates: null,
      grinders: null,
      machines: null,
      baskets: null,
    },
    isLoading: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  renderDetail()
  expect(screen.getByText('Cappuccino')).toBeInTheDocument()
  expect(screen.getByText('Hafermilch')).toBeInTheDocument()
  expect(screen.getByText('120 ml')).toBeInTheDocument()
})
```

- [ ] **Step 9: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 10: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 11: Build check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npm run build 2>&1 | tail -3`
Expected: `✓ built in ...`

- [ ] **Step 12: Commit**

```bash
git add src/pages/ShotDetail.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: add drink type badge and milk card to ShotDetail view and edit"
```
