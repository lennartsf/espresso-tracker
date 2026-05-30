# Equipment Extended Fields — Design Spec

**Datum:** 2026-05-30
**Feature:** Erweiterte Parameter für Mühlen und Maschinen

---

## Übersicht

Die bestehenden `grinders`- und `machines`-Tabellen werden um fachspezifische Parameter erweitert. Alle Änderungen sind auf `Equipment.tsx` beschränkt — keine anderen Seiten sind betroffen.

---

## Datenbankänderungen

### `grinders` — 5 neue Felder

```sql
ALTER TABLE grinders ADD COLUMN grinder_type text;
ALTER TABLE grinders ADD COLUMN burr_size_mm float4;
ALTER TABLE grinders ADD COLUMN motor_watt int4;
ALTER TABLE grinders ADD COLUMN stepless boolean NOT NULL DEFAULT false;
ALTER TABLE grinders ADD COLUMN has_hopper boolean NOT NULL DEFAULT false;
```

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `grinder_type` | text nullable | `'flat'` = Flachscheibe, `'conical'` = Kegelscheibe |
| `burr_size_mm` | float4 nullable | Mahlscheiben-Durchmesser in mm |
| `motor_watt` | int4 nullable | Motorleistung in Watt |
| `stepless` | boolean DEFAULT false | stufenlos verstellbar |
| `has_hopper` | boolean DEFAULT false | mit Bohnenbehälter |

### `machines` — 3 neue Felder

```sql
ALTER TABLE machines ADD COLUMN funktionsweise text;
ALTER TABLE machines ADD COLUMN brew_group_type text;
ALTER TABLE machines ADD COLUMN brew_group_size_mm float4;
```

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `funktionsweise` | text nullable | `'einkreiser'` / `'zweikreiser'` / `'dualboiler'` / `'thermoblock'` |
| `brew_group_type` | text nullable | Freitext (z.B. "E61", "Saturated") |
| `brew_group_size_mm` | float4 nullable | Brühgruppen-Durchmesser in mm |

---

## TypeScript

In `src/types/index.ts`:

### `Grinder` interface — 5 neue Felder nach `notes`:
```typescript
grinder_type: string | null
burr_size_mm: number | null
motor_watt: number | null
stepless: boolean
has_hopper: boolean
```

### `Machine` interface — 3 neue Felder nach `notes`:
```typescript
funktionsweise: string | null
brew_group_type: string | null
brew_group_size_mm: number | null
```

---

## Konstanten

In `src/utils/equipmentTypes.ts` (neue Datei):

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

---

## UI-Änderungen (nur Equipment.tsx)

### GrinderForm — neue Felder nach `brand`:

1. **Mahlscheibentyp**: `<select>` mit GRINDER_TYPES (Flachscheibe / Kegelscheibe / leer)
2. **Mahlscheibe**: Zahlenfeld + "mm" Label
3. **Motor**: Zahlenfeld + "W" Label
4. **Stufenlos**: Checkbox
5. **Behälter**: Checkbox

### GrinderDetail — neue Anzeige-Karten:

- Mahlscheibentyp (wenn gesetzt)
- Mahlscheibe X mm (wenn gesetzt)
- Motor X W (wenn gesetzt)
- Chips für Stufenlos / Behälter (wenn true)

### MachineForm — neue Felder nach `brand`:

1. **Funktionsweise**: `<select>` mit FUNKTIONSWEISE_TYPES
2. **Brühgruppe**: Freitext-Input
3. **Brühgruppen-Ø**: Zahlenfeld + "mm" Label

### MachineDetail — neue Anzeige-Karten:

- Funktionsweise (wenn gesetzt)
- Brühgruppe: Typ + Ø X mm (wenn gesetzt)

---

## Scope

**In scope:** Grinder + Machine DB-Felder, TypeScript-Typen, equipmentTypes.ts, GrinderForm/Detail + MachineForm/Detail in Equipment.tsx

**Nicht in scope:** Basket (bereits vollständig), NewShot/ShotDetail, Filter oder Analyse nach Equipment-Typ
