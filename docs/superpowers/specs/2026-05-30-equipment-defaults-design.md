# Equipment-Defaults & Brew-Device — Design Spec

**Datum:** 2026-05-30  
**Status:** Approved  
**Scope:** Per-Methode Equipment-Favoriten + neuer Brew-Device Equipment-Typ

---

## Übersicht

Erweiterung des Equipment-Systems um:
1. Einen neuen Equipment-Typ **Brew-Geräte** (`brew_devices`-Tabelle)
2. Eine **`equipment_defaults`-Tabelle** die pro Brühmethode festlegt welches Gerät Standard ist
3. **Automatische Vorauswahl** in NewShot/NewBrew basierend auf der gewählten Methode
4. **Standard-Setter UI** auf allen Equipment-Karten in `/ausruestung`

---

## Datenbankschema

### Neue Tabelle: `brew_devices`

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid PK DEFAULT gen_random_uuid() | |
| name | text NOT NULL | z.B. "Hario V60 02" |
| brand | text | z.B. "Hario" |
| device_type | text | `french_press`, `v60`, `aeropress`, `moka_pot`, `chemex`, `other` |
| notes | text | Freitext |
| is_favorite | boolean DEFAULT false | Globaler Favorit (für Sortierung/UI) |
| created_at | timestamptz DEFAULT now() | |

### Neue Tabelle: `equipment_defaults`

| Spalte | Typ | Beschreibung |
|---|---|---|
| method | text PRIMARY KEY | `espresso`, `french_press`, `v60`, `aeropress`, `moka_pot` |
| grinder_id | uuid FK → grinders ON DELETE SET NULL | |
| machine_id | uuid FK → machines ON DELETE SET NULL | |
| basket_id | uuid FK → baskets ON DELETE SET NULL | |
| brew_device_id | uuid FK → brew_devices ON DELETE SET NULL | |

Maximal 5 Zeilen (eine pro Methode). Upsert bei Änderung.

### Änderung: `brews`

```sql
ALTER TABLE brews ADD COLUMN IF NOT EXISTS brew_device_id uuid REFERENCES brew_devices(id) ON DELETE SET NULL;
```

---

## Erlaubte Methoden pro Equipment-Typ

| Equipment-Typ | Wählbare Methoden in Standard-Setter |
|---|---|
| Mühle | espresso, french_press, v60, aeropress, moka_pot |
| Maschine | espresso |
| Sieb | espresso |
| Brew-Gerät | french_press, v60, aeropress, moka_pot |

---

## TypeScript-Typen (`src/types/index.ts`)

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

`Brew` bekommt: `brew_device_id: string | null`

---

## Hook: `useEquipment.ts` — neue Exports

```ts
// CRUD für brew_devices (identisches Muster wie useGrinders)
export function useBrewDevices(): UseQueryResult<BrewDevice[]>
export function useCreateBrewDevice(): UseMutationResult
export function useUpdateBrewDevice(): UseMutationResult
export function useDeleteBrewDevice(): UseMutationResult

// equipment_defaults
export function useEquipmentDefaults(): UseQueryResult<EquipmentDefault[]>
export function useSetEquipmentDefault(): UseMutationResult<
  void,
  Error,
  { method: string; field: 'grinder_id' | 'machine_id' | 'basket_id' | 'brew_device_id'; id: string | null }
>
```

`useSetEquipmentDefault` macht einen Upsert auf `equipment_defaults` mit `{ method, [field]: id }`.

Hilfsfunktion (nicht exportiert, intern in Hooks benutzt):
```ts
function defaultForMethod(defaults: EquipmentDefault[], method: string): EquipmentDefault | undefined
```

---

## Equipment-Seite (`src/pages/Equipment.tsx`)

### Neuer "Geräte"-Tab (4. Tab)

Identische Struktur wie die Mühlen/Maschinen/Siebe-Tabs:
- Liste aller `brew_devices`
- Formular: Name (required), Marke, Typ (Dropdown), Notizen
- Typ-Dropdown: French Press, V60, AeroPress, Moka Pot, Chemex, Sonstiges
- ⭐ Favorit-Toggle (setzt `is_favorite`)
- Löschen-Button

### Standard-Setter UI auf allen Equipment-Karten

Auf jedem Gerät in allen 4 Tabs erscheint unter dem ⭐-Button:

```
[Standard für ▾]
```

Beim Klick klappt inline eine kompakte Chip-Liste auf (nur relevante Methoden für diesen Typ):

```
Espresso  [French Press]  V60  AeroPress  Moka Pot
```

- Orange gefüllte Chips = aktuell Standard für diese Methode
- Grau = nicht Standard
- Klick auf Chip → Toggle: Upsert oder Nullen des entsprechenden Feldes in `equipment_defaults`
- Kein Modal, kein Overlay — inline expandierend direkt an der Karte

### Methoden-Labels in der UI

| method | Label |
|---|---|
| espresso | Espresso |
| french_press | French Press |
| v60 | V60 |
| aeropress | AeroPress |
| moka_pot | Moka Pot |

---

## NewShot (`src/pages/NewShot.tsx`)

**Änderung der Vorauswahl-Logik:**

Bestehende `useEffect`-Hooks (basierend auf `is_favorite`) ersetzen durch:

```ts
const { data: defaults = [] } = useEquipmentDefaults()

useEffect(() => {
  const d = defaults.find(d => d.method === 'espresso')
  if (d?.grinder_id  && !grinderId)  setGrinderId(d.grinder_id)
  if (d?.machine_id  && !machineId)  setMachineId(d.machine_id)
  if (d?.basket_id   && !basketId)   setBasketId(d.basket_id)
}, [defaults])
```

Fallback auf `is_favorite` wenn kein Espresso-Default gesetzt (d.h. kein Row für 'espresso' in `equipment_defaults`):

```ts
useEffect(() => {
  const d = defaults.find(d => d.method === 'espresso')
  if (!d?.grinder_id && !grinderId) { const f = grinders.find(g => g.is_favorite); if (f) setGrinderId(f.id) }
  // analog machine, basket
}, [defaults, grinders, machines, baskets])
```

Equipment-Dropdowns bleiben unverändert (Mühle, Maschine, Sieb).

---

## NewBrew (`src/pages/NewBrew.tsx`)

**Neues Gerät-Dropdown:**

```tsx
<select value={brewDeviceId} onChange={e => setBrewDeviceId(e.target.value)}>
  <option value="">Kein Gerät</option>
  {brewDevices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
</select>
```

**Vorauswahl-Logik:**

```ts
const { data: defaults = [] } = useEquipmentDefaults()

useEffect(() => {
  const d = defaults.find(d => d.method === brewMethod)
  if (d?.grinder_id    && !grinderId)    setGrinderId(d.grinder_id)
  if (d?.brew_device_id && !brewDeviceId) setBrewDeviceId(d.brew_device_id)
}, [defaults, brewMethod])
```

Wenn der Nutzer die Brühmethode wechselt (`brewMethod` ändert sich), werden Grinder und Gerät auf die Defaults der neuen Methode gesetzt — immer, ohne Ausnahme. Der Nutzer kann danach manuell überschreiben. Das ist das erwartete Verhalten: Methodenwechsel = neue Defaults.

**Submit:** `brew_device_id: brewDeviceId || null` mitschicken.

---

## BrewDetail (`src/pages/BrewDetail.tsx`)

**View-Mode:** Wenn `brew.brew_device_id` gesetzt, zeige einen Parameter-Badge:
```
Gerät
[Gerätename]
```

**Edit-Mode:** Gerät-Dropdown (gleiche Struktur wie in NewBrew), initialisiert mit `brew.brew_device_id`.

**Submit:** `brew_device_id: brewDeviceId || null` mitschicken.

---

## Neue/geänderte Dateien

| Datei | Aktion |
|---|---|
| `src/types/index.ts` | `BrewDevice`, `EquipmentDefault`, `NewBrewDevice`; `Brew` + `brew_device_id` |
| `src/hooks/useEquipment.ts` | `useBrewDevices` CRUD + `useEquipmentDefaults` + `useSetEquipmentDefault` |
| `src/pages/Equipment.tsx` | Geräte-Tab + Standard-Setter UI auf allen Karten |
| `src/pages/NewShot.tsx` | Default-Logik auf `equipment_defaults` umstellen |
| `src/pages/NewBrew.tsx` | Gerät-Dropdown + `equipment_defaults`-Vorauswahl |
| `src/pages/BrewDetail.tsx` | Gerät anzeigen + editierbar |
| `src/__tests__/useEquipment.test.tsx` | Tests für neue Hooks |
| `src/__tests__/Equipment.test.tsx` | Tests für Geräte-Tab + Standard-Setter |

---

## Testing

- `useBrewDevices`: CRUD analog zu bestehenden Equipment-Hook-Tests
- `useEquipmentDefaults`: Fetch + Upsert
- `useSetEquipmentDefault`: Setzt korrektes Feld, lässt andere unverändert
- `Equipment.tsx`: Geräte-Tab rendert, Standard-Setter zeigt korrekte Methoden pro Typ
- `NewShot`: Equipment-Defaults für 'espresso' werden vorausgewählt
- `NewBrew`: Default wechselt wenn Brühmethode wechselt

---

## Nicht in Scope

- Multi-User (jeder User hat seine eigenen Defaults) — kein Auth vorhanden
- Reihenfolge/Priorisierung wenn mehrere Geräte denselben Default haben — kann nicht passieren (Upsert überschreibt)
- Export/Import von Defaults
