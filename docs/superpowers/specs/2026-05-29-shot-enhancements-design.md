# Shot Enhancements — Design Spec

**Datum:** 2026-05-29  
**Features:** Feinere Bewertungs-Farbskala + RDT/WDT/Leveler Checkboxen

---

## Feature 1: Bewertungs-Farbskala

### Ziel

Jede Bewertungsstufe (1–10) bekommt eine eigene Farbe statt der bisherigen 3-Gruppen (grün/gelb/grau). Verlauf: Rot (1) → Orange (5) → Grün (10).

### Utility-Funktion

**Pfad:** `src/utils/ratingColor.ts`

```ts
export function ratingColor(v: number): string {
  const map: Record<number, string> = {
    1:  'bg-red-100 text-red-900',
    2:  'bg-red-200 text-red-800',
    3:  'bg-orange-100 text-orange-900',
    4:  'bg-orange-200 text-orange-900',
    5:  'bg-amber-200 text-amber-900',
    6:  'bg-yellow-100 text-yellow-900',
    7:  'bg-lime-100 text-lime-900',
    8:  'bg-green-100 text-green-900',
    9:  'bg-green-200 text-green-900',
    10: 'bg-green-300 text-green-900',
  }
  return map[v] ?? 'bg-slate-100 text-slate-500'
}
```

### Verwendung

Die bisherigen lokalen Funktionen `ratingStyle` (ShotCard) und `ratingBadge` (ShotDetail) werden durch `ratingColor` ersetzt:

- `src/components/ShotCard.tsx` — Badge-Farbe für Shot-Rating in der Liste
- `src/pages/ShotDetail.tsx` — Badge-Farbe für Gesamtbewertung + Körper/Säure-Badges

**RatingInput bleibt unverändert** — die aktive Schaltfläche bleibt orange (keine per-Value-Farbe nötig).

---

## Feature 2: RDT / WDT / Leveler Checkboxen

### Kontext

- **RDT** (Ross Droplet Technique): Ein Tropfen Wasser auf den Mahlkaffee vor dem Mahlen — reduziert statische Aufladung
- **WDT** (Weiss Distribution Technique): Nadelwerkzeug zum Verteilen des Mahlguts im Sieb
- **Leveler**: Nivellierungswerkzeug vor dem Tampen

### Datenbankänderung

```sql
ALTER TABLE shots ADD COLUMN used_rdt boolean DEFAULT false;
ALTER TABLE shots ADD COLUMN used_wdt boolean DEFAULT false;
ALTER TABLE shots ADD COLUMN used_leveler boolean DEFAULT false;
```

### Typ-Änderung

In `src/types/index.ts`, Interface `Shot`:
```ts
used_rdt: boolean
used_wdt: boolean
used_leveler: boolean
```

`NewShot` (Omit) erbt automatisch.

### NewShot-Formular

Neue Sektion nach dem Brühzeit-Block, vor den Bewertungen:

```tsx
{/* Prep Tools */}
<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Vorbereitung</label>
  <div className="flex gap-4">
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" checked={usedRdt} onChange={e => setUsedRdt(e.target.checked)} className="w-4 h-4 accent-orange-500" />
      RDT
    </label>
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" checked={usedWdt} onChange={e => setUsedWdt(e.target.checked)} className="w-4 h-4 accent-orange-500" />
      WDT
    </label>
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" checked={usedLeveler} onChange={e => setUsedLeveler(e.target.checked)} className="w-4 h-4 accent-orange-500" />
      Leveler
    </label>
  </div>
</div>
```

State-Initialisierung (alle false):
```tsx
const [usedRdt, setUsedRdt] = useState(false)
const [usedWdt, setUsedWdt] = useState(false)
const [usedLeveler, setUsedLeveler] = useState(false)
```

Submit-Payload:
```tsx
used_rdt: usedRdt,
used_wdt: usedWdt,
used_leveler: usedLeveler,
```

### ShotDetail — View-Modus

Kleine Chips nach dem Timestamp am Ende der Seite, nur wenn mindestens ein Tool aktiv:

```tsx
{(shot.used_rdt || shot.used_wdt || shot.used_leveler) && (
  <div className="flex gap-2 justify-center mt-2">
    {shot.used_rdt && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">RDT</span>}
    {shot.used_wdt && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">WDT</span>}
    {shot.used_leveler && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Leveler</span>}
  </div>
)}
```

### ShotDetail — Edit-Modus (ShotEditForm)

State-Initialisierung:
```tsx
const [usedRdt, setUsedRdt] = useState(shot.used_rdt ?? false)
const [usedWdt, setUsedWdt] = useState(shot.used_wdt ?? false)
const [usedLeveler, setUsedLeveler] = useState(shot.used_leveler ?? false)
```

Gleiche Checkbox-Sektion wie in NewShot, nach Brühzeit vor Ratings.

Submit-Payload: `used_rdt: usedRdt, used_wdt: usedWdt, used_leveler: usedLeveler`

---

## Supabase-Migrationen (vor Deploy ausführen)

```sql
ALTER TABLE shots ADD COLUMN used_rdt boolean DEFAULT false;
ALTER TABLE shots ADD COLUMN used_wdt boolean DEFAULT false;
ALTER TABLE shots ADD COLUMN used_leveler boolean DEFAULT false;
```

---

## Scope

**In scope:**
- `ratingColor` Utility + Verwendung in ShotCard + ShotDetail
- RDT/WDT/Leveler in NewShot + ShotDetail (View + Edit)
- Typ-Updates + Migrationen

**Nicht in scope:**
- Filter nach Tools in ShotHistory oder Analysis
- RatingInput per-Value-Farben
- Tooltips / Erklärungen für RDT/WDT/Leveler
