# Milk Drinks — Design Spec

**Datum:** 2026-05-30
**Feature:** Milchgetränke (Cappuccino, Latte Macchiato, Flat White, Cortado, Macchiato)

---

## Übersicht

Milchgetränke werden als eigenständige Einträge erfasst. Der Espresso ist die Basis — alle Espresso-Parameter (Mahlgrad, Dose, Yield, Temp, Druck, Brühzeit) werden zusammen mit der Milch bewertet. Es gibt **keine separate Espresso-Bewertung** für einen Shot, der als Milchgetränk getrunken wird.

---

## Datenbankänderungen

Die bestehende `shots`-Tabelle wird um 3 Felder erweitert:

```sql
ALTER TABLE shots ADD COLUMN drink_type text NOT NULL DEFAULT 'espresso';
ALTER TABLE shots ADD COLUMN milk_type text;
ALTER TABLE shots ADD COLUMN milk_ml float4;
```

**`drink_type`** — Werte: `'espresso'`, `'cappuccino'`, `'latte_macchiato'`, `'flat_white'`, `'cortado'`, `'macchiato'`

**`milk_type`** — Auswahlliste (null wenn Espresso):
- `'vollmilch_38'` → "Vollmilch 3,8%"
- `'vollmilch_35'` → "Vollmilch 3,5%"
- `'fettarm_15'` → "Fettarme Milch 1,5%"
- `'hafer'` → "Hafermilch"
- `'mandel'` → "Mandelmilch"
- `'kokos'` → "Kokosmilch"
- `'soja'` → "Sojamilch"

**`milk_ml`** — freie Zahl in ml (null wenn Espresso)

---

## TypeScript

In `src/types/index.ts`, Interface `Shot` ergänzen (nach `used_leveler`):

```typescript
drink_type: string        // DEFAULT 'espresso'
milk_type: string | null
milk_ml: number | null
```

Konstanten-Datei `src/utils/drinkTypes.ts`:

```typescript
export const DRINK_TYPES = [
  { value: 'espresso',       label: 'Espresso' },
  { value: 'cappuccino',     label: 'Cappuccino' },
  { value: 'latte_macchiato',label: 'Latte Macchiato' },
  { value: 'flat_white',     label: 'Flat White' },
  { value: 'cortado',        label: 'Cortado' },
  { value: 'macchiato',      label: 'Macchiato' },
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

---

## NewShot — Formular

### Getränketyp-Auswahl (neu, ganz oben)

Klickbare Chips über dem Kaffee-Dropdown. Standard: `espresso` (orange hervorgehoben). Bei Klick auf einen anderen Typ erscheint der Milch-Block.

```tsx
// Chips-Reihe
{DRINK_TYPES.map(dt => (
  <button
    type="button"
    key={dt.value}
    onClick={() => setDrinkType(dt.value)}
    className={drinkType === dt.value
      ? 'bg-orange-500 text-white ...'
      : 'border border-slate-200 text-slate-500 ...'}
  >
    {dt.label}
  </button>
))}
```

### Milch-Block (nur sichtbar wenn drink_type !== 'espresso')

Sektion mit orangem Rahmen (`border-orange-200 bg-orange-50`), erscheint nach den Brühparametern, vor der Vorbereitung:

- **Milchsorte**: `<select>` mit allen `MILK_TYPES`
- **Menge**: Zahlenfeld (ml)

### State-Ergänzungen

```typescript
const [drinkType, setDrinkType] = useState('espresso')
const [milkType, setMilkType] = useState('')
const [milkMl, setMilkMl] = useState('')
```

### Submit-Payload

```typescript
drink_type: drinkType,
milk_type: drinkType !== 'espresso' ? (milkType || null) : null,
milk_ml: drinkType !== 'espresso' ? (milkMl ? parseFloat(milkMl) : null) : null,
```

---

## ShotHistory — Filter

Drei Tabs über der Liste:

```typescript
type DrinkFilter = 'all' | 'espresso' | 'milk'
```

- **Alle** → keine Filterung
- **Espresso** → `.eq('drink_type', 'espresso')`
- **Milchgetränke** → `.neq('drink_type', 'espresso')`

Der Filter-State lebt in `ShotHistory`. Der `useShots`-Hook bekommt einen optionalen `drinkFilter`-Parameter.

---

## ShotCard — Typ-Badge

Jede Card zeigt links oben einen Badge mit dem Getränketyp:

- Espresso → grauer Badge (`bg-slate-100 text-slate-600`)
- Milchgetränke → oranger Badge (`bg-orange-50 text-orange-700 border border-orange-200`)

Unterzeile bei Milchgetränken: `Hafermilch · 120 ml · Mahlgrad 12`
Unterzeile bei Espresso: unverändert (`Mahlgrad 12.5 · 18g → 36g`)

---

## ShotDetail — Anzeige

Im View-Modus: Getränketyp-Badge im Header (neben dem Kaffee-Namen). Falls Milchgetränk, zusätzliche Karte "Milch" mit Sorte + ml — nach den Brühparametern, vor den Tasting Notes.

Im Edit-Modus (ShotEditForm): Getränketyp-Chips + Milch-Block analog NewShot.

---

## useShots Hook

`useShots` bekommt einen dritten optionalen Parameter `drinkFilter`:

```typescript
export function useShots(coffeeId?: string, roastDateId?: string, drinkFilter?: 'espresso' | 'milk') {
  // drinkFilter === 'espresso' → .eq('drink_type', 'espresso')
  // drinkFilter === 'milk'     → .neq('drink_type', 'espresso')
}
```

---

## Scope

**In scope:**
- `drink_type`, `milk_type`, `milk_ml` auf `shots`-Tabelle
- `drinkTypes.ts` mit Konstanten + Label-Funktionen
- NewShot: Getränketyp-Chips + Milch-Block
- ShotHistory: Filter-Tabs
- ShotCard: Typ-Badge + angepasste Unterzeile
- ShotDetail: Badge im Header + Milch-Karte + Edit-Formular
- `useShots` drinkFilter-Parameter

**Nicht in scope:**
- Analysis-Auswertung nach Getränketyp
- Separate Bewertungsskalen pro Getränketyp
- Milchtemperatur oder Aufschäum-Qualität
