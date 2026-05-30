# Brew Methods — Design Spec

**Datum:** 2026-05-30
**Feature:** Weitere Brühmethoden (French Press, V60, AeroPress, Moka Pot)

---

## Übersicht

Neue eigenständige Seite `/brews` für nicht-Espresso-Brühmethoden. Separate Tabelle `brews`, kein Bezug zur `shots`-Tabelle. Unterstützt French Press, V60, AeroPress und Moka Pot mit gemeinsamen Grundparametern und methoden-spezifischen Zusatzfeldern.

---

## Datenbankschema

```sql
CREATE TABLE brews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coffee_id uuid REFERENCES coffees(id) ON DELETE CASCADE,
  grinder_id uuid REFERENCES grinders(id) ON DELETE SET NULL,
  brew_method text NOT NULL,
  grind_setting float4,
  dose_g float4,
  water_ml float4,
  temp_c float4,
  brew_time_s int4,
  rating int2 NOT NULL,
  tasting_notes text,
  -- V60-spezifisch
  bloom_ml float4,
  bloom_time_s int4,
  -- AeroPress-spezifisch
  inverted boolean NOT NULL DEFAULT false,
  -- French Press-spezifisch
  first_stir_s int4,
  brewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**`brew_method`-Werte:** `'french_press'` | `'v60'` | `'aeropress'` | `'moka_pot'`

**Validierung:** `first_stir_s` darf `brew_time_s` nicht überschreiten (client-seitig mit Fehlermeldung).

---

## TypeScript

### `src/types/index.ts` — neues Interface

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

---

## Konstanten

### `src/utils/brewMethods.ts`

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

---

## Zeit-Utility

### `src/utils/timeFormat.ts`

Alle Zeitfelder werden in MM:SS angezeigt. Auto-Konvertierung: wenn der User eine reine Zahl eingibt (z.B. `"240"` oder `"90"`), wird on blur zu `"04:00"` bzw. `"01:30"` konvertiert.

```typescript
export function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function MMSSToSeconds(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  // Reine Zahl → als Sekunden interpretieren
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10)
    return isNaN(n) ? null : n
  }
  // MM:SS Format
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
}

export function normalizeTimeInput(input: string): string {
  const seconds = MMSSToSeconds(input)
  if (seconds === null) return input
  return secondsToMMSS(seconds)
}
```

Der Input-Wert ist immer ein `string` im State. `onBlur` wird `normalizeTimeInput` aufgerufen. Beim Speichern wird `MMSSToSeconds` aufgerufen.

---

## Hooks

### `src/hooks/useBrews.ts`

```typescript
export type BrewWithCoffee = Brew & {
  coffees: { name: string } | null
  grinders: { name: string } | null
}

export function useBrews(coffeeId?: string, brewMethod?: string)
export function useBrew(id: string)
export function useCreateBrew()
export function useUpdateBrew()
export function useDeleteBrew()
```

Alle Hooks folgen dem Pattern aus `useShots.ts`. queryKey: `['brews']` und `['brew', id]`.

---

## Seiten und Komponenten

### `src/pages/Brews.tsx` — Listen-Seite

- Header mit Titel "🫖 Brühen" + "+ Neu"-Button → navigiert zu `/brews/new`
- Filter-Dropdown nach Kaffee (analog ShotHistory)
- Filter-Tabs: Alle / French Press / V60 / AeroPress / Moka Pot
- Grid mit `BrewCard`-Komponenten

### `src/components/BrewCard.tsx`

Analog zu `ShotCard`:
- Methoden-Badge (orange für alle Methoden)
- Kaffee-Name
- Unterzeile: `Mahlgrad X · Dose Xg → Wasser Xml · Zeit MM:SS`
- Bewertungs-Badge mit `ratingColor`

### `src/pages/NewBrew.tsx` — Formular

Formular-Reihenfolge:
1. **Brühmethode** — Chips (French Press / V60 / AeroPress / Moka Pot)
2. **Kaffee** — Dropdown (Pflicht)
3. **Mühle** — Dropdown (optional, aus `useGrinders`)
4. **Mahlgrad** — Zahlenfeld
5. **Kaffeemenge (g)** + **Wasser (ml)** — 2er-Grid
6. **Temperatur (°C)** + **Brühzeit (MM:SS)** — 2er-Grid
7. **Methoden-spezifisch** (conditional):
   - French Press: `1. Umrühren (MM:SS)` [optional]
   - V60: Oranger Block "Bloom" mit `Bloom (ml)` + `Bloom-Zeit (MM:SS)`
   - AeroPress: Checkbox "Inverted"
   - Moka Pot: keine Extra-Felder
8. **Bewertung** — RatingInput (Pflicht)
9. **Notizen** — Textarea
10. **Speichern**-Button

### `src/pages/BrewDetail.tsx` — Detail + Edit

- View-Modus: Methoden-Badge, alle gesetzten Felder in Karten, Zeitfelder in MM:SS
- Edit-Modus: gleiche Struktur wie NewBrew, initialisiert mit bestehenden Werten
- Methoden-spezifische Karten werden nur angezeigt wenn Daten vorhanden

---

## Navigation

In `src/components/Layout.tsx`, `navItems` erweitern:

```typescript
{ to: '/brews', label: 'Brühen', icon: '🫖' }
```

Position: zwischen "Shots" und "Analyse".

In `src/App.tsx`:
```tsx
import { Brews } from './pages/Brews'
import { NewBrew } from './pages/NewBrew'
import { BrewDetail } from './pages/BrewDetail'

<Route path="brews" element={<Brews />} />
<Route path="brews/new" element={<NewBrew />} />
<Route path="brews/:id" element={<BrewDetail />} />
```

---

## Scope

**In scope:**
- `brews`-Tabelle + TypeScript-Typen
- `brewMethods.ts` + `timeFormat.ts` Utilities
- `useBrews.ts` Hook
- `Brews.tsx` + `BrewCard.tsx` + `NewBrew.tsx` + `BrewDetail.tsx`
- Navigation + Routen

**Nicht in scope:**
- i-Button mit Methoden-Erklärung (zurückgestellt)
- Analysis-Integration für Brühmethoden
- Brews in der Shot-History
