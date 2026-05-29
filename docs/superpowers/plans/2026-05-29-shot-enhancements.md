# Shot Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Feinere 10-stufige Bewertungs-Farbskala + RDT/WDT/Leveler Checkboxen in NewShot und ShotDetail.

**Architecture:** Eine neue Utility-Funktion `ratingColor` kapselt die Farblogik und ersetzt die bisherigen lokalen Funktionen in ShotCard und ShotDetail. Drei neue Boolean-Felder in der shots-Tabelle werden in NewShot und ShotDetail eingebunden.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Supabase JS v2, Vitest

---

## ⚠️ Supabase-Migrationen (vor Deploy ausführen)

```sql
ALTER TABLE shots ADD COLUMN used_rdt boolean DEFAULT false;
ALTER TABLE shots ADD COLUMN used_wdt boolean DEFAULT false;
ALTER TABLE shots ADD COLUMN used_leveler boolean DEFAULT false;
```

---

## Datei-Übersicht

| Aktion | Pfad | Zweck |
|--------|------|-------|
| Create | `src/utils/ratingColor.ts` | Farbmapping 1–10 |
| Create | `src/__tests__/ratingColor.test.ts` | Tests |
| Modify | `src/components/ShotCard.tsx` | ratingColor verwenden |
| Modify | `src/pages/ShotDetail.tsx` | ratingColor verwenden |
| Modify | `src/types/index.ts` | used_rdt/wdt/leveler hinzufügen |
| Modify | `src/pages/NewShot.tsx` | Checkboxen + Submit-Payload |
| Modify | `src/__tests__/ShotDetail.test.tsx` | Mock aktualisieren |

---

## Task 1: ratingColor Utility + Tests

**Files:**
- Create: `src/utils/ratingColor.ts`
- Create: `src/__tests__/ratingColor.test.ts`

- [ ] **Schritt 1: Tests schreiben**

Erstelle `src/__tests__/ratingColor.test.ts`:

```ts
import { ratingColor } from '../utils/ratingColor'

test('gibt Rot für 1 zurück', () => {
  expect(ratingColor(1)).toBe('bg-red-100 text-red-900')
})

test('gibt Orange für 4 zurück', () => {
  expect(ratingColor(4)).toBe('bg-orange-200 text-orange-900')
})

test('gibt Orange/Amber für 5 zurück', () => {
  expect(ratingColor(5)).toBe('bg-amber-200 text-amber-900')
})

test('gibt Grün für 10 zurück', () => {
  expect(ratingColor(10)).toBe('bg-green-300 text-green-900')
})

test('gibt Fallback für ungültige Werte zurück', () => {
  expect(ratingColor(0)).toBe('bg-slate-100 text-slate-500')
  expect(ratingColor(11)).toBe('bg-slate-100 text-slate-500')
})
```

- [ ] **Schritt 2: Tests ausführen — müssen fehlschlagen**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm test -- --run
```

Erwartet: FAIL — `ratingColor` not found.

- [ ] **Schritt 3: Utility implementieren**

Erstelle `src/utils/ratingColor.ts`:

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

- [ ] **Schritt 4: Tests ausführen — müssen grün sein**

```bash
npm test -- --run
```

Erwartet: alle Tests grün.

- [ ] **Schritt 5: Commit**

```bash
git add src/utils/ratingColor.ts src/__tests__/ratingColor.test.ts
git commit -m "feat: add ratingColor utility"
```

---

## Task 2: ratingColor in ShotCard + ShotDetail verwenden

**Files:**
- Modify: `src/components/ShotCard.tsx`
- Modify: `src/pages/ShotDetail.tsx`

### ShotCard

- [ ] **Schritt 1: ratingColor importieren und ratingStyle ersetzen**

Ersetze die komplette `src/components/ShotCard.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { ratingColor } from '../utils/ratingColor'
import type { ShotWithCoffee } from '../hooks/useShots'

interface Props {
  shot: ShotWithCoffee
}

export function ShotCard({ shot }: Props) {
  const roastDate = shot.roast_dates?.roast_date
    ? new Date(shot.roast_dates.roast_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <Link
      to={`/shots/${shot.id}`}
      className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center hover:border-orange-300 transition-colors"
    >
      <div>
        <p className="font-medium text-slate-800 text-sm">{shot.coffees?.name ?? '—'}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Mahlgrad {shot.grind_setting}
          {shot.brew_time_s ? ` · ${shot.brew_time_s}s` : ''}
          {roastDate ? ` · Röstung ${roastDate}` : ''}
        </p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ${ratingColor(shot.rating)}`}>
        {shot.rating}
      </span>
    </Link>
  )
}
```

### ShotDetail

- [ ] **Schritt 2: ratingBadge ersetzen und body/acidity Badges aktualisieren**

In `src/pages/ShotDetail.tsx`:

Ersetze den Import oben (füge ratingColor hinzu):
```tsx
import { ratingColor } from '../utils/ratingColor'
```

Lösche die `ratingBadge`-Funktion (Zeilen ~15–19) vollständig.

Ersetze die Verwendung von `ratingBadge` durch `ratingColor`:
```tsx
{/* Vorher: */}
<span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingBadge(shot.rating)}`}>

{/* Nachher: */}
<span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingColor(shot.rating)}`}>
```

Ersetze die body_score und acidity_score Badges (bisher fest `text-slate-700`):
```tsx
{/* Körper-Badge — vorher: */}
<p className="font-bold text-slate-700">{shot.body_score}</p>

{/* Nachher: */}
<p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(shot.body_score)}`}>{shot.body_score}</p>

{/* Säure-Badge — vorher: */}
<p className="font-bold text-slate-700">{shot.acidity_score}</p>

{/* Nachher: */}
<p className={`font-bold text-sm px-1.5 py-0.5 rounded ${ratingColor(shot.acidity_score)}`}>{shot.acidity_score}</p>
```

- [ ] **Schritt 3: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler (TypeScript-Fehler wegen fehlendem `ratingBadge` möglicherweise — sicherstellen dass alle Verwendungen ersetzt wurden).

- [ ] **Schritt 4: Tests ausführen**

```bash
npm test -- --run
```

Erwartet: alle Tests grün.

- [ ] **Schritt 5: Commit**

```bash
git add src/components/ShotCard.tsx src/pages/ShotDetail.tsx
git commit -m "feat: apply ratingColor to ShotCard and ShotDetail"
```

---

## Task 3: used_rdt/wdt/leveler — Typen + NewShot

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/__tests__/recipeCalc.test.ts`
- Modify: `src/pages/NewShot.tsx`

- [ ] **Schritt 1: Typen hinzufügen**

In `src/types/index.ts`, füge im `Shot`-Interface nach `tasting_notes: string | null` ein:

```ts
used_rdt: boolean
used_wdt: boolean
used_leveler: boolean
```

- [ ] **Schritt 2: recipeCalc-Test-Mock aktualisieren**

In `src/__tests__/recipeCalc.test.ts`, füge im `makeShot`-Objekt nach `tasting_notes: null,` ein:

```ts
used_rdt: false,
used_wdt: false,
used_leveler: false,
```

- [ ] **Schritt 3: Build prüfen (zeigt fehlende Felder)**

```bash
npm run build
```

Erwartet: TypeScript-Fehler — `used_rdt` fehlt in NewShot-Payload und ShotDetail. Das ist erwartet und wird in den nächsten Schritten behoben.

- [ ] **Schritt 4: States in NewShot hinzufügen**

In `src/pages/NewShot.tsx`, füge nach `const [pressureBar, setPressureBar] = useState('9')` ein:

```tsx
const [usedRdt, setUsedRdt] = useState(false)
const [usedWdt, setUsedWdt] = useState(false)
const [usedLeveler, setUsedLeveler] = useState(false)
```

- [ ] **Schritt 5: Checkbox-Sektion in NewShot einfügen**

In `NewShot.tsx`, füge nach dem `{/* Brew time */}`-Block und vor dem `{/* Ratings */}`-Block ein:

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

- [ ] **Schritt 6: Submit-Payload in NewShot ergänzen**

In `handleSubmit` von NewShot, im `createShot.mutateAsync({...})`-Aufruf, füge nach `tasting_notes: tastingNotes.trim() || null,` ein:

```tsx
used_rdt: usedRdt,
used_wdt: usedWdt,
used_leveler: usedLeveler,
```

Außerdem: In der inline-Kaffee-Erstellung (`createCoffee.mutateAsync({...})`) muss `photo_url: null` bereits vorhanden sein — das bleibt unverändert.

- [ ] **Schritt 7: Build prüfen**

```bash
npm run build
```

Erwartet: nur noch Fehler in ShotDetail (wird in Task 4 behoben) oder keine Fehler.

- [ ] **Schritt 8: Tests**

```bash
npm test -- --run
```

Erwartet: alle bisherigen Tests grün.

- [ ] **Schritt 9: Commit**

```bash
git add src/types/index.ts src/__tests__/recipeCalc.test.ts src/pages/NewShot.tsx
git commit -m "feat: add used_rdt/wdt/leveler to Shot type and NewShot form"
```

---

## Task 4: ShotDetail — Tool-Chips + Edit-Formular

**Files:**
- Modify: `src/pages/ShotDetail.tsx`
- Modify: `src/__tests__/ShotDetail.test.tsx`

### View-Modus

- [ ] **Schritt 1: Tool-Chips nach Timestamp einfügen**

In `src/pages/ShotDetail.tsx`, ersetze den Timestamp-Block am Ende des `ShotDetail`-Returns:

```tsx
{/* Vorher: */}
<p className="text-xs text-slate-400 text-center mt-4">{formatDate(shot.pulled_at)}</p>

{/* Nachher: */}
<p className="text-xs text-slate-400 text-center mt-4">{formatDate(shot.pulled_at)}</p>
{(shot.used_rdt || shot.used_wdt || shot.used_leveler) && (
  <div className="flex gap-2 justify-center mt-2">
    {shot.used_rdt && (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">RDT</span>
    )}
    {shot.used_wdt && (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">WDT</span>
    )}
    {shot.used_leveler && (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Leveler</span>
    )}
  </div>
)}
```

### Edit-Modus (ShotEditForm)

- [ ] **Schritt 2: States in ShotEditForm hinzufügen**

In `ShotEditForm`, füge nach `const [tastingNotes, ...]` ein:

```tsx
const [usedRdt, setUsedRdt] = useState(shot.used_rdt ?? false)
const [usedWdt, setUsedWdt] = useState(shot.used_wdt ?? false)
const [usedLeveler, setUsedLeveler] = useState(shot.used_leveler ?? false)
```

- [ ] **Schritt 3: Checkbox-Sektion in ShotEditForm einfügen**

Füge nach dem `{/* Brühzeit */}`-Block und vor dem `{/* Ratings */}`-Block ein:

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

- [ ] **Schritt 4: Submit-Payload in ShotEditForm ergänzen**

In `handleSubmit` von `ShotEditForm`, im `updateShot.mutateAsync({...})`-Aufruf, füge nach `tasting_notes: tastingNotes.trim() || null,` ein:

```tsx
used_rdt: usedRdt,
used_wdt: usedWdt,
used_leveler: usedLeveler,
```

- [ ] **Schritt 5: ShotDetail-Test-Mock aktualisieren**

In `src/__tests__/ShotDetail.test.tsx`, füge im Mock-Objekt nach `tasting_notes: 'Schokolade',` ein:

```tsx
used_rdt: false,
used_wdt: false,
used_leveler: false,
```

- [ ] **Schritt 6: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler.

- [ ] **Schritt 7: Tests ausführen**

```bash
npm test -- --run
```

Erwartet: alle Tests grün.

- [ ] **Schritt 8: Commit**

```bash
git add src/pages/ShotDetail.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: add RDT/WDT/Leveler to ShotDetail view and edit"
```

---

## Task 5: Abschluss

- [ ] **Schritt 1: Alle Tests**

```bash
npm test -- --run
```

Erwartet: alle Tests grün.

- [ ] **Schritt 2: Build**

```bash
npm run build
```

Erwartet: Erfolg.

- [ ] **Schritt 3: Manuelle Prüfung**

```bash
npm run dev
```

- [ ] ShotHistory: Karten zeigen farbige Bewertungs-Badges (1=rot, 5=amber, 10=grün)
- [ ] Shot-Detail: Gesamtbewertung, Körper, Säure farbig
- [ ] NewShot: "Vorbereitung"-Block mit RDT/WDT/Leveler Checkboxen
- [ ] Shot bearbeiten: Checkboxen vorausgefüllt, im Detail-View Chips sichtbar

- [ ] **Schritt 4: Commit falls Fixes nötig**

```bash
git add -A
git commit -m "feat: shot enhancements complete"
```
