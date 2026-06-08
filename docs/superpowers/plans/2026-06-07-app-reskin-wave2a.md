# App-Reskin Welle 2a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create-Forms (NewShot/NewBrew) + geteilte Form-Komponenten auf Dark Premium, über neue Form-Primitives.

**Architecture:** Neue Primitives (`Input/Select/Textarea/FieldLabel/InfoButton/InfoBox`) in `src/components/ui/` kapseln die Dark-Form-Klassen. Seiten + geteilte Komponenten konsumieren sie + die Token-Klassen via fixem Mapping. Branch-only, kein Deploy.

**Tech Stack:** React 18 + Vite + TS + Tailwind (coffee-Tokens), Vitest + Testing Library.

---

## File Structure
- Create: `src/components/ui/Input.tsx` (+ `fieldClasses`), `Select.tsx`, `Textarea.tsx`, `FieldLabel.tsx`, `InfoButton.tsx`, `InfoBox.tsx`
- Modify: `src/components/ui/index.ts` (Barrel), `src/__tests__/ui.test.tsx`
- Modify: `src/components/RatingInput.tsx`, `src/components/BrewTimer.tsx`, `src/components/BrewRatioBar.tsx`
- Modify: `src/__tests__/RatingInput.test.tsx`
- Modify: `src/pages/NewShot.tsx`, `src/pages/NewBrew.tsx`

## Klassen-Mapping (verbindlich für alle Seiten-Reskins)
| alt | neu |
|---|---|
| Panel/Karten `bg-white` | `bg-coffee-surface2` (oder `Card`/`cardClasses`) |
| `border-slate-200` | `border-coffee-line` |
| `text-slate-800` | `text-coffee-cream` |
| `text-slate-700` / `text-slate-600` | `text-coffee-text` |
| `text-slate-500` / `text-slate-400` | `text-coffee-muted` |
| `text-slate-300` | `text-coffee-muted/60` |
| `bg-slate-50` | `bg-coffee-bg` |
| `bg-slate-100` | `bg-coffee-surface2` |
| Primär-Button `bg-orange-500 text-white` | `buttonClasses('primary')` |
| `bg-orange-50` / `text-orange-700` (Badge/Akzentfläche) | `Badge` bzw. `bg-coffee-accent/15 text-coffee-accent-soft` |
| `text-orange-500` / `text-orange-600` | `text-coffee-accent-soft` |
| `focus:border-orange-400` / eigene `focus:ring-*` an Feldern | entfällt (steckt in `Input`/`Select`/`Textarea`) |
| `<input>` / `<select>` / `<textarea>` (Roh) | `Input` / `Select` / `Textarea` |
| `<label class="… uppercase …">` | `FieldLabel` |

---

## Task 1: Form-Primitives Input/Select/Textarea/FieldLabel

**Files:**
- Create: `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `FieldLabel.tsx`

- [ ] **Step 1: Input + fieldClasses**

`src/components/ui/Input.tsx`:

```tsx
import type { InputHTMLAttributes } from 'react'

export const fieldClasses =
  'block w-full rounded-lg border border-coffee-line bg-coffee-bg px-3 py-2.5 text-sm text-coffee-text placeholder:text-coffee-muted/60 focus:border-coffee-accent focus:outline-none focus:ring-2 focus:ring-coffee-accent/20'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClasses} ${className}`} {...rest} />
}
```

- [ ] **Step 2: Select**

`src/components/ui/Select.tsx`:

```tsx
import type { SelectHTMLAttributes } from 'react'
import { fieldClasses } from './Input'

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23a89784' stroke-width='2'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")"

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${fieldClasses} appearance-none bg-no-repeat ${className}`}
      style={{ backgroundImage: CHEVRON, backgroundPosition: 'right 13px center' }}
      {...rest}
    >
      {children}
    </select>
  )
}
```

- [ ] **Step 3: Textarea**

`src/components/ui/Textarea.tsx`:

```tsx
import type { TextareaHTMLAttributes } from 'react'
import { fieldClasses } from './Input'

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClasses} ${className}`} {...rest} />
}
```

- [ ] **Step 4: FieldLabel**

`src/components/ui/FieldLabel.tsx`:

```tsx
import type { LabelHTMLAttributes, ReactNode } from 'react'

export function FieldLabel({
  required,
  className = '',
  children,
  ...rest
}: { required?: boolean; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide text-coffee-muted ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-coffee-accent"> *</span>}
    </label>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: 0 Fehler.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/Select.tsx src/components/ui/Textarea.tsx src/components/ui/FieldLabel.tsx
git commit -m "feat(reskin): Form-Primitives Input/Select/Textarea/FieldLabel"
```

---

## Task 2: InfoButton/InfoBox + Barrel + Tests

**Files:**
- Create: `src/components/ui/InfoButton.tsx`, `src/components/ui/InfoBox.tsx`
- Modify: `src/components/ui/index.ts`, `src/__tests__/ui.test.tsx`

- [ ] **Step 1: InfoButton**

`src/components/ui/InfoButton.tsx`:

```tsx
export function InfoButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
        open ? 'bg-coffee-accent text-coffee-bg' : 'bg-coffee-surface2 text-coffee-muted hover:bg-coffee-surface'
      }`}
    >
      i
    </button>
  )
}
```

- [ ] **Step 2: InfoBox**

`src/components/ui/InfoBox.tsx`:

```tsx
import type { ReactNode } from 'react'

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 rounded-lg border border-coffee-accent/30 bg-coffee-surface2 p-3 text-xs text-coffee-cream/80">
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Barrel erweitern**

Hänge an `src/components/ui/index.ts` an:

```ts
export { Input, fieldClasses } from './Input'
export { Select } from './Select'
export { Textarea } from './Textarea'
export { FieldLabel } from './FieldLabel'
export { InfoButton } from './InfoButton'
export { InfoBox } from './InfoBox'
```

- [ ] **Step 4: Tests anfügen**

In `src/__tests__/ui.test.tsx` ergänze Importe + Tests:

```tsx
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { FieldLabel } from '../components/ui/FieldLabel'
import { InfoButton } from '../components/ui/InfoButton'
import { InfoBox } from '../components/ui/InfoBox'

test('Input reicht Props durch + Feld-Klasse', () => {
  render(<Input placeholder="grind" />)
  const el = screen.getByPlaceholderText('grind')
  expect(el.className).toContain('bg-coffee-bg')
})

test('Select rendert Optionen', () => {
  render(<Select><option>Espresso Forte</option></Select>)
  expect(screen.getByRole('option', { name: 'Espresso Forte' })).toBeInTheDocument()
})

test('FieldLabel zeigt Stern bei required', () => {
  render(<FieldLabel required>Rating</FieldLabel>)
  expect(screen.getByText('Rating')).toBeInTheDocument()
  expect(screen.getByText('*')).toBeInTheDocument()
})

test('InfoButton open-State nutzt Gold', () => {
  render(<InfoButton open onClick={() => {}} />)
  expect(screen.getByRole('button', { name: 'i' }).className).toContain('bg-coffee-accent')
})

test('InfoBox rendert Kinder', () => {
  render(<InfoBox>Erklärung</InfoBox>)
  expect(screen.getByText('Erklärung')).toBeInTheDocument()
})
```

- [ ] **Step 5: Tests laufen**

Run: `npx vitest run src/__tests__/ui.test.tsx`
Expected: PASS (alle, inkl. Welle-1-ui-Tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/InfoButton.tsx src/components/ui/InfoBox.tsx src/components/ui/index.ts src/__tests__/ui.test.tsx
git commit -m "feat(reskin): InfoButton/InfoBox + ui barrel + tests"
```

---

## Task 3: RatingInput reskin (Gold)

**Files:**
- Modify: `src/components/RatingInput.tsx`
- Modify: `src/__tests__/RatingInput.test.tsx`

- [ ] **Step 1: Test auf Gold umstellen (failing)**

In `src/__tests__/RatingInput.test.tsx` die Assertions `bg-orange-500` → `bg-coffee-accent`:

```tsx
expect(screen.getByRole('button', { name: '5' })).toHaveClass('bg-coffee-accent')
expect(screen.getByRole('button', { name: '3' })).not.toHaveClass('bg-coffee-accent')
```

- [ ] **Step 2: Test rot**

Run: `npx vitest run src/__tests__/RatingInput.test.tsx`
Expected: FAIL (Komponente nutzt noch `bg-orange-500`).

- [ ] **Step 3: RatingInput umfärben**

Ersetze in `src/components/RatingInput.tsx` den `className`-Ausdruck des Buttons:

```tsx
          className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
            value === n
              ? 'bg-coffee-accent text-coffee-bg'
              : 'bg-coffee-surface2 text-coffee-muted hover:bg-coffee-surface'
          }`}
```

- [ ] **Step 4: Test grün**

Run: `npx vitest run src/__tests__/RatingInput.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/RatingInput.tsx src/__tests__/RatingInput.test.tsx
git commit -m "feat(reskin): RatingInput Gold-Akzent"
```

---

## Task 4: BrewTimer reskin

**Files:**
- Modify: `src/components/BrewTimer.tsx`

- [ ] **Step 1: Klassen dunkel**

Ersetze in `src/components/BrewTimer.tsx` den `return`-Block (Logik unverändert):

```tsx
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 font-mono text-base font-semibold text-coffee-cream">{elapsed}s</span>
      {!running ? (
        <button type="button" onClick={start} className="rounded bg-coffee-surface2 px-3 py-1 text-sm text-coffee-cream hover:bg-coffee-surface">
          ▶ Start
        </button>
      ) : (
        <button type="button" onClick={stop} className="rounded bg-coffee-accent px-3 py-1 text-sm font-semibold text-coffee-bg">
          ■ Stop
        </button>
      )}
      {elapsed > 0 && !running && (
        <button type="button" onClick={reset} className="rounded bg-coffee-surface2 px-2 py-1 text-sm text-coffee-muted hover:bg-coffee-surface">
          ↺
        </button>
      )}
    </div>
  )
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: 0 Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/components/BrewTimer.tsx
git commit -m "feat(reskin): BrewTimer dark"
```

---

## Task 5: BrewRatioBar reskin (Gold)

**Files:**
- Modify: `src/components/BrewRatioBar.tsx`

- [ ] **Step 1: Klassen dunkel/gold**

Ersetze in `src/components/BrewRatioBar.tsx` den `return`-Block (Logik unverändert):

```tsx
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-coffee-bg">
        <div className="bg-coffee-accent/30" style={{ flex: 1 }} />
        <div
          className={ratio !== null ? 'bg-coffee-accent' : 'bg-coffee-surface2'}
          style={{ flex: yieldFlex }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-coffee-muted">{doseG ? `${doseG}g Dose` : '—'}</span>
        <span className={`text-xs font-semibold ${ratio !== null ? 'text-coffee-accent-soft' : 'text-coffee-muted/60'}`}>
          {ratio !== null ? `1 : ${ratio.toFixed(2)}` : '— : —'}
        </span>
        <span className="text-xs text-coffee-muted">{yieldG ? `${yieldG}g Yield` : '—'}</span>
      </div>
    </div>
  )
```

- [ ] **Step 2: Typecheck + Card-/Ratio-Tests**

Run: `npx tsc -b && npx vitest run`
Expected: tsc 0; alle grün.

- [ ] **Step 3: Commit**

```bash
git add src/components/BrewRatioBar.tsx
git commit -m "feat(reskin): BrewRatioBar dark/gold"
```

---

## Task 6: NewShot reskin

**Files:**
- Modify: `src/pages/NewShot.tsx`

- [ ] **Step 1: Imports ergänzen**

Füge zu den Importen in `src/pages/NewShot.tsx` hinzu:

```tsx
import { PageHeader, Input, Select, Textarea, FieldLabel, InfoButton, InfoBox, buttonClasses, Card } from '../components/ui'
```

- [ ] **Step 2: Seitentitel über PageHeader**

Ersetze die bestehende Titel-Überschrift (z.B. `<h1 class="text-xl font-bold text-slate-800">…</h1>`, ggf. mit Emoji/Back-Button-Zeile) durch `<PageHeader title="New Shot" />` (Back-Verhalten, falls vorhanden, als `action` oder davor belassen). Emoji entfernen.

- [ ] **Step 3: Felder auf Primitives**

Ersetze jedes rohe Control nach Mapping:
- `<input … className="… border-slate-200 … focus:border-orange-400 …" />` → `<Input … />` (Feld-Klassen entfernen, nur fachliche Extras wie `type`/`value`/`onChange`/`step` behalten; Sonderbreiten via `className`).
- `<select …>` → `<Select …>` (Children-`<option>` bleiben).
- `<textarea …>` → `<Textarea …>`.
- Labels (`<label class="… uppercase text-slate-… ">`) → `<FieldLabel>` (mit `required` wo `*`).

- [ ] **Step 4: i-Button-Erklär-Muster**

Ersetze die Rating-Erklärungs-Blöcke: den runden i-Toggle → `<InfoButton open={open} onClick={() => setOpen(v => !v)} />`; das aufklappbare Panel-`<div class="… bg-white border …">` → `<InfoBox> … </InfoBox>` (innerer 1→10-Inhalt bleibt, nur die beiden Skala-Kacheln `bg-slate-50` → `bg-coffee-bg`, Texte → `text-coffee-cream`/`text-coffee-muted`).

- [ ] **Step 5: Buttons + Panels + Resttext nach Mapping**

- Save/Submit-Button → `className={buttonClasses('primary')}` (bzw. `w-full`), Sekundär → `buttonClasses('secondary')`.
- Sektions-/Karten-Container `bg-white border border-slate-200` → `Card` bzw. `cardClasses`.
- Alle übrigen `text-slate-*`/`bg-slate-*`/`border-slate-*`/`text-orange-*`/`bg-orange-*` nach Mapping-Tabelle.

- [ ] **Step 6: Verify — keine alten Klassen/Emojis mehr**

Run:
```bash
grep -nE "bg-white|border-slate|text-slate|bg-slate|bg-orange|text-orange|focus:border-orange|☕|📋|🫙|⚙️|📷|📸" src/pages/NewShot.tsx
```
Expected: keine Treffer. (Falls Treffer → nach Mapping ersetzen.)

- [ ] **Step 7: Typecheck + Build + Tests**

Run: `npx tsc -b && npx vitest run && npm run build`
Expected: tsc 0; alle grün; Build ok.

- [ ] **Step 8: Commit**

```bash
git add src/pages/NewShot.tsx
git commit -m "feat(reskin): NewShot dark (Form-Primitives)"
```

---

## Task 7: NewBrew reskin

**Files:**
- Modify: `src/pages/NewBrew.tsx`

- [ ] **Step 1: Imports ergänzen**

```tsx
import { PageHeader, Input, Select, Textarea, FieldLabel, InfoButton, InfoBox, buttonClasses, Card } from '../components/ui'
```

- [ ] **Step 2: Titel + Felder + i-Boxen + Buttons nach Mapping**

Gleiches Vorgehen wie Task 6 Schritte 2–5 auf `NewBrew.tsx` anwenden:
- Titel → `<PageHeader title="New Brew" />`, Emoji raus.
- `<input>/<select>/<textarea>` → `Input`/`Select`/`Textarea`; Labels → `FieldLabel`.
- Die inline `RatingField`-Komponente in NewBrew: deren i-Toggle → `InfoButton`, Erklär-Panel → `InfoBox` (1→10-Inhalt behalten, Skala-Kacheln `bg-slate-50` → `bg-coffee-bg`).
- Methoden-Auswahl/Badges (`bg-orange-50 text-orange-700`) → `Badge` bzw. `bg-coffee-accent/15 text-coffee-accent-soft`.
- Save-Button → `buttonClasses('primary')`; Container → `Card`/`cardClasses`; Resttext nach Mapping.

- [ ] **Step 3: Verify — keine alten Klassen/Emojis**

Run:
```bash
grep -nE "bg-white|border-slate|text-slate|bg-slate|bg-orange|text-orange|focus:border-orange|☕|🫖|🫙|⚙️|📷|📸" src/pages/NewBrew.tsx
```
Expected: keine Treffer.

- [ ] **Step 4: Typecheck + Build + Tests**

Run: `npx tsc -b && npx vitest run && npm run build`
Expected: tsc 0; alle grün; Build ok.

- [ ] **Step 5: Commit**

```bash
git add src/pages/NewBrew.tsx
git commit -m "feat(reskin): NewBrew dark (Form-Primitives)"
```

---

## Task 8: Verifikation (visuell + Build)

**Files:** keine

- [ ] **Step 1: Dev-Server**

Run: `npm run dev -- --port 4321 --strictPort` (Hintergrund), bis „ready".

- [ ] **Step 2: Screenshots (Selbst-Review)**

`p0-shoot.mjs` im Projekt, danach löschen:

```js
import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [w, name] of [[1280, 'desktop'], [390, 'mobile']]) {
  const p = await b.newPage({ viewport: { width: w, height: 1200 } })
  for (const path of ['/app/shots/new', '/app/brews/new']) {
    await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' })
    await p.waitForTimeout(1200)
    await p.screenshot({ path: `/tmp/w2a-${name}-${path.replace(/\W+/g, '_')}.png`, fullPage: true })
  }
}
await b.close()
console.log('done')
```
Run: `node p0-shoot.mjs && rm p0-shoot.mjs`

- [ ] **Step 3: Screenshots prüfen**

Lies `/tmp/w2a-*.png`. Checkliste: dunkle Formulare; recessed Felder mit Gold-Fokus; Selects mit Chevron; Labels muted-uppercase; Rating-Buttons gold-aktiv; Info-Boxen dark + Gold-i; Brew-Ratio-Bar gold; Save-Button gold; **keine Emojis**; Funktion (Anlegen) intakt.

- [ ] **Step 4: Voller Lauf**

Run: `npx vitest run && npm run build`
Expected: alle grün; Build ok.

- [ ] **Step 5: NICHT deployen** — bleibt auf `animations-update`.

---

## Notes
- Reihenfolge wichtig: Tasks 1–2 (Primitives) vor 6–7 (Seiten nutzen sie).
- Falls ein rohes Control fachliche Inline-Styles/Breiten hatte, via `className`-Prop an `Input`/`Select`/`Textarea` weiterreichen (werden an `fieldClasses` angehängt).
- `ShotDetail`/`BrewDetail` (Welle 2b) + `PhotoUpload`/Content-Seiten (Welle 3) bleiben unangetastet.
