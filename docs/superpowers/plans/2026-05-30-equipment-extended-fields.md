# Equipment Extended Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add detailed technical specs to grinders (Mahlscheibentyp, mm, Watt, stufenlos, Behälter) and machines (Funktionsweise, Brühgruppe) in the Equipment page.

**Architecture:** Three SQL ALTERs, TypeScript type extensions, a new `equipmentTypes.ts` utility with label constants, and targeted additions to the 4 affected components in `Equipment.tsx` (GrinderForm, GrinderDetail, MachineForm, MachineDetail). No other files change.

**Tech Stack:** React 18, TypeScript, Supabase, Tailwind CSS, Vitest + @testing-library/react

---

### Task 1: SQL Migrations + TypeScript Types + Fix Test Mocks

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/__tests__/Equipment.test.tsx`
- Modify: `src/__tests__/useEquipment.test.tsx`

- [ ] **Step 1: Run SQL migrations in Supabase**

Run in the Supabase SQL Editor:

```sql
ALTER TABLE grinders ADD COLUMN grinder_type text;
ALTER TABLE grinders ADD COLUMN burr_size_mm float4;
ALTER TABLE grinders ADD COLUMN motor_watt int4;
ALTER TABLE grinders ADD COLUMN stepless boolean NOT NULL DEFAULT false;
ALTER TABLE grinders ADD COLUMN has_hopper boolean NOT NULL DEFAULT false;

ALTER TABLE machines ADD COLUMN funktionsweise text;
ALTER TABLE machines ADD COLUMN brew_group_type text;
ALTER TABLE machines ADD COLUMN brew_group_size_mm float4;
```

- [ ] **Step 2: Extend Grinder interface in src/types/index.ts**

In the `Grinder` interface, add after `notes: string | null`:

```typescript
grinder_type: string | null
burr_size_mm: number | null
motor_watt: number | null
stepless: boolean
has_hopper: boolean
```

- [ ] **Step 3: Extend Machine interface in src/types/index.ts**

In the `Machine` interface, add after `notes: string | null`:

```typescript
funktionsweise: string | null
brew_group_type: string | null
brew_group_size_mm: number | null
```

- [ ] **Step 4: Fix mockGrinder in src/__tests__/Equipment.test.tsx**

Replace:
```typescript
const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
```
with:
```typescript
const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, grinder_type: null, burr_size_mm: null, motor_watt: null,
  stepless: false, has_hopper: false, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
```

- [ ] **Step 5: Fix mockMachine in src/__tests__/Equipment.test.tsx**

Replace:
```typescript
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
```
with:
```typescript
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, funktionsweise: null, brew_group_type: null, brew_group_size_mm: null,
  is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
```

- [ ] **Step 6: Fix mocks in src/__tests__/useEquipment.test.tsx**

Replace:
```typescript
const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
```
with:
```typescript
const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, grinder_type: null, burr_size_mm: null, motor_watt: null,
  stepless: false, has_hopper: false, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, funktionsweise: null, brew_group_type: null, brew_group_size_mm: null,
  is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
```

- [ ] **Step 7: Run build and tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npm run build 2>&1 | tail -3 && npx vitest run 2>&1 | tail -3`
Expected: build ✓, all 54 tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/types/index.ts src/__tests__/Equipment.test.tsx src/__tests__/useEquipment.test.tsx
git commit -m "feat: add extended fields to Grinder and Machine types"
```

---

### Task 2: equipmentTypes Utility + Tests

**Files:**
- Create: `src/utils/equipmentTypes.ts`
- Create: `src/__tests__/equipmentTypes.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/equipmentTypes.test.ts`:

```typescript
import {
  GRINDER_TYPES, FUNKTIONSWEISE_TYPES,
  grinderTypeLabel, funktionsweiseLabel,
} from '../utils/equipmentTypes'

test('GRINDER_TYPES enthält 2 Einträge', () => {
  expect(GRINDER_TYPES).toHaveLength(2)
})

test('FUNKTIONSWEISE_TYPES enthält 4 Einträge', () => {
  expect(FUNKTIONSWEISE_TYPES).toHaveLength(4)
})

test('grinderTypeLabel gibt Flachscheibe zurück', () => {
  expect(grinderTypeLabel('flat')).toBe('Flachscheibe')
})

test('grinderTypeLabel gibt Kegelscheibe zurück', () => {
  expect(grinderTypeLabel('conical')).toBe('Kegelscheibe')
})

test('grinderTypeLabel Fallback für unbekannten Wert', () => {
  expect(grinderTypeLabel('unknown')).toBe('unknown')
})

test('funktionsweiseLabel gibt Einkreiser zurück', () => {
  expect(funktionsweiseLabel('einkreiser')).toBe('Einkreiser')
})

test('funktionsweiseLabel gibt Dualboiler zurück', () => {
  expect(funktionsweiseLabel('dualboiler')).toBe('Dualboiler')
})

test('funktionsweiseLabel gibt Zweikreiser zurück', () => {
  expect(funktionsweiseLabel('zweikreiser')).toBe('Zweikreiser')
})

test('funktionsweiseLabel gibt Thermoblock zurück', () => {
  expect(funktionsweiseLabel('thermoblock')).toBe('Thermoblock')
})

test('funktionsweiseLabel Fallback für unbekannten Wert', () => {
  expect(funktionsweiseLabel('unknown')).toBe('unknown')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/equipmentTypes.test.ts`
Expected: FAIL — "Cannot find module '../utils/equipmentTypes'"

- [ ] **Step 3: Create src/utils/equipmentTypes.ts**

```typescript
export const GRINDER_TYPES = [
  { value: 'flat',    label: 'Flachscheibe' },
  { value: 'conical', label: 'Kegelscheibe' },
] as const

export const FUNKTIONSWEISE_TYPES = [
  { value: 'einkreiser',  label: 'Einkreiser' },
  { value: 'zweikreiser', label: 'Zweikreiser' },
  { value: 'dualboiler',  label: 'Dualboiler' },
  { value: 'thermoblock', label: 'Thermoblock' },
] as const

export function grinderTypeLabel(value: string): string {
  return GRINDER_TYPES.find(g => g.value === value)?.label ?? value
}

export function funktionsweiseLabel(value: string): string {
  return FUNKTIONSWEISE_TYPES.find(f => f.value === value)?.label ?? value
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run src/__tests__/equipmentTypes.test.ts`
Expected: 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/equipmentTypes.ts src/__tests__/equipmentTypes.test.ts
git commit -m "feat: add equipmentTypes utility (GRINDER_TYPES, FUNKTIONSWEISE_TYPES)"
```

---

### Task 3: GrinderForm + GrinderDetail Extended Fields

**Files:**
- Modify: `src/pages/Equipment.tsx` (GrinderForm at ~line 162, GrinderDetail at ~line 107)

- [ ] **Step 1: Add import to Equipment.tsx**

At the top of `src/pages/Equipment.tsx`, add after the existing imports:

```typescript
import { GRINDER_TYPES, FUNKTIONSWEISE_TYPES, grinderTypeLabel, funktionsweiseLabel } from '../utils/equipmentTypes'
```

- [ ] **Step 2: Add 5 state variables to GrinderForm**

In `GrinderForm` (around line 162), after `const [notes, setNotes] = useState(grinder?.notes ?? '')`:

```typescript
const [grinderType, setGrinderType] = useState(grinder?.grinder_type ?? '')
const [burrSizeMm, setBurrSizeMm] = useState(grinder?.burr_size_mm != null ? String(grinder.burr_size_mm) : '')
const [motorWatt, setMotorWatt] = useState(grinder?.motor_watt != null ? String(grinder.motor_watt) : '')
const [stepless, setStepless] = useState(grinder?.stepless ?? false)
const [hasHopper, setHasHopper] = useState(grinder?.has_hopper ?? false)
```

- [ ] **Step 3: Extend GrinderForm payload**

In `GrinderForm`, replace the `payload` object:

```typescript
const payload = {
  name: name.trim(),
  brand: brand.trim() || null,
  notes: notes.trim() || null,
  grinder_type: grinderType || null,
  burr_size_mm: burrSizeMm ? (isNaN(parseFloat(burrSizeMm)) ? null : parseFloat(burrSizeMm)) : null,
  motor_watt: motorWatt ? (isNaN(parseInt(motorWatt, 10)) ? null : parseInt(motorWatt, 10)) : null,
  stepless,
  has_hopper: hasHopper,
  is_favorite: grinder?.is_favorite ?? false,
}
```

- [ ] **Step 4: Add 5 new fields to GrinderForm JSX**

In `GrinderForm`, add after the `brand` input and before the `notes` textarea:

```tsx
<select
  value={grinderType}
  onChange={e => setGrinderType(e.target.value)}
  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
>
  <option value="">Mahlscheibentyp (optional)</option>
  {GRINDER_TYPES.map(gt => (
    <option key={gt.value} value={gt.value}>{gt.label}</option>
  ))}
</select>
<div className="grid grid-cols-2 gap-3">
  <div className="flex items-center gap-2">
    <input
      type="number" step="0.5" value={burrSizeMm}
      onChange={e => setBurrSizeMm(e.target.value)}
      placeholder="Mahlscheibe"
      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
    <span className="text-sm text-slate-400">mm</span>
  </div>
  <div className="flex items-center gap-2">
    <input
      type="number" step="1" value={motorWatt}
      onChange={e => setMotorWatt(e.target.value)}
      placeholder="Motor"
      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
    <span className="text-sm text-slate-400">W</span>
  </div>
</div>
<div className="flex gap-6">
  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
    <input type="checkbox" checked={stepless} onChange={e => setStepless(e.target.checked)} className="w-4 h-4 accent-orange-500" />
    Stufenlos
  </label>
  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
    <input type="checkbox" checked={hasHopper} onChange={e => setHasHopper(e.target.checked)} className="w-4 h-4 accent-orange-500" />
    Behälter
  </label>
</div>
```

- [ ] **Step 5: Add extended fields display to GrinderDetail**

In `GrinderDetail`, add after `{grinder.brand && (...)}` and before `{grinder.notes && (...)}`:

```tsx
{grinder.grinder_type && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Mahlscheibentyp</p>
    <p className="text-sm text-slate-800">{grinderTypeLabel(grinder.grinder_type)}</p>
  </div>
)}
{(grinder.burr_size_mm !== null || grinder.motor_watt !== null) && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Spezifikationen</p>
    <div className="grid gap-1">
      {grinder.burr_size_mm !== null && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Mahlscheibe</span>
          <span className="text-slate-800">{grinder.burr_size_mm} mm</span>
        </div>
      )}
      {grinder.motor_watt !== null && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Motor</span>
          <span className="text-slate-800">{grinder.motor_watt} W</span>
        </div>
      )}
    </div>
  </div>
)}
{(grinder.stepless || grinder.has_hopper) && (
  <div className="flex gap-2 mb-3">
    {grinder.stepless && (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">Stufenlos</span>
    )}
    {grinder.has_hopper && (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">Behälter</span>
    )}
  </div>
)}
```

- [ ] **Step 6: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 7: TypeScript check**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add src/pages/Equipment.tsx
git commit -m "feat: add extended fields to GrinderForm and GrinderDetail"
```

---

### Task 4: MachineForm + MachineDetail Extended Fields

**Files:**
- Modify: `src/pages/Equipment.tsx` (MachineForm at ~line 326, MachineDetail at ~line 271)

- [ ] **Step 1: Add 3 state variables to MachineForm**

In `MachineForm` (around line 326), after `const [notes, setNotes] = useState(machine?.notes ?? '')`:

```typescript
const [funktionsweise, setFunktionsweise] = useState(machine?.funktionsweise ?? '')
const [brewGroupType, setBrewGroupType] = useState(machine?.brew_group_type ?? '')
const [brewGroupSizeMm, setBrewGroupSizeMm] = useState(machine?.brew_group_size_mm != null ? String(machine.brew_group_size_mm) : '')
```

- [ ] **Step 2: Extend MachineForm payload**

In `MachineForm`, replace the `payload` object:

```typescript
const payload = {
  name: name.trim(),
  brand: brand.trim() || null,
  notes: notes.trim() || null,
  funktionsweise: funktionsweise || null,
  brew_group_type: brewGroupType.trim() || null,
  brew_group_size_mm: brewGroupSizeMm ? (isNaN(parseFloat(brewGroupSizeMm)) ? null : parseFloat(brewGroupSizeMm)) : null,
  is_favorite: machine?.is_favorite ?? false,
}
```

- [ ] **Step 3: Add 3 new fields to MachineForm JSX**

In `MachineForm`, add after the `brand` input and before the `notes` textarea:

```tsx
<select
  value={funktionsweise}
  onChange={e => setFunktionsweise(e.target.value)}
  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
>
  <option value="">Funktionsweise (optional)</option>
  {FUNKTIONSWEISE_TYPES.map(ft => (
    <option key={ft.value} value={ft.value}>{ft.label}</option>
  ))}
</select>
<input
  value={brewGroupType}
  onChange={e => setBrewGroupType(e.target.value)}
  placeholder="Brühgruppe (z.B. E61)"
  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
/>
<div className="flex items-center gap-2">
  <input
    type="number" step="0.5" value={brewGroupSizeMm}
    onChange={e => setBrewGroupSizeMm(e.target.value)}
    placeholder="Brühgruppen-Ø"
    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
  />
  <span className="text-sm text-slate-400">mm</span>
</div>
```

- [ ] **Step 4: Add extended fields display to MachineDetail**

In `MachineDetail`, add after `{machine.brand && (...)}` and before `{machine.notes && (...)}`:

```tsx
{machine.funktionsweise && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Funktionsweise</p>
    <p className="text-sm text-slate-800">{funktionsweiseLabel(machine.funktionsweise)}</p>
  </div>
)}
{(machine.brew_group_type || machine.brew_group_size_mm !== null) && (
  <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Brühgruppe</p>
    <div className="grid gap-1">
      {machine.brew_group_type && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Typ</span>
          <span className="text-slate-800">{machine.brew_group_type}</span>
        </div>
      )}
      {machine.brew_group_size_mm !== null && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Durchmesser</span>
          <span className="text-slate-800">{machine.brew_group_size_mm} mm</span>
        </div>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 5: Run all tests**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx vitest run`
Expected: all tests PASS

- [ ] **Step 6: TypeScript check + build**

Run: `cd /Users/lennartfriedel/Documents/espresso-tracker && npx tsc --noEmit && npm run build 2>&1 | tail -3`
Expected: no TS errors, build ✓

- [ ] **Step 7: Commit**

```bash
git add src/pages/Equipment.tsx
git commit -m "feat: add extended fields to MachineForm and MachineDetail"
```
