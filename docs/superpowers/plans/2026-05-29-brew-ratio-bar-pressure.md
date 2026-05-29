# Brew-Ratio Bar & Druckangabe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permanente visuelle Brew-Ratio Bar in Shot-Formularen + `pressure_bar`-Feld (Standard 9 bar) in NewShot und ShotDetail.

**Architecture:** Eine neue `BrewRatioBar`-Komponente kapselt die Visualisierung und wird in `NewShot` und `ShotEditForm` eingesetzt. `pressure_bar` wird als neues Feld im `Shot`-Typ ergänzt und in beiden Formularen als drittes Element im Mahlgrad/Temp-Grid angezeigt. Die Supabase-Migration muss vom User manuell ausgeführt werden.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## ⚠️ Supabase-Migration (vor dem Deploy ausführen)

```sql
ALTER TABLE shots ADD COLUMN pressure_bar float4 DEFAULT 9;
```

Diese SQL muss in der Supabase-Console unter dem Projekt ausgeführt werden, bevor die App deployed wird. Die Migration blockiert nicht die lokale Entwicklung — der Wert wird einfach ignoriert bis die Spalte existiert.

---

## Datei-Übersicht

| Aktion | Pfad | Zweck |
|--------|------|-------|
| Modify | `src/types/index.ts` | `pressure_bar` zu `Shot` hinzufügen |
| Create | `src/components/BrewRatioBar.tsx` | Wiederverwendbare Bar-Komponente |
| Create | `src/__tests__/BrewRatioBar.test.tsx` | Tests für BrewRatioBar |
| Modify | `src/pages/NewShot.tsx` | BrewRatioBar + Druckfeld + 3er-Grid |
| Modify | `src/pages/ShotDetail.tsx` | pressure_bar View + ShotEditForm Update |
| Modify | `src/__tests__/ShotDetail.test.tsx` | pressure_bar in Mock + neuer Test |

---

## Task 1: pressure_bar zum Shot-Typ hinzufügen

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Schritt 1: `pressure_bar` in das `Shot`-Interface einfügen**

In `src/types/index.ts`, füge `pressure_bar: number | null` nach `brew_ratio` ein:

```ts
export interface Shot {
  id: string
  coffee_id: string
  roast_date_id: string | null
  grind_setting: number
  dose_g: number | null
  yield_g: number | null
  brew_time_s: number | null
  temp_c: number | null
  rating: number
  body_score: number | null
  acidity_score: number | null
  brew_ratio: number | null
  pressure_bar: number | null
  tasting_notes: string | null
  pulled_at: string
  created_at: string
}
```

`NewShot` (Omit) erbt die Änderung automatisch — kein weiterer Handlungsbedarf.

- [ ] **Schritt 2: Build prüfen**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm run build
```

Erwartet: kein TypeScript-Fehler.

- [ ] **Schritt 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add pressure_bar to Shot type"
```

---

## Task 2: BrewRatioBar Komponente + Tests

**Files:**
- Create: `src/components/BrewRatioBar.tsx`
- Create: `src/__tests__/BrewRatioBar.test.tsx`

- [ ] **Schritt 1: Tests schreiben (TDD)**

Erstelle `src/__tests__/BrewRatioBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { BrewRatioBar } from '../components/BrewRatioBar'

test('zeigt Ratio und Labels wenn beide Werte vorhanden', () => {
  render(<BrewRatioBar doseG={18} yieldG={36} />)
  expect(screen.getByText('1 : 2.00')).toBeInTheDocument()
  expect(screen.getByText('18g Dose')).toBeInTheDocument()
  expect(screen.getByText('36g Yield')).toBeInTheDocument()
})

test('zeigt leeren Zustand wenn keine Werte', () => {
  render(<BrewRatioBar doseG={null} yieldG={null} />)
  expect(screen.getByText('— : —')).toBeInTheDocument()
})

test('zeigt Dose-Label auch wenn Yield fehlt', () => {
  render(<BrewRatioBar doseG={18} yieldG={null} />)
  expect(screen.getByText('18g Dose')).toBeInTheDocument()
  expect(screen.getByText('— : —')).toBeInTheDocument()
})
```

- [ ] **Schritt 2: Tests ausführen — müssen fehlschlagen**

```bash
npm test -- --run
```

Erwartet: FAIL — `BrewRatioBar` not found.

- [ ] **Schritt 3: Komponente implementieren**

Erstelle `src/components/BrewRatioBar.tsx`:

```tsx
interface Props {
  doseG: number | null
  yieldG: number | null
}

export function BrewRatioBar({ doseG, yieldG }: Props) {
  const ratio = doseG && yieldG && doseG > 0 ? yieldG / doseG : null
  const yieldFlex = ratio ?? 2

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div className="bg-orange-200" style={{ flex: 1 }} />
        <div
          className={ratio !== null ? 'bg-orange-500' : 'bg-slate-200'}
          style={{ flex: yieldFlex }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-slate-400">
          {doseG ? `${doseG}g Dose` : '—'}
        </span>
        <span className={`text-xs font-semibold ${ratio !== null ? 'text-orange-500' : 'text-slate-300'}`}>
          {ratio !== null ? `1 : ${ratio.toFixed(2)}` : '— : —'}
        </span>
        <span className="text-xs text-slate-400">
          {yieldG ? `${yieldG}g Yield` : '—'}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Schritt 4: Tests ausführen — müssen grün sein**

```bash
npm test -- --run
```

Erwartet: alle Tests grün, mindestens die 3 neuen BrewRatioBar-Tests.

- [ ] **Schritt 5: Commit**

```bash
git add src/components/BrewRatioBar.tsx src/__tests__/BrewRatioBar.test.tsx
git commit -m "feat: add BrewRatioBar component"
```

---

## Task 3: NewShot — BrewRatioBar + Druckfeld

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Schritt 1: Import hinzufügen und `pressureBar`-State anlegen**

In `src/pages/NewShot.tsx`:

Füge den Import oben hinzu (nach den bestehenden Imports):
```tsx
import { BrewRatioBar } from '../components/BrewRatioBar'
```

Füge den State nach `tastingNotes` ein:
```tsx
const [pressureBar, setPressureBar] = useState('9')
```

- [ ] **Schritt 2: Grind/Temp-Grid → 3er-Grid**

Ersetze das bisherige 2er-Grid (Mahlgrad + Temp):

```tsx
{/* Grind + Temp + Pressure */}
<div className="grid grid-cols-3 gap-3">
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad *</label>
    <input
      type="number" step="0.5" value={grindSetting}
      onChange={e => setGrindSetting(e.target.value)}
      placeholder="12"
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
    <input
      type="number" value={tempC}
      onChange={e => setTempC(e.target.value)}
      placeholder="93"
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Druck (bar)</label>
    <input
      type="number" step="0.1" value={pressureBar}
      onChange={e => setPressureBar(e.target.value)}
      placeholder="9"
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
</div>
```

- [ ] **Schritt 3: Ratio-Text durch BrewRatioBar ersetzen**

Ersetze im "Dose + Yield + Ratio"-Block den bedingten `<p>`-Text:

```tsx
{/* Vorher: */}
{brewRatio !== null && (
  <p className="text-xs text-slate-500 text-right">
    Verhältnis <span className="font-semibold text-orange-500">1 : {brewRatio.toFixed(2)}</span>
  </p>
)}

{/* Nachher: */}
<BrewRatioBar
  doseG={doseG ? parseFloat(doseG) : null}
  yieldG={yieldG ? parseFloat(yieldG) : null}
/>
```

Die `brewRatio`-Berechnung (Zeilen 89–92) bleibt für den Submit-Payload erhalten.

- [ ] **Schritt 4: `pressure_bar` zum Submit-Payload hinzufügen**

In `handleSubmit`, füge in den `createShot.mutateAsync(...)`-Aufruf ein:

```tsx
pressure_bar: pressureBar ? parseFloat(pressureBar) : null,
```

(nach `brew_ratio: brewRatio,`)

- [ ] **Schritt 5: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler.

- [ ] **Schritt 6: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat: add BrewRatioBar and pressure field to NewShot"
```

---

## Task 4: ShotDetail — pressure_bar anzeigen + ShotEditForm updaten

**Files:**
- Modify: `src/pages/ShotDetail.tsx`
- Modify: `src/__tests__/ShotDetail.test.tsx`

- [ ] **Schritt 1: `BrewRatioBar` importieren**

In `src/pages/ShotDetail.tsx`, füge den Import hinzu:

```tsx
import { BrewRatioBar } from '../components/BrewRatioBar'
```

- [ ] **Schritt 2: pressure_bar in View-Modus anzeigen**

Ersetze den "Temp + Röstdatum"-Block (der mit `{(shot.temp_c !== null || shot.roast_dates?.roast_date) &&`) durch:

```tsx
{/* Temp + Druck + Röstdatum */}
{(shot.temp_c !== null || shot.pressure_bar !== null || shot.roast_dates?.roast_date) && (
  <div className="grid grid-cols-2 gap-2 mb-3">
    {shot.temp_c !== null && (
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperatur</p>
        <p className="text-base font-bold text-slate-800">{shot.temp_c}°C</p>
      </div>
    )}
    {shot.pressure_bar !== null && (
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Druck</p>
        <p className="text-base font-bold text-slate-800">{shot.pressure_bar} bar</p>
      </div>
    )}
    {shot.roast_dates?.roast_date && (
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Röstdatum</p>
        <p className="text-sm font-bold text-slate-800">
          {new Date(shot.roast_dates.roast_date).toLocaleDateString('de-DE')}
        </p>
      </div>
    )}
  </div>
)}
```

- [ ] **Schritt 3: `pressureBar`-State in ShotEditForm hinzufügen**

In `ShotEditForm`, füge nach `tastingNotes`-State hinzu:

```tsx
const [pressureBar, setPressureBar] = useState(
  shot.pressure_bar !== null ? String(shot.pressure_bar) : '9'
)
```

- [ ] **Schritt 4: Grind/Temp-Grid → 3er-Grid in ShotEditForm**

Ersetze das 2er-Grid (Mahlgrad + Temp) in `ShotEditForm`:

```tsx
{/* Mahlgrad + Temp + Pressure */}
<div className="grid grid-cols-3 gap-3">
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mahlgrad *</label>
    <input
      type="number" step="0.5" value={grindSetting}
      onChange={e => setGrindSetting(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Temp (°C)</label>
    <input
      type="number" value={tempC}
      onChange={e => setTempC(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Druck (bar)</label>
    <input
      type="number" step="0.1" value={pressureBar}
      onChange={e => setPressureBar(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
</div>
```

- [ ] **Schritt 5: Ratio-Text durch BrewRatioBar in ShotEditForm ersetzen**

Im Einwaage/Ausbeute-Block von `ShotEditForm`, ersetze:

```tsx
{/* Vorher: */}
{brewRatio !== null && (
  <p className="text-xs text-slate-500 text-right">
    Verhältnis <span className="font-semibold text-orange-500">1 : {brewRatio.toFixed(2)}</span>
  </p>
)}

{/* Nachher: */}
<BrewRatioBar
  doseG={doseG ? parseFloat(doseG) : null}
  yieldG={yieldG ? parseFloat(yieldG) : null}
/>
```

- [ ] **Schritt 6: `pressure_bar` in ShotEditForm Submit-Payload hinzufügen**

In `handleSubmit` von `ShotEditForm`, füge im `updateShot.mutateAsync(...)`-Aufruf hinzu:

```tsx
pressure_bar: pressureBar ? parseFloat(pressureBar) : null,
```

(nach `brew_ratio: brewRatio,`)

- [ ] **Schritt 7: ShotDetail-Tests updaten — Mock und neuer Test**

In `src/__tests__/ShotDetail.test.tsx`, ergänze im Mock-Objekt (innerhalb von `useShot: () => ({ data: { ... } })`):

```tsx
pressure_bar: 9,
```

Füge dann am Ende der Datei einen neuen Test hinzu:

```tsx
test('zeigt Druck wenn pressure_bar vorhanden', () => {
  renderDetail()
  expect(screen.getByText('9 bar')).toBeInTheDocument()
})
```

- [ ] **Schritt 8: Tests ausführen**

```bash
npm test -- --run
```

Erwartet: alle Tests grün.

- [ ] **Schritt 9: Build prüfen**

```bash
npm run build
```

Erwartet: kein TypeScript-Fehler.

- [ ] **Schritt 10: Commit**

```bash
git add src/pages/ShotDetail.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: add pressure_bar display and BrewRatioBar to ShotDetail"
```

---

## Task 5: Abschluss

**Files:** keine neuen Änderungen — nur Verifikation

- [ ] **Schritt 1: Alle Tests grün**

```bash
npm test -- --run
```

Erwartet: alle Tests grün (mind. 20 Tests: 17 bisherige + 3 BrewRatioBar + 1 Druck-Test).

- [ ] **Schritt 2: Build**

```bash
npm run build
```

Erwartet: Erfolg, kein TypeScript-Fehler.

- [ ] **Schritt 3: Manuelle Prüfung im Browser**

```bash
npm run dev
```

Checkliste:
- [ ] NewShot: Bar erscheint sofort (grau rechts bis Ausbeute eingegeben)
- [ ] NewShot: Bei 18g / 36g → Bar 1/3 hell, 2/3 dunkel, Text "18g Dose · 1:2.00 · 36g Yield"
- [ ] NewShot: Druckfeld vorausgefüllt mit 9
- [ ] NewShot: Mahlgrad / Temp / Druck nebeneinander
- [ ] ShotDetail View: Druck-Kachel sichtbar
- [ ] ShotDetail Edit: 3er-Grid + BrewRatioBar

- [ ] **Schritt 4: Final Commit (nur wenn noch Fixes nötig waren)**

```bash
git add -A
git commit -m "feat: brew-ratio bar and pressure field complete"
```
