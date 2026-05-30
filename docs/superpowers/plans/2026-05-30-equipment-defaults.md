# Equipment-Defaults & Brew-Device Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-Methode Equipment-Favoriten mit neuem Brew-Device-Typ, Standard-Setter UI in der Ausrüstungsseite und automatischer Vorauswahl in NewShot/NewBrew.

**Architecture:** Neue DB-Tabellen `brew_devices` und `equipment_defaults` (FK-basiert, eine Zeile pro Methode). Neuer `DefaultSetter`-Komponent in Equipment.tsx. NewShot/NewBrew lesen Defaults aus `equipment_defaults`, mit Fallback auf `is_favorite`.

**Tech Stack:** React 18, TypeScript, Supabase (PostgreSQL), @tanstack/react-query, Tailwind CSS, Vitest

---

## Voraussetzung: Supabase-Migration ausführen

```sql
CREATE TABLE brew_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  device_type text,
  notes text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE equipment_defaults (
  method text PRIMARY KEY,
  grinder_id uuid REFERENCES grinders(id) ON DELETE SET NULL,
  machine_id uuid REFERENCES machines(id) ON DELETE SET NULL,
  basket_id uuid REFERENCES baskets(id) ON DELETE SET NULL,
  brew_device_id uuid REFERENCES brew_devices(id) ON DELETE SET NULL
);

ALTER TABLE brews ADD COLUMN IF NOT EXISTS brew_device_id uuid REFERENCES brew_devices(id) ON DELETE SET NULL;
```

---

## Dateiübersicht

| Datei | Aktion |
|---|---|
| `src/types/index.ts` | `BrewDevice`, `EquipmentDefault`, `NewBrewDevice`; `Brew` + `brew_device_id` |
| `src/utils/equipmentTypes.ts` | `DEVICE_TYPES`, `deviceTypeLabel()` |
| `src/hooks/useEquipment.ts` | `useBrewDevices` CRUD, `useEquipmentDefaults`, `useSetEquipmentDefault` |
| `src/hooks/useBrews.ts` | Select auf `brew_devices(name)` erweitern; `BrewWithCoffee` + `brew_devices` |
| `src/pages/Equipment.tsx` | Geräte-Tab + `DefaultSetter`-Komponente in alle Listen |
| `src/pages/NewShot.tsx` | Pre-Selection auf `equipment_defaults` umstellen |
| `src/pages/NewBrew.tsx` | `brew_device_id`-Dropdown + `equipment_defaults`-Logik |
| `src/pages/BrewDetail.tsx` | Gerät anzeigen + editierbar |
| `src/__tests__/useEquipment.test.tsx` | Tests für neue Hooks |
| `src/__tests__/BrewCard.test.tsx` | Mock um `brew_device_id` ergänzen |
| `src/__tests__/useBrews.test.tsx` | Mock um `brew_device_id` + `brew_devices` ergänzen |

---

## Task 1: Typen + equipmentTypes

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/utils/equipmentTypes.ts`
- Test: `src/__tests__/equipmentTypes.test.ts` (neue Datei)

- [ ] **Step 1: Failing Test schreiben**

```ts
// src/__tests__/equipmentTypes.test.ts
import { deviceTypeLabel, DEVICE_TYPES } from '../utils/equipmentTypes'

test('DEVICE_TYPES hat 6 Einträge', () => {
  expect(DEVICE_TYPES).toHaveLength(6)
})

test('deviceTypeLabel gibt French Press zurück', () => {
  expect(deviceTypeLabel('french_press')).toBe('French Press')
})

test('deviceTypeLabel gibt V60 zurück', () => {
  expect(deviceTypeLabel('v60')).toBe('V60')
})

test('deviceTypeLabel Fallback für unbekannten Wert', () => {
  expect(deviceTypeLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 2: Test ausführen — erwartet FAIL**

```bash
npx vitest run src/__tests__/equipmentTypes.test.ts
```

Expected: FAIL — "deviceTypeLabel is not a function"

- [ ] **Step 3: equipmentTypes.ts erweitern**

Am Ende von `src/utils/equipmentTypes.ts` anhängen:

```ts
export const DEVICE_TYPES = [
  { value: 'french_press', label: 'French Press' },
  { value: 'v60',          label: 'V60' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'moka_pot',     label: 'Moka Pot' },
  { value: 'chemex',       label: 'Chemex' },
  { value: 'other',        label: 'Sonstiges' },
] as const

export function deviceTypeLabel(value: string): string {
  return DEVICE_TYPES.find(d => d.value === value)?.label ?? value
}
```

- [ ] **Step 4: Typen in types/index.ts ergänzen**

In `src/types/index.ts` nach dem `Basket`-Interface einfügen:

```ts
export interface BrewDevice {
  id: string
  name: string
  brand: string | null
  device_type: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export interface EquipmentDefault {
  method: string
  grinder_id: string | null
  machine_id: string | null
  basket_id: string | null
  brew_device_id: string | null
}

export type NewBrewDevice = Omit<BrewDevice, 'id' | 'created_at'>
```

`Brew`-Interface um `brew_device_id` ergänzen (nach `rating`-Zeile):

```ts
  brew_device_id: string | null
```

- [ ] **Step 5: Test ausführen — erwartet PASS**

```bash
npx vitest run src/__tests__/equipmentTypes.test.ts
```

Expected: 4 passed

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/utils/equipmentTypes.ts src/__tests__/equipmentTypes.test.ts
git commit -m "feat: add BrewDevice and EquipmentDefault types, DEVICE_TYPES util"
```

---

## Task 2: useEquipment.ts — neue Hooks

**Files:**
- Modify: `src/hooks/useEquipment.ts`
- Modify: `src/__tests__/useEquipment.test.tsx`

- [ ] **Step 1: Failing Tests schreiben**

In `src/__tests__/useEquipment.test.tsx` oben ergänzen:

```ts
import {
  useGrinders, useMachines, useBaskets,
  useBrewDevices, useEquipmentDefaults,
} from '../hooks/useEquipment'
import type { Grinder, Machine, Basket, BrewDevice, EquipmentDefault } from '../types'
```

Mock-Objekte hinzufügen (nach `mockBasket`):

```ts
const mockDevice: BrewDevice = {
  id: 'd1', name: 'Hario V60 02', brand: 'Hario',
  device_type: 'v60', notes: null, is_favorite: false,
  created_at: '2026-01-01T00:00:00Z',
}

const mockDefault: EquipmentDefault = {
  method: 'espresso', grinder_id: 'g1',
  machine_id: null, basket_id: null, brew_device_id: null,
}
```

Supabase-Mock um neue Tabellen erweitern:

```ts
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({
          data: table === 'grinders'           ? [mockGrinder]
               : table === 'machines'          ? [mockMachine]
               : table === 'baskets'           ? [mockBasket]
               : table === 'brew_devices'      ? [mockDevice]
               : table === 'equipment_defaults'? [mockDefault]
               : [],
          error: null,
        }),
      }),
    }),
  },
}))
```

Tests hinzufügen (nach bestehenden Tests):

```ts
test('useBrewDevices gibt Geräte zurück', async () => {
  const { result } = renderHook(() => useBrewDevices(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].name).toBe('Hario V60 02')
})

test('useEquipmentDefaults gibt Defaults zurück', async () => {
  const { result } = renderHook(() => useEquipmentDefaults(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data![0].method).toBe('espresso')
  expect(result.current.data![0].grinder_id).toBe('g1')
})
```

- [ ] **Step 2: Test ausführen — erwartet FAIL**

```bash
npx vitest run src/__tests__/useEquipment.test.tsx
```

Expected: FAIL — "useBrewDevices is not a function"

- [ ] **Step 3: Neue Hooks in useEquipment.ts implementieren**

Am Ende von `src/hooks/useEquipment.ts` anhängen:

```ts
import type { Grinder, NewGrinder, Machine, NewMachine, Basket, NewBasket, BrewDevice, NewBrewDevice, EquipmentDefault } from '../types'

// ── Brew Devices ──────────────────────────────────────────────────────────────

export function useBrewDevices() {
  return useQuery({
    queryKey: ['brew_devices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brew_devices').select('*').order('name')
      if (error) throw error
      return data as BrewDevice[]
    },
  })
}

export function useCreateBrewDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: NewBrewDevice) => {
      const { data, error } = await supabase.from('brew_devices').insert(d).select().single()
      if (error) throw error
      return data as BrewDevice
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brew_devices'] }),
  })
}

export function useUpdateBrewDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewBrewDevice> & { id: string }) => {
      const { data, error } = await supabase.from('brew_devices').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as BrewDevice
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brew_devices'] }),
  })
}

export function useDeleteBrewDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brew_devices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brew_devices'] }),
  })
}

// ── Equipment Defaults ────────────────────────────────────────────────────────

export function useEquipmentDefaults() {
  return useQuery({
    queryKey: ['equipment_defaults'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment_defaults').select('*')
      if (error) throw error
      return data as EquipmentDefault[]
    },
  })
}

export function useSetEquipmentDefault() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ method, field, id }: {
      method: string
      field: 'grinder_id' | 'machine_id' | 'basket_id' | 'brew_device_id'
      id: string | null
    }) => {
      const { error } = await supabase
        .from('equipment_defaults')
        .upsert({ method, [field]: id }, { onConflict: 'method' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment_defaults'] }),
  })
}
```

Außerdem den Import-Typ am Anfang von `useEquipment.ts` anpassen:

```ts
import type { Grinder, NewGrinder, Machine, NewMachine, Basket, NewBasket, BrewDevice, NewBrewDevice, EquipmentDefault } from '../types'
```

- [ ] **Step 4: Test ausführen — erwartet PASS**

```bash
npx vitest run src/__tests__/useEquipment.test.tsx
```

Expected: alle bisherigen + 2 neue = alle passed

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useEquipment.ts src/__tests__/useEquipment.test.tsx
git commit -m "feat: add useBrewDevices CRUD and useEquipmentDefaults hooks"
```

---

## Task 3: Equipment.tsx — Geräte-Tab

**Files:**
- Modify: `src/pages/Equipment.tsx`
- Modify: `src/__tests__/Equipment.test.tsx`

- [ ] **Step 1: Failing Test schreiben**

In `src/__tests__/Equipment.test.tsx` Imports erweitern und Test hinzufügen:

```ts
// Am Ende der Datei hinzufügen:
test('zeigt Geräte-Tab wenn angeklickt', async () => {
  renderEquipment()
  const user = userEvent.setup()
  await user.click(screen.getByText('Geräte'))
  expect(screen.getByText('Noch keine Geräte')).toBeInTheDocument()
})
```

Mock um brew_devices erweitern (in der `vi.mock('../hooks/useEquipment', ...)` Sektion):

```ts
  useBrewDevices: () => ({ data: [], isLoading: false }),
  useCreateBrewDevice: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBrewDevice: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteBrewDevice: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useEquipmentDefaults: () => ({ data: [] }),
  useSetEquipmentDefault: () => ({ mutate: vi.fn(), isPending: false }),
```

- [ ] **Step 2: Test ausführen — erwartet FAIL**

```bash
npx vitest run src/__tests__/Equipment.test.tsx
```

Expected: FAIL — "Geräte" nicht im DOM

- [ ] **Step 3: Geräte-Tab und BrewDeviceManager in Equipment.tsx einbauen**

In `src/pages/Equipment.tsx`:

**Imports erweitern** (oben):

```ts
import { deviceTypeLabel, DEVICE_TYPES, GRINDER_TYPES, FUNKTIONSWEISE_TYPES, grinderTypeLabel, funktionsweiseLabel } from '../utils/equipmentTypes'
import {
  useGrinders, useCreateGrinder, useUpdateGrinder, useDeleteGrinder,
  useMachines, useCreateMachine, useUpdateMachine, useDeleteMachine,
  useBaskets, useCreateBasket, useUpdateBasket, useDeleteBasket,
  useBrewDevices, useCreateBrewDevice, useUpdateBrewDevice, useDeleteBrewDevice,
  useEquipmentDefaults, useSetEquipmentDefault,
} from '../hooks/useEquipment'
import type { Grinder, Machine, Basket, BrewDevice, NewBrewDevice } from '../types'
```

**Tab-Typ und TABS-Array erweitern**:

```ts
type Tab = 'grinders' | 'machines' | 'baskets' | 'brew_devices'

const TABS: { key: Tab; label: string }[] = [
  { key: 'grinders',    label: 'Mühlen' },
  { key: 'machines',    label: 'Maschinen' },
  { key: 'baskets',     label: 'Siebe' },
  { key: 'brew_devices', label: 'Geräte' },
]
```

**Equipment-Komponente erweitern** (neuer Tab-Render):

```tsx
{tab === 'brew_devices' && <BrewDeviceManager />}
```

**DefaultSetter-Komponente** (vor `GrinderManager` einfügen):

```tsx
const EQUIPMENT_METHODS: Record<'grinder_id' | 'machine_id' | 'basket_id' | 'brew_device_id', string[]> = {
  grinder_id:     ['espresso', 'french_press', 'v60', 'aeropress', 'moka_pot'],
  machine_id:     ['espresso'],
  basket_id:      ['espresso'],
  brew_device_id: ['french_press', 'v60', 'aeropress', 'moka_pot'],
}

const METHOD_LABELS: Record<string, string> = {
  espresso: 'Espresso', french_press: 'French Press',
  v60: 'V60', aeropress: 'AeroPress', moka_pot: 'Moka Pot',
}

function DefaultSetter({ itemId, field }: {
  itemId: string
  field: keyof typeof EQUIPMENT_METHODS
}) {
  const [open, setOpen] = useState(false)
  const { data: defaults = [] } = useEquipmentDefaults()
  const setDefault = useSetEquipmentDefault()
  const methods = EQUIPMENT_METHODS[field]

  function isActive(method: string) {
    const d = defaults.find(d => d.method === method)
    return d?.[field] === itemId
  }

  function toggle(method: string) {
    setDefault.mutate({ method, field, id: isActive(method) ? null : itemId })
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-[10px] text-slate-400 hover:text-orange-500 font-medium transition-colors"
      >
        Standard für {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {methods.map(method => (
            <button
              key={method}
              type="button"
              onClick={() => toggle(method)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                isActive(method)
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

**DefaultSetter in GrinderList einbauen** — in der Grinder-Karte nach dem `★`-Button:

```tsx
<div className="flex flex-col items-start">
  <button
    aria-label="Favorit"
    onClick={() => updateGrinder.mutate({ id: g.id, is_favorite: !g.is_favorite })}
    className={`text-xl flex-shrink-0 ${g.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
  >
    ★
  </button>
  <DefaultSetter itemId={g.id} field="grinder_id" />
</div>
```

Analog in **MachineList** mit `field="machine_id"`, **BasketList** mit `field="basket_id"`.

**BrewDeviceManager** (vollständig, am Ende der Datei vor dem letzten `}` einfügen):

```tsx
// ── Brew Devices ──────────────────────────────────────────────────────────────

function BrewDeviceManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<BrewDevice | null>(null)
  const { data: devicesLive = [] } = useBrewDevices()
  const selectedDevice = devicesLive.find(d => d.id === selected?.id) ?? selected

  if (view === 'new') return <BrewDeviceForm onBack={() => setView('list')} />
  if (view === 'detail' && selectedDevice) {
    return (
      <BrewDeviceDetail
        device={selectedDevice}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <BrewDeviceList onSelect={d => { setSelected(d); setView('detail') }} onNew={() => setView('new')} />
}

function BrewDeviceList({ onSelect, onNew }: { onSelect: (d: BrewDevice) => void; onNew: () => void }) {
  const { data: devices = [], isLoading } = useBrewDevices()
  const updateDevice = useUpdateBrewDevice()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{devices.length} Gerät{devices.length !== 1 ? 'e' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {devices.map(d => (
          <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <button
                aria-label="Favorit"
                onClick={() => updateDevice.mutate({ id: d.id, is_favorite: !d.is_favorite })}
                className={`text-xl ${d.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
              >
                ★
              </button>
              <DefaultSetter itemId={d.id} field="brew_device_id" />
            </div>
            <button onClick={() => onSelect(d)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{d.name}</p>
              {(d.brand || d.device_type) && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {[d.brand, d.device_type ? deviceTypeLabel(d.device_type) : null].filter(Boolean).join(' · ')}
                </p>
              )}
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && devices.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Geräte. Füge dein erstes hinzu!</p>
        )}
      </div>
    </div>
  )
}

function BrewDeviceDetail({ device, onBack, onDelete }: { device: BrewDevice; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteDevice = useDeleteBrewDevice()
  const updateDevice = useUpdateBrewDevice()

  if (editing) return <BrewDeviceForm device={device} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${device.name}" wirklich löschen?`)) return
    setDeleteError('')
    try {
      await deleteDevice.mutateAsync(device.id)
      onDelete()
    } catch {
      setDeleteError('Löschen fehlgeschlagen.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{device.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateDevice.mutate({ id: device.id, is_favorite: !device.is_favorite })}
            className={`text-2xl ${device.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
      {device.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{device.brand}</p>
        </div>
      )}
      {device.device_type && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Typ</p>
          <p className="text-sm text-slate-800">{deviceTypeLabel(device.device_type)}</p>
        </div>
      )}
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Standard für</p>
        <DefaultSetter itemId={device.id} field="brew_device_id" />
      </div>
      {device.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{device.notes}</p>
        </div>
      )}
    </div>
  )
}

function BrewDeviceForm({ device, onBack }: { device?: BrewDevice; onBack: () => void }) {
  const createDevice = useCreateBrewDevice()
  const updateDevice = useUpdateBrewDevice()
  const [name, setName] = useState(device?.name ?? '')
  const [brand, setBrand] = useState(device?.brand ?? '')
  const [deviceType, setDeviceType] = useState(device?.device_type ?? '')
  const [notes, setNotes] = useState(device?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload: NewBrewDevice = {
      name: name.trim(),
      brand: brand.trim() || null,
      device_type: deviceType || null,
      notes: notes.trim() || null,
      is_favorite: device?.is_favorite ?? false,
    }
    try {
      if (device) {
        await updateDevice.mutateAsync({ id: device.id, ...payload })
      } else {
        await createDevice.mutateAsync(payload)
      }
      onBack()
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  const isPending = createDevice.isPending || updateDevice.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{device ? 'Gerät bearbeiten' : 'Neues Gerät'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name *</label>
          <input
            value={name} onChange={e => setName(e.target.value)} required
            placeholder="Hario V60 02"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Marke</label>
          <input
            value={brand} onChange={e => setBrand(e.target.value)}
            placeholder="Hario"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Typ</label>
          <select
            value={deviceType} onChange={e => setDeviceType(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="">Typ wählen...</option>
            {DEVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notizen</label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : (device ? 'Änderungen speichern' : 'Gerät hinzufügen')}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Test ausführen — erwartet PASS**

```bash
npx vitest run src/__tests__/Equipment.test.tsx
```

Expected: alle bisherigen + 1 neuer = alle passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/Equipment.tsx src/__tests__/Equipment.test.tsx
git commit -m "feat: add Geräte-Tab and DefaultSetter to Equipment page"
```

---

## Task 4: useBrews.ts + Test-Mocks fixen

**Files:**
- Modify: `src/hooks/useBrews.ts`
- Modify: `src/__tests__/BrewCard.test.tsx`
- Modify: `src/__tests__/useBrews.test.tsx`

- [ ] **Step 1: useBrews.ts — brew_devices joinen**

In `src/hooks/useBrews.ts` den Select-Query erweitern:

```ts
export type BrewWithCoffee = Brew & {
  coffees: { name: string } | null
  grinders: { name: string } | null
  brew_devices: { name: string } | null
}
```

In `useBrews()` den Select anpassen:

```ts
let query = supabase
  .from('brews')
  .select('*, coffees(name), grinders(name), brew_devices(name)')
  .order('brewed_at', { ascending: false })
```

In `useBrew()` analog:

```ts
const { data, error } = await supabase
  .from('brews')
  .select('*, coffees(name), grinders(name), brew_devices(name)')
  .eq('id', id)
  .single()
```

- [ ] **Step 2: Test-Mocks fixen**

In `src/__tests__/BrewCard.test.tsx` — `baseBrew` um neue Felder ergänzen:

```ts
  brew_device_id: null,
  // brew_devices property ist Teil von BrewWithCoffee:
  brew_devices: null,
```

In `src/__tests__/useBrews.test.tsx` — `mockBrew` um neue Felder ergänzen (nach `grinders: null`):

```ts
  brew_device_id: null,
  brew_devices: null,
```

Der Supabase-Mock bleibt unverändert — er gibt `mockBrew` zurück, das jetzt die neuen Felder enthält.

- [ ] **Step 3: Alle Tests ausführen**

```bash
npx vitest run
```

Expected: alle passed (Anzahl wie vorher + neue)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useBrews.ts src/__tests__/BrewCard.test.tsx src/__tests__/useBrews.test.tsx
git commit -m "feat: join brew_devices in useBrews, fix test mocks for brew_device_id"
```

---

## Task 5: NewShot.tsx — equipment_defaults Pre-Selection

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Step 1: Imports und State erweitern**

In `src/pages/NewShot.tsx`:

Import erweitern:

```ts
import { useGrinders, useMachines, useBaskets, useEquipmentDefaults } from '../hooks/useEquipment'
```

Nach den bestehenden Daten-Hooks:

```ts
const { data: defaults = [] } = useEquipmentDefaults()
```

- [ ] **Step 2: Die drei alten useEffects ersetzen**

Die drei Zeilen:
```ts
useEffect(() => { if (!grinderId) { const f = grinders.find(g => g.is_favorite); if (f) setGrinderId(f.id) } }, [grinders])
useEffect(() => { if (!machineId) { const f = machines.find(m => m.is_favorite); if (f) setMachineId(f.id) } }, [machines])
useEffect(() => { if (!basketId)  { const f = baskets.find(b => b.is_favorite);  if (f) setBasketId(b.id)  } }, [baskets])
```

ersetzen durch:

```ts
useEffect(() => {
  const d = defaults.find(d => d.method === 'espresso')
  if (!grinderId) {
    const id = d?.grinder_id ?? grinders.find(g => g.is_favorite)?.id
    if (id) setGrinderId(id)
  }
  if (!machineId) {
    const id = d?.machine_id ?? machines.find(m => m.is_favorite)?.id
    if (id) setMachineId(id)
  }
  if (!basketId) {
    const id = d?.basket_id ?? baskets.find(b => b.is_favorite)?.id
    if (id) setBasketId(id)
  }
}, [defaults, grinders, machines, baskets])
```

- [ ] **Step 3: Build-Check**

```bash
npm run build 2>&1 | grep -E "error|✓"
```

Expected: `✓ built`

- [ ] **Step 4: Tests ausführen**

```bash
npx vitest run
```

Expected: alle passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat: use equipment_defaults for NewShot pre-selection, fallback to is_favorite"
```

---

## Task 6: NewBrew + BrewDetail — brew_device Integration

**Files:**
- Modify: `src/pages/NewBrew.tsx`
- Modify: `src/pages/BrewDetail.tsx`

- [ ] **Step 1: NewBrew.tsx — State + Imports + Dropdown**

Imports erweitern:

```ts
import { useGrinders, useBrewDevices, useEquipmentDefaults } from '../hooks/useEquipment'
```

State hinzufügen (nach `grinderId`):

```ts
const [brewDeviceId, setBrewDeviceId] = useState('')
```

Daten-Hooks hinzufügen (nach `useGrinders`):

```ts
const { data: brewDevices = [] } = useBrewDevices()
const { data: defaults = [] } = useEquipmentDefaults()
```

- [ ] **Step 2: NewBrew.tsx — useEffect für Defaults**

Den bestehenden `useEffect` für grinderId ersetzen durch:

```ts
useEffect(() => {
  const d = defaults.find(d => d.method === brewMethod)
  if (d?.grinder_id) setGrinderId(d.grinder_id)
  if (d?.brew_device_id) setBrewDeviceId(d.brew_device_id)
  else setBrewDeviceId('')
}, [defaults, brewMethod])
```

- [ ] **Step 3: NewBrew.tsx — Gerät-Dropdown hinzufügen**

Nach dem Mühle-Dropdown (nach `</div>` der Mühlen-Sektion) einfügen:

```tsx
{/* Gerät */}
{brewDevices.length > 0 && (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Gerät</label>
    <select
      value={brewDeviceId}
      onChange={e => setBrewDeviceId(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
    >
      <option value="">Kein Gerät</option>
      {brewDevices.map(d => (
        <option key={d.id} value={d.id}>{d.name}{d.brand ? ` / ${d.brand}` : ''}</option>
      ))}
    </select>
  </div>
)}
```

- [ ] **Step 4: NewBrew.tsx — brew_device_id in submit payload**

In `createBrew.mutateAsync({...})` hinzufügen:

```ts
brew_device_id: brewDeviceId || null,
```

- [ ] **Step 5: BrewDetail.tsx — State + View + Edit**

In `src/pages/BrewDetail.tsx`:

Import erweitern:

```ts
import { useGrinders, useBrewDevices } from '../hooks/useEquipment'
```

State hinzufügen (nach `rating`-State):

```ts
const [brewDeviceId, setBrewDeviceId] = useState(brew.brew_device_id ?? '')
```

Daten-Hook hinzufügen:

```ts
const { data: brewDevices = [] } = useBrewDevices()
```

**View-Mode** — nach dem Rating-Block den Gerät-Badge einfügen (wenn `brew.brew_device_id` gesetzt):

```tsx
{brew.brew_device_id && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 flex justify-between items-center">
    <p className="text-xs text-slate-400 uppercase font-semibold">Gerät</p>
    <p className="text-sm font-bold text-slate-800">
      {brewDevices.find(d => d.id === brew.brew_device_id)?.name ?? '—'}
    </p>
  </div>
)}
```

**Edit-Mode** — nach dem Bewertungs-Block einfügen:

```tsx
{/* Gerät */}
{brewDevices.length > 0 && (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Gerät</label>
    <select
      value={brewDeviceId}
      onChange={e => setBrewDeviceId(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
    >
      <option value="">Kein Gerät</option>
      {brewDevices.map(d => (
        <option key={d.id} value={d.id}>{d.name}{d.brand ? ` / ${d.brand}` : ''}</option>
      ))}
    </select>
  </div>
)}
```

In `updateBrew.mutateAsync({...})` hinzufügen:

```ts
brew_device_id: brewDeviceId || null,
```

- [ ] **Step 6: Build + Tests**

```bash
npm run build 2>&1 | grep -E "error|✓"
npx vitest run 2>&1 | tail -5
```

Expected: build `✓`, alle Tests passed

- [ ] **Step 7: Commit**

```bash
git add src/pages/NewBrew.tsx src/pages/BrewDetail.tsx
git commit -m "feat: add brew_device dropdown to NewBrew and BrewDetail with equipment_defaults pre-selection"
```

---

## Abschluss

- [ ] **Alle Tests final**

```bash
npx vitest run
```

Expected: alle passed

- [ ] **Push**

```bash
git push origin main
```

- [ ] **Manuelle Prüfliste**
  - [ ] Gerät in `/ausruestung` erstellen (z.B. "Hario V60 02", Typ V60)
  - [ ] Über "Standard für ▾" als Standard für V60 setzen
  - [ ] NewBrew öffnen, Methode V60 wählen → Gerät wird vorausgewählt
  - [ ] Methode auf French Press wechseln → anderer Default (oder leer)
  - [ ] NewShot öffnen → Espresso-Defaults aus equipment_defaults vorausgewählt
  - [ ] Brew speichern, in BrewDetail öffnen → Gerät angezeigt
