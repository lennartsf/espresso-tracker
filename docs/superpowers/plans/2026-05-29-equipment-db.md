# Equipment DB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 equipment tables (grinders/machines/baskets) with full CRUD + favorite-marking UI, and optional equipment selectors in NewShot and ShotDetail.

**Architecture:** New `useEquipment.ts` hook file mirrors `useCoffees.ts` pattern (useQuery + useMutation per entity). New `Equipment.tsx` page uses 3 sub-tabs with list/detail/form state identical to CoffeeManager. Shot type gains 3 nullable FK fields; NewShot + ShotDetail gain optional "Ausrüstung" blocks. Equipment is hidden in NewShot until at least one item exists (no empty dropdowns).

**Tech Stack:** React 18, TypeScript, @tanstack/react-query, Supabase (PostgreSQL), Tailwind CSS, Vitest + @testing-library/react

**TODO (Phase 2):** Pre-select favorite items in NewShot dropdowns (read `is_favorite: true` items as initial state).

---

### Task 1: SQL Migrations + TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Run SQL migrations in Supabase**

Run the following in the Supabase SQL Editor (Dashboard → SQL Editor):

```sql
CREATE TABLE grinders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  notes text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  notes text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE baskets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  size_g float4,
  notes text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shots ADD COLUMN grinder_id uuid REFERENCES grinders(id) ON DELETE SET NULL;
ALTER TABLE shots ADD COLUMN machine_id uuid REFERENCES machines(id) ON DELETE SET NULL;
ALTER TABLE shots ADD COLUMN basket_id uuid REFERENCES baskets(id) ON DELETE SET NULL;
```

- [ ] **Step 2: Add Grinder / Machine / Basket interfaces to src/types/index.ts**

Append after the existing `export type NewShot = Omit<Shot, 'id' | 'created_at'>` line:

```typescript
export interface Grinder {
  id: string
  name: string
  brand: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export interface Machine {
  id: string
  name: string
  brand: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export interface Basket {
  id: string
  name: string
  brand: string | null
  size_g: number | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export type NewGrinder = Omit<Grinder, 'id' | 'created_at'>
export type NewMachine = Omit<Machine, 'id' | 'created_at'>
export type NewBasket = Omit<Basket, 'id' | 'created_at'>
```

- [ ] **Step 3: Add 3 nullable FK fields to the Shot interface in src/types/index.ts**

In the `Shot` interface, add after `used_leveler: boolean`:

```typescript
grinder_id: string | null
machine_id: string | null
basket_id: string | null
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Grinder/Machine/Basket types and Shot equipment FK fields"
```

---

### Task 2: useEquipment Hooks

**Files:**
- Create: `src/hooks/useEquipment.ts`
- Create: `src/__tests__/useEquipment.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/useEquipment.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { ReactNode } from 'react'
import { useGrinders, useMachines, useBaskets } from '../hooks/useEquipment'
import type { Grinder, Machine, Basket } from '../types'

const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
const mockBasket: Basket = {
  id: 'b1', name: 'VST 18g', brand: 'VST', size_g: 18,
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({
          data: table === 'grinders' ? [mockGrinder]
               : table === 'machines' ? [mockMachine]
               : [mockBasket],
          error: null,
        }),
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

test('useGrinders gibt Mühlen zurück', async () => {
  const { result } = renderHook(() => useGrinders(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].name).toBe('Niche Zero')
})

test('useMachines gibt Maschinen zurück', async () => {
  const { result } = renderHook(() => useMachines(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data![0].name).toBe('Rancilio Silvia')
  expect(result.current.data![0].is_favorite).toBe(true)
})

test('useBaskets gibt Siebe zurück', async () => {
  const { result } = renderHook(() => useBaskets(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data![0].name).toBe('VST 18g')
  expect(result.current.data![0].size_g).toBe(18)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/useEquipment.test.ts`
Expected: FAIL — "Cannot find module '../hooks/useEquipment'"

- [ ] **Step 3: Create src/hooks/useEquipment.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Grinder, NewGrinder, Machine, NewMachine, Basket, NewBasket } from '../types'

// ── Grinders ──────────────────────────────────────────────────────────────────

export function useGrinders() {
  return useQuery({
    queryKey: ['grinders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('grinders').select('*').order('name')
      if (error) throw error
      return data as Grinder[]
    },
  })
}

export function useCreateGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (g: NewGrinder) => {
      const { data, error } = await supabase.from('grinders').insert(g).select().single()
      if (error) throw error
      return data as Grinder
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grinders'] }),
  })
}

export function useUpdateGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewGrinder> & { id: string }) => {
      const { data, error } = await supabase.from('grinders').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Grinder
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grinders'] }),
  })
}

export function useDeleteGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('grinders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grinders'] }),
  })
}

// ── Machines ──────────────────────────────────────────────────────────────────

export function useMachines() {
  return useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('*').order('name')
      if (error) throw error
      return data as Machine[]
    },
  })
}

export function useCreateMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: NewMachine) => {
      const { data, error } = await supabase.from('machines').insert(m).select().single()
      if (error) throw error
      return data as Machine
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  })
}

export function useUpdateMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewMachine> & { id: string }) => {
      const { data, error } = await supabase.from('machines').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Machine
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  })
}

export function useDeleteMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('machines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  })
}

// ── Baskets ───────────────────────────────────────────────────────────────────

export function useBaskets() {
  return useQuery({
    queryKey: ['baskets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('baskets').select('*').order('name')
      if (error) throw error
      return data as Basket[]
    },
  })
}

export function useCreateBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (b: NewBasket) => {
      const { data, error } = await supabase.from('baskets').insert(b).select().single()
      if (error) throw error
      return data as Basket
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['baskets'] }),
  })
}

export function useUpdateBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewBasket> & { id: string }) => {
      const { data, error } = await supabase.from('baskets').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Basket
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['baskets'] }),
  })
}

export function useDeleteBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('baskets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['baskets'] }),
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/useEquipment.test.ts`
Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useEquipment.ts src/__tests__/useEquipment.test.ts
git commit -m "feat: add useEquipment hooks (grinders/machines/baskets)"
```

---

### Task 3: Equipment Page

**Files:**
- Create: `src/pages/Equipment.tsx`
- Create: `src/__tests__/Equipment.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/Equipment.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { Equipment } from '../pages/Equipment'
import type { Grinder, Machine, Basket } from '../types'

const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
const mockBasket: Basket = {
  id: 'b1', name: 'VST 18g', brand: 'VST', size_g: 18,
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}

vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [mockGrinder], isLoading: false }),
  useCreateGrinder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateGrinder: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteGrinder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMachines: () => ({ data: [mockMachine], isLoading: false }),
  useCreateMachine: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMachine: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteMachine: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBaskets: () => ({ data: [mockBasket], isLoading: false }),
  useCreateBasket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBasket: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteBasket: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

function renderEquipment() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Equipment />
    </QueryClientProvider>
  )
}

test('zeigt Mühlen-Tab standardmäßig', () => {
  renderEquipment()
  expect(screen.getByText('Niche Zero')).toBeInTheDocument()
})

test('wechselt zu Maschinen-Tab', async () => {
  renderEquipment()
  await userEvent.click(screen.getByRole('button', { name: 'Maschinen' }))
  expect(screen.getByText('Rancilio Silvia')).toBeInTheDocument()
})

test('wechselt zu Siebe-Tab', async () => {
  renderEquipment()
  await userEvent.click(screen.getByRole('button', { name: 'Siebe' }))
  expect(screen.getByText('VST 18g')).toBeInTheDocument()
})

test('zeigt Neu-Formular nach Klick auf + Neu', async () => {
  renderEquipment()
  await userEvent.click(screen.getByRole('button', { name: '+ Neu' }))
  expect(screen.getByPlaceholderText('Name *')).toBeInTheDocument()
})

test('zeigt Favorit-Stern in der Liste', () => {
  renderEquipment()
  expect(screen.getByRole('button', { name: 'Favorit' })).toBeInTheDocument()
})

test('zeigt Detail-Ansicht nach Klick auf Item-Name', async () => {
  renderEquipment()
  await userEvent.click(screen.getByText('Niche Zero'))
  expect(screen.getByRole('button', { name: 'Bearbeiten' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/Equipment.test.tsx`
Expected: FAIL — "Cannot find module '../pages/Equipment'"

- [ ] **Step 3: Create src/pages/Equipment.tsx**

```tsx
import { useState } from 'react'
import {
  useGrinders, useCreateGrinder, useUpdateGrinder, useDeleteGrinder,
  useMachines, useCreateMachine, useUpdateMachine, useDeleteMachine,
  useBaskets, useCreateBasket, useUpdateBasket, useDeleteBasket,
} from '../hooks/useEquipment'
import type { Grinder, Machine, Basket } from '../types'

type Tab = 'grinders' | 'machines' | 'baskets'
type View = 'list' | 'detail' | 'new'

const TABS: { key: Tab; label: string }[] = [
  { key: 'grinders', label: 'Mühlen' },
  { key: 'machines', label: 'Maschinen' },
  { key: 'baskets', label: 'Siebe' },
]

export function Equipment() {
  const [tab, setTab] = useState<Tab>('grinders')

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">⚙️ Ausrüstung</h1>

      <div className="flex border-b border-slate-200 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'grinders' && <GrinderManager />}
      {tab === 'machines' && <MachineManager />}
      {tab === 'baskets' && <BasketManager />}
    </div>
  )
}

// ── Grinders ──────────────────────────────────────────────────────────────────

function GrinderManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Grinder | null>(null)

  if (view === 'new') return <GrinderForm onBack={() => setView('list')} />
  if (view === 'detail' && selected) {
    return (
      <GrinderDetail
        grinder={selected}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <GrinderList onSelect={g => { setSelected(g); setView('detail') }} onNew={() => setView('new')} />
}

function GrinderList({ onSelect, onNew }: { onSelect: (g: Grinder) => void; onNew: () => void }) {
  const { data: grinders = [], isLoading } = useGrinders()
  const updateGrinder = useUpdateGrinder()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{grinders.length} Mühle{grinders.length !== 1 ? 'n' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {grinders.map(g => (
          <div key={g.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
              aria-label="Favorit"
              onClick={() => updateGrinder.mutate({ id: g.id, is_favorite: !g.is_favorite })}
              className={`text-xl flex-shrink-0 ${g.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
            >
              ★
            </button>
            <button onClick={() => onSelect(g)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{g.name}</p>
              {g.brand && <p className="text-xs text-slate-400 mt-0.5">{g.brand}</p>}
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && grinders.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Mühlen. Füge deine erste hinzu!</p>
        )}
      </div>
    </div>
  )
}

function GrinderDetail({ grinder, onBack, onDelete }: { grinder: Grinder; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const deleteGrinder = useDeleteGrinder()
  const updateGrinder = useUpdateGrinder()

  if (editing) return <GrinderForm grinder={grinder} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${grinder.name}" wirklich löschen?`)) return
    await deleteGrinder.mutateAsync(grinder.id)
    onDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{grinder.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateGrinder.mutate({ id: grinder.id, is_favorite: !grinder.is_favorite })}
            className={`text-2xl ${grinder.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {grinder.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{grinder.brand}</p>
        </div>
      )}
      {grinder.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{grinder.notes}</p>
        </div>
      )}
    </div>
  )
}

function GrinderForm({ grinder, onBack }: { grinder?: Grinder; onBack: () => void }) {
  const createGrinder = useCreateGrinder()
  const updateGrinder = useUpdateGrinder()
  const [name, setName] = useState(grinder?.name ?? '')
  const [brand, setBrand] = useState(grinder?.brand ?? '')
  const [notes, setNotes] = useState(grinder?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = { name: name.trim(), brand: brand.trim() || null, notes: notes.trim() || null, is_favorite: grinder?.is_favorite ?? false }
    if (grinder) {
      await updateGrinder.mutateAsync({ id: grinder.id, ...payload })
    } else {
      await createGrinder.mutateAsync(payload)
    }
    onBack()
  }

  const isPending = createGrinder.isPending || updateGrinder.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{grinder ? 'Mühle bearbeiten' : 'Neue Mühle'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name *"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : grinder ? 'Änderungen speichern' : 'Mühle speichern'}
        </button>
      </form>
    </div>
  )
}

// ── Machines ──────────────────────────────────────────────────────────────────

function MachineManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Machine | null>(null)

  if (view === 'new') return <MachineForm onBack={() => setView('list')} />
  if (view === 'detail' && selected) {
    return (
      <MachineDetail
        machine={selected}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <MachineList onSelect={m => { setSelected(m); setView('detail') }} onNew={() => setView('new')} />
}

function MachineList({ onSelect, onNew }: { onSelect: (m: Machine) => void; onNew: () => void }) {
  const { data: machines = [], isLoading } = useMachines()
  const updateMachine = useUpdateMachine()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{machines.length} Maschine{machines.length !== 1 ? 'n' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {machines.map(m => (
          <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
              aria-label="Favorit"
              onClick={() => updateMachine.mutate({ id: m.id, is_favorite: !m.is_favorite })}
              className={`text-xl flex-shrink-0 ${m.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
            >
              ★
            </button>
            <button onClick={() => onSelect(m)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{m.name}</p>
              {m.brand && <p className="text-xs text-slate-400 mt-0.5">{m.brand}</p>}
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && machines.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Maschinen. Füge deine erste hinzu!</p>
        )}
      </div>
    </div>
  )
}

function MachineDetail({ machine, onBack, onDelete }: { machine: Machine; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const deleteMachine = useDeleteMachine()
  const updateMachine = useUpdateMachine()

  if (editing) return <MachineForm machine={machine} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${machine.name}" wirklich löschen?`)) return
    await deleteMachine.mutateAsync(machine.id)
    onDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{machine.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateMachine.mutate({ id: machine.id, is_favorite: !machine.is_favorite })}
            className={`text-2xl ${machine.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {machine.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{machine.brand}</p>
        </div>
      )}
      {machine.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{machine.notes}</p>
        </div>
      )}
    </div>
  )
}

function MachineForm({ machine, onBack }: { machine?: Machine; onBack: () => void }) {
  const createMachine = useCreateMachine()
  const updateMachine = useUpdateMachine()
  const [name, setName] = useState(machine?.name ?? '')
  const [brand, setBrand] = useState(machine?.brand ?? '')
  const [notes, setNotes] = useState(machine?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = { name: name.trim(), brand: brand.trim() || null, notes: notes.trim() || null, is_favorite: machine?.is_favorite ?? false }
    if (machine) {
      await updateMachine.mutateAsync({ id: machine.id, ...payload })
    } else {
      await createMachine.mutateAsync(payload)
    }
    onBack()
  }

  const isPending = createMachine.isPending || updateMachine.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{machine ? 'Maschine bearbeiten' : 'Neue Maschine'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name *"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : machine ? 'Änderungen speichern' : 'Maschine speichern'}
        </button>
      </form>
    </div>
  )
}

// ── Baskets ───────────────────────────────────────────────────────────────────

function BasketManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Basket | null>(null)

  if (view === 'new') return <BasketForm onBack={() => setView('list')} />
  if (view === 'detail' && selected) {
    return (
      <BasketDetail
        basket={selected}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <BasketList onSelect={b => { setSelected(b); setView('detail') }} onNew={() => setView('new')} />
}

function BasketList({ onSelect, onNew }: { onSelect: (b: Basket) => void; onNew: () => void }) {
  const { data: baskets = [], isLoading } = useBaskets()
  const updateBasket = useUpdateBasket()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{baskets.length} Sieb{baskets.length !== 1 ? 'e' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {baskets.map(b => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
              aria-label="Favorit"
              onClick={() => updateBasket.mutate({ id: b.id, is_favorite: !b.is_favorite })}
              className={`text-xl flex-shrink-0 ${b.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
            >
              ★
            </button>
            <button onClick={() => onSelect(b)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{b.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {[b.brand, b.size_g ? `${b.size_g}g` : null].filter(Boolean).join(' · ')}
              </p>
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && baskets.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Siebe. Füge dein erstes hinzu!</p>
        )}
      </div>
    </div>
  )
}

function BasketDetail({ basket, onBack, onDelete }: { basket: Basket; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const deleteBasket = useDeleteBasket()
  const updateBasket = useUpdateBasket()

  if (editing) return <BasketForm basket={basket} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${basket.name}" wirklich löschen?`)) return
    await deleteBasket.mutateAsync(basket.id)
    onDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{basket.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateBasket.mutate({ id: basket.id, is_favorite: !basket.is_favorite })}
            className={`text-2xl ${basket.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {basket.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{basket.brand}</p>
        </div>
      )}
      {basket.size_g !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Größe</p>
          <p className="text-sm text-slate-800">{basket.size_g} g</p>
        </div>
      )}
      {basket.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{basket.notes}</p>
        </div>
      )}
    </div>
  )
}

function BasketForm({ basket, onBack }: { basket?: Basket; onBack: () => void }) {
  const createBasket = useCreateBasket()
  const updateBasket = useUpdateBasket()
  const [name, setName] = useState(basket?.name ?? '')
  const [brand, setBrand] = useState(basket?.brand ?? '')
  const [sizeG, setSizeG] = useState(basket?.size_g ? String(basket.size_g) : '')
  const [notes, setNotes] = useState(basket?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = {
      name: name.trim(),
      brand: brand.trim() || null,
      size_g: sizeG ? parseFloat(sizeG) : null,
      notes: notes.trim() || null,
      is_favorite: basket?.is_favorite ?? false,
    }
    if (basket) {
      await updateBasket.mutateAsync({ id: basket.id, ...payload })
    } else {
      await createBasket.mutateAsync(payload)
    }
    onBack()
  }

  const isPending = createBasket.isPending || updateBasket.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{basket ? 'Sieb bearbeiten' : 'Neues Sieb'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name *"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <div className="flex items-center gap-2">
          <input type="number" step="0.5" value={sizeG} onChange={e => setSizeG(e.target.value)} placeholder="Größe"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <span className="text-sm text-slate-400">g</span>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : basket ? 'Änderungen speichern' : 'Sieb speichern'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/Equipment.test.tsx`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Equipment.tsx src/__tests__/Equipment.test.tsx
git commit -m "feat: add Equipment page with Mühlen/Maschinen/Siebe sub-tabs"
```

---

### Task 4: Navigation + Route

**Files:**
- Modify: `src/components/Layout.tsx:3-9`
- Modify: `src/App.tsx:1-32`

- [ ] **Step 1: Add Equipment to navItems in src/components/Layout.tsx**

Replace the `navItems` array (lines 3–9) with:

```typescript
const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/shots', label: 'Shots', icon: '📋' },
  { to: '/analyse', label: 'Analyse', icon: '📊' },
  { to: '/kaffee', label: 'Kaffee', icon: '☕' },
  { to: '/roasters', label: 'Röstereien', icon: '📍' },
  { to: '/ausruestung', label: 'Ausrüstung', icon: '⚙️' },
]
```

- [ ] **Step 2: Add route in src/App.tsx**

Add import after the existing `Roasters` import line:
```typescript
import { Equipment } from './pages/Equipment'
```

Add route inside `<Route element={<Layout />}>`, after the `roasters` route:
```tsx
<Route path="ausruestung" element={<Equipment />} />
```

- [ ] **Step 3: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx src/App.tsx
git commit -m "feat: add Ausrüstung route and nav item"
```

---

### Task 5: NewShot — Optional Equipment Dropdowns

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Step 1: Add equipment imports and hooks at the top of NewShot.tsx**

Add to the import at the top of `src/pages/NewShot.tsx`:
```typescript
import { useGrinders, useMachines, useBaskets } from '../hooks/useEquipment'
```

Inside `NewShot()`, add after `const { data: roastDates = [] } = useRoastDates(coffeeId)`:
```typescript
const { data: grinders = [] } = useGrinders()
const { data: machines = [] } = useMachines()
const { data: baskets = [] } = useBaskets()
```

Add state after the `usedLeveler` state declarations:
```typescript
const [grinderId, setGrinderId] = useState('')
const [machineId, setMachineId] = useState('')
const [basketId, setBasketId] = useState('')
```

- [ ] **Step 2: Add equipment fields to the submit payload**

In `handleSubmit`, inside `createShot.mutateAsync({...})`, add after `used_leveler: usedLeveler,`:
```typescript
grinder_id: grinderId || null,
machine_id: machineId || null,
basket_id: basketId || null,
```

- [ ] **Step 3: Add equipment UI block to the form**

In `src/pages/NewShot.tsx`, add the following block after the closing `</div>` of the "Prep Tools" section (after `used_leveler` checkbox, before the Ratings section):

```tsx
{/* Ausrüstung */}
{(grinders.length > 0 || machines.length > 0 || baskets.length > 0) && (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Ausrüstung</label>
    <div className="grid gap-2">
      {grinders.length > 0 && (
        <select
          value={grinderId}
          onChange={e => setGrinderId(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">Mühle (optional)</option>
          {grinders.map(g => (
            <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
          ))}
        </select>
      )}
      {machines.length > 0 && (
        <select
          value={machineId}
          onChange={e => setMachineId(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">Maschine (optional)</option>
          {machines.map(m => (
            <option key={m.id} value={m.id}>{m.name}{m.brand ? ` / ${m.brand}` : ''}</option>
          ))}
        </select>
      )}
      {baskets.length > 0 && (
        <select
          value={basketId}
          onChange={e => setBasketId(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
        >
          <option value="">Sieb (optional)</option>
          {baskets.map(b => (
            <option key={b.id} value={b.id}>{b.name}{b.size_g ? ` ${b.size_g}g` : ''}</option>
          ))}
        </select>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 4: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat: add optional Ausrüstung dropdowns to NewShot"
```

---

### Task 6: ShotDetail — Equipment Display + Edit

**Files:**
- Modify: `src/hooks/useShots.ts:5-8,49`
- Modify: `src/pages/ShotDetail.tsx`
- Modify: `src/__tests__/ShotDetail.test.tsx`

- [ ] **Step 1: Update ShotWithCoffee type in src/hooks/useShots.ts**

Replace lines 5–8 (the `ShotWithCoffee` type):

```typescript
export type ShotWithCoffee = Shot & {
  coffees: { name: string } | null
  roast_dates: { roast_date: string } | null
  grinders: { name: string } | null
  machines: { name: string } | null
  baskets: { name: string; size_g: number | null } | null
}
```

- [ ] **Step 2: Update both select strings in src/hooks/useShots.ts**

In `useShots` (line 16), replace:
```typescript
.select('*, coffees(name), roast_dates(roast_date)')
```
with:
```typescript
.select('*, coffees(name), roast_dates(roast_date), grinders(name), machines(name), baskets(name, size_g)')
```

In `useShot` (line 49), replace the same string:
```typescript
.select('*, coffees(name), roast_dates(roast_date), grinders(name), machines(name), baskets(name, size_g)')
```

- [ ] **Step 3: Add equipment display block to ShotDetail view mode**

In `src/pages/ShotDetail.tsx`, add the following block after the RDT/WDT/Leveler chips block (after line 175, before the closing `</div>` at line 176):

```tsx
{/* Equipment */}
{(shot.grinders || shot.machines || shot.baskets) && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mt-3">
    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Ausrüstung</p>
    <div className="flex flex-wrap gap-2">
      {shot.grinders && (
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
          ⚙️ {shot.grinders.name}
        </span>
      )}
      {shot.machines && (
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
          🔧 {shot.machines.name}
        </span>
      )}
      {shot.baskets && (
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
          🫙 {shot.baskets.name}{shot.baskets.size_g ? ` ${shot.baskets.size_g}g` : ''}
        </span>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 4: Add equipment imports, state, and dropdowns to ShotEditForm**

In `src/pages/ShotDetail.tsx`, add import at the top of the file:
```typescript
import { useGrinders, useMachines, useBaskets } from '../hooks/useEquipment'
```

Inside `ShotEditForm`, add hook calls after `const { data: coffees = [] } = useCoffees()`:
```typescript
const { data: grinders = [] } = useGrinders()
const { data: machines = [] } = useMachines()
const { data: baskets = [] } = useBaskets()
```

Add state after the `pressureBar` state (after line 207):
```typescript
const [grinderId, setGrinderId] = useState(shot.grinder_id ?? '')
const [machineId, setMachineId] = useState(shot.machine_id ?? '')
const [basketId, setBasketId] = useState(shot.basket_id ?? '')
```

In `handleSubmit`, add to the `updateShot.mutateAsync({...})` payload after `used_leveler: usedLeveler,`:
```typescript
grinder_id: grinderId || null,
machine_id: machineId || null,
basket_id: basketId || null,
```

Add equipment UI block after the closing `</div>` of "Prep Tools" section (after line 408, before `{/* Ratings */}`):
```tsx
{/* Ausrüstung */}
<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Ausrüstung</label>
  <div className="grid gap-2">
    <select
      value={grinderId}
      onChange={e => setGrinderId(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
    >
      <option value="">Mühle (optional)</option>
      {grinders.map(g => (
        <option key={g.id} value={g.id}>{g.name}{g.brand ? ` / ${g.brand}` : ''}</option>
      ))}
    </select>
    <select
      value={machineId}
      onChange={e => setMachineId(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
    >
      <option value="">Maschine (optional)</option>
      {machines.map(m => (
        <option key={m.id} value={m.id}>{m.name}{m.brand ? ` / ${m.brand}` : ''}</option>
      ))}
    </select>
    <select
      value={basketId}
      onChange={e => setBasketId(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
    >
      <option value="">Sieb (optional)</option>
      {baskets.map(b => (
        <option key={b.id} value={b.id}>{b.name}{b.size_g ? ` ${b.size_g}g` : ''}</option>
      ))}
    </select>
  </div>
</div>
```

- [ ] **Step 5: Update ShotDetail test mock to include new fields**

In `src/__tests__/ShotDetail.test.tsx`, add to the shot mock object (after `used_leveler: false,`):
```typescript
grinder_id: null,
machine_id: null,
basket_id: null,
grinders: null,
machines: null,
baskets: null,
```

Add useEquipment mock after the existing `vi.mock('../hooks/useCoffees', ...)` call:
```typescript
vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [] }),
  useMachines: () => ({ data: [] }),
  useBaskets: () => ({ data: [] }),
}))
```

- [ ] **Step 6: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 7: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useShots.ts src/pages/ShotDetail.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: show and edit equipment in ShotDetail"
```
