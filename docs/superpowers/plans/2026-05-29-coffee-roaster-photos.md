# Kaffee- & Rösterei-Fotos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fotos für Kaffees und Röstereien hinzufügen — Upload via Supabase Storage, Thumbnail in Listen, PhotoUpload in Formularen.

**Architecture:** Eine wiederverwendbare `PhotoUpload`-Komponente kapselt Upload/Entfernen/Vorschau via Supabase Storage. Sie wird in `CoffeeManager.tsx` (New/Edit) und `Roasters.tsx` (RoasterForm) eingebunden. Listen zeigen 40×40-Thumbnails mit Initialen-Fallback.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Supabase JS v2 (Storage), Vitest

---

## ⚠️ Supabase-Migrationen (vor Deploy ausführen)

```sql
ALTER TABLE coffees ADD COLUMN photo_url text;
ALTER TABLE roasters ADD COLUMN photo_url text;
```

Buckets `coffee-photos` und `roaster-photos` sind bereits angelegt (public).

---

## Datei-Übersicht

| Aktion | Pfad | Zweck |
|--------|------|-------|
| Modify | `src/types/index.ts` | `photo_url` zu `Coffee` und `Roaster` |
| Create | `src/components/PhotoUpload.tsx` | Upload/Vorschau/Entfernen-Komponente |
| Create | `src/__tests__/PhotoUpload.test.tsx` | Render-Tests |
| Modify | `src/pages/CoffeeManager.tsx` | Thumbnails in Liste + PhotoUpload in Formularen |
| Modify | `src/pages/Roasters.tsx` | Thumbnails in Liste + PhotoUpload in RoasterForm |

---

## Task 1: photo_url Typen

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Schritt 1: `photo_url` zu `Coffee` und `Roaster` hinzufügen**

In `src/types/index.ts`:

Füge in `Roaster` nach `website: string | null` ein:
```ts
photo_url: string | null
```

Füge in `Coffee` nach `altitude_m: number | null` ein:
```ts
photo_url: string | null
```

Die `NewCoffee`- und `NewRoaster`-Types (Omit) erben die Änderung automatisch.

- [ ] **Schritt 2: Build prüfen**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker && npm run build
```

Erwartet: kein TypeScript-Fehler. Falls Fehler wegen fehlendem `photo_url` in bestehenden Payloads — in den betroffenen Dateien `photo_url: null` hinzufügen.

- [ ] **Schritt 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add photo_url to Coffee and Roaster types"
```

---

## Task 2: PhotoUpload Komponente + Tests

**Files:**
- Create: `src/components/PhotoUpload.tsx`
- Create: `src/__tests__/PhotoUpload.test.tsx`

- [ ] **Schritt 1: Tests schreiben (TDD)**

Erstelle `src/__tests__/PhotoUpload.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { PhotoUpload } from '../components/PhotoUpload'
import { vi } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      }),
    },
  },
}))

test('zeigt Initialen-Placeholder ohne Foto', () => {
  render(
    <PhotoUpload bucket="coffee-photos" value={null} onChange={vi.fn()} name="Ethiopia" />
  )
  expect(screen.getByText('E')).toBeInTheDocument()
})

test('zeigt Bild wenn value vorhanden', () => {
  render(
    <PhotoUpload bucket="coffee-photos" value="https://example.com/photo.jpg" onChange={vi.fn()} name="Ethiopia" />
  )
  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
})

test('zeigt ☕ wenn kein Name angegeben', () => {
  render(
    <PhotoUpload bucket="coffee-photos" value={null} onChange={vi.fn()} />
  )
  expect(screen.getByText('☕')).toBeInTheDocument()
})
```

- [ ] **Schritt 2: Tests ausführen — müssen fehlschlagen**

```bash
npm test -- --run
```

Erwartet: FAIL — `PhotoUpload` not found.

- [ ] **Schritt 3: Komponente implementieren**

Erstelle `src/components/PhotoUpload.tsx`:

```tsx
import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  bucket: 'coffee-photos' | 'roaster-photos'
  value: string | null
  onChange: (url: string | null) => void
  name?: string
}

export function PhotoUpload({ bucket, value, onChange, name }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Datei zu groß (max 5 MB)')
      return
    }
    setError('')
    setUploading(true)

    if (value) {
      const oldFilename = value.split('/').pop()!
      await supabase.storage.from(bucket).remove([oldFilename])
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: true })

    if (uploadError) {
      setError('Upload fehlgeschlagen')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)
    onChange(publicUrl)
    setUploading(false)
    e.target.value = ''
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    if (!value) return
    const filename = value.split('/').pop()!
    await supabase.storage.from(bucket).remove([filename])
    onChange(null)
  }

  const initial = name?.[0]?.toUpperCase() ?? '☕'

  return (
    <div className="flex-shrink-0">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative rounded-lg overflow-hidden cursor-pointer group"
        style={{ width: 52, height: 52 }}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">{initial}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-white text-base">📷</span>
          )}
        </div>

        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity leading-none"
          >
            ×
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500 mt-1 w-14">{error}</p>}
    </div>
  )
}
```

- [ ] **Schritt 4: Tests ausführen — müssen grün sein**

```bash
npm test -- --run
```

Erwartet: alle Tests grün, mindestens die 3 neuen PhotoUpload-Tests.

- [ ] **Schritt 5: Commit**

```bash
git add src/components/PhotoUpload.tsx src/__tests__/PhotoUpload.test.tsx
git commit -m "feat: add PhotoUpload component"
```

---

## Task 3: CoffeeManager — Thumbnails + PhotoUpload in Formularen

**Files:**
- Modify: `src/pages/CoffeeManager.tsx`

### 3a — Thumbnail in `CoffeeList`

- [ ] **Schritt 1: Thumbnail-Markup in CoffeeList einfügen**

In `CoffeeManager.tsx`, in der `CoffeeList`-Funktion, finde das `<button>` für jeden Kaffee. Derzeit hat das Button diesen Inhalt:

```tsx
<button
  key={c.id}
  onClick={() => onSelect(c)}
  className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-left w-full hover:border-orange-300 transition-colors"
>
  <div>
    <p className="font-medium text-slate-800 text-sm">{c.name}</p>
    <p className="text-xs text-slate-400 mt-0.5">
      {[c.roaster, beanLabel(c)].filter(Boolean).join(' · ')}
    </p>
  </div>
  <div className="flex items-center gap-2">
    {c.roast_level && (
      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
        Röstgrad {c.roast_level}
      </span>
    )}
    <span className="text-slate-300 text-lg">›</span>
  </div>
</button>
```

Ersetze es durch:

```tsx
<button
  key={c.id}
  onClick={() => onSelect(c)}
  className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-left w-full hover:border-orange-300 transition-colors"
>
  <div className="flex items-center gap-3">
    {c.photo_url ? (
      <img src={c.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
    ) : (
      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
        <span className="text-orange-600 font-bold text-sm">{c.name[0]}</span>
      </div>
    )}
    <div>
      <p className="font-medium text-slate-800 text-sm">{c.name}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {[c.roaster, beanLabel(c)].filter(Boolean).join(' · ')}
      </p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    {c.roast_level && (
      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
        Röstgrad {c.roast_level}
      </span>
    )}
    <span className="text-slate-300 text-lg">›</span>
  </div>
</button>
```

### 3b — PhotoUpload in `NewCoffeeForm`

- [ ] **Schritt 2: Import hinzufügen**

Füge am Anfang von `CoffeeManager.tsx` hinzu:

```tsx
import { PhotoUpload } from '../components/PhotoUpload'
```

- [ ] **Schritt 3: `photoUrl`-State in `NewCoffeeForm` hinzufügen**

In `NewCoffeeForm`, nach `const [altitudeM, setAltitudeM] = useState('')`:

```tsx
const [photoUrl, setPhotoUrl] = useState<string | null>(null)
```

- [ ] **Schritt 4: PhotoUpload in `NewCoffeeForm` platzieren**

Ersetze den Name-Input-Block am Anfang des Formulars:

```tsx
{/* Vorher: */}
<input
  autoFocus
  value={name}
  onChange={e => setName(e.target.value)}
  placeholder="Name *"
  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
/>

{/* Nachher: */}
<div className="flex gap-3 items-start">
  <PhotoUpload
    bucket="coffee-photos"
    value={photoUrl}
    onChange={setPhotoUrl}
    name={name}
  />
  <input
    autoFocus
    value={name}
    onChange={e => setName(e.target.value)}
    placeholder="Name *"
    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
  />
</div>
```

- [ ] **Schritt 5: `photo_url` in `NewCoffeeForm` Submit-Payload hinzufügen**

In `handleSubmit` von `NewCoffeeForm`, in `createCoffee.mutateAsync({...})`, füge hinzu:

```tsx
photo_url: photoUrl,
```

(nach `altitude_m: altitudeM ? parseInt(altitudeM, 10) : null,`)

### 3c — PhotoUpload in `EditCoffeeForm`

- [ ] **Schritt 6: `photoUrl`-State in `EditCoffeeForm` hinzufügen**

In `EditCoffeeForm`, nach `const [altitudeM, ...]`:

```tsx
const [photoUrl, setPhotoUrl] = useState<string | null>(coffee.photo_url ?? null)
```

- [ ] **Schritt 7: PhotoUpload in `EditCoffeeForm` platzieren**

Gleich wie in NewCoffeeForm — ersetze den Name-Input durch:

```tsx
<div className="flex gap-3 items-start">
  <PhotoUpload
    bucket="coffee-photos"
    value={photoUrl}
    onChange={setPhotoUrl}
    name={name}
  />
  <input
    value={name}
    onChange={e => setName(e.target.value)}
    placeholder="Name *"
    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
  />
</div>
```

- [ ] **Schritt 8: `photo_url` in `EditCoffeeForm` Submit-Payload hinzufügen**

In `handleSubmit` von `EditCoffeeForm`, in `updateCoffee.mutateAsync({...})`, füge hinzu:

```tsx
photo_url: photoUrl,
```

(nach `altitude_m: altitudeM ? parseInt(altitudeM, 10) : null,`)

- [ ] **Schritt 9: Build + Tests**

```bash
npm run build && npm test -- --run
```

Erwartet: Build erfolgreich, alle Tests grün.

- [ ] **Schritt 10: Commit**

```bash
git add src/pages/CoffeeManager.tsx
git commit -m "feat: add photo thumbnails and upload to CoffeeManager"
```

---

## Task 4: Roasters — Thumbnails + PhotoUpload in RoasterForm

**Files:**
- Modify: `src/pages/Roasters.tsx`

### 4a — Thumbnail in `RoasterList`

- [ ] **Schritt 1: Import hinzufügen**

Füge am Anfang von `Roasters.tsx` hinzu:

```tsx
import { PhotoUpload } from '../components/PhotoUpload'
```

- [ ] **Schritt 2: Thumbnail in RoasterList-Karte einfügen**

In `RoasterList`, finde das `<button>` für jede Rösterei:

```tsx
<button
  key={r.id}
  onClick={() => onSelect(r)}
  className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-left w-full hover:border-orange-300 transition-colors"
>
  <div>
    <p className="font-medium text-slate-800 text-sm">{r.name}</p>
    {r.address && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{r.address}</p>}
  </div>
  <div className="flex items-center gap-2">
    {r.lat !== null && <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">📍</span>}
    <span className="text-slate-300 text-lg">›</span>
  </div>
</button>
```

Ersetze es durch:

```tsx
<button
  key={r.id}
  onClick={() => onSelect(r)}
  className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center text-left w-full hover:border-orange-300 transition-colors"
>
  <div className="flex items-center gap-3">
    {r.photo_url ? (
      <img src={r.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
    ) : (
      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
        <span className="text-orange-600 font-bold text-sm">{r.name[0]}</span>
      </div>
    )}
    <div>
      <p className="font-medium text-slate-800 text-sm">{r.name}</p>
      {r.address && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{r.address}</p>}
    </div>
  </div>
  <div className="flex items-center gap-2">
    {r.lat !== null && <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">📍</span>}
    <span className="text-slate-300 text-lg">›</span>
  </div>
</button>
```

### 4b — PhotoUpload in `RoasterForm`

- [ ] **Schritt 3: `photoUrl`-State in `RoasterForm` hinzufügen**

In `RoasterForm`, nach `const [error, setError] = useState('')`:

```tsx
const [photoUrl, setPhotoUrl] = useState<string | null>(roaster?.photo_url ?? null)
```

- [ ] **Schritt 4: PhotoUpload in `RoasterForm` platzieren**

`RoasterForm` hat ein Name-Input-Feld. Ersetze:

```tsx
{/* Vorher: */}
<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name *</label>
  <input
    autoFocus
    value={name}
    onChange={e => setName(e.target.value)}
    placeholder="z.B. Five Elephant"
    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
  />
</div>

{/* Nachher: */}
<div>
  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name *</label>
  <div className="flex gap-3 items-start">
    <PhotoUpload
      bucket="roaster-photos"
      value={photoUrl}
      onChange={setPhotoUrl}
      name={name}
    />
    <input
      autoFocus
      value={name}
      onChange={e => setName(e.target.value)}
      placeholder="z.B. Five Elephant"
      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
    />
  </div>
</div>
```

- [ ] **Schritt 5: `photo_url` in `RoasterForm` Submit-Payload hinzufügen**

In `handleSubmit` von `RoasterForm`, ersetze den payload:

```tsx
const payload = {
  name: name.trim(),
  address: address.trim() || null,
  lat,
  lng,
  website: website.trim() || null,
  photo_url: photoUrl,
}
```

- [ ] **Schritt 6: Build + Tests**

```bash
npm run build && npm test -- --run
```

Erwartet: Build erfolgreich, alle Tests grün.

- [ ] **Schritt 7: Commit**

```bash
git add src/pages/Roasters.tsx
git commit -m "feat: add photo thumbnails and upload to Roasters"
```

---

## Task 5: Abschluss

- [ ] **Schritt 1: Alle Tests grün**

```bash
npm test -- --run
```

Erwartet: alle Tests grün (mind. 24: 21 bisherige + 3 PhotoUpload-Tests).

- [ ] **Schritt 2: Build**

```bash
npm run build
```

Erwartet: Erfolg.

- [ ] **Schritt 3: Manuelle Prüfung**

```bash
npm run dev
```

Checkliste:
- [ ] Kaffee-Liste: Thumbnails/Initialen sichtbar
- [ ] Neuer Kaffee: Foto-Quadrat anklickbar → Datei-Picker → Foto erscheint
- [ ] Kaffee bearbeiten: Vorhandenes Foto angezeigt, × entfernt, Klick ändert
- [ ] Rösterei-Liste: Thumbnails/Initialen sichtbar
- [ ] RoasterForm (Neu + Edit): Foto-Upload funktioniert

- [ ] **Schritt 4: Commit falls Fixes nötig**

```bash
git add -A
git commit -m "feat: coffee and roaster photos complete"
```
