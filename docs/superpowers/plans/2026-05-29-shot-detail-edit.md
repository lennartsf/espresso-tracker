# Shot Detail & Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shots in der ShotHistory anklickbar machen und eine Detail-/Bearbeitungsansicht unter `/shots/:id` hinzufügen.

**Architecture:** ShotCard wird zu einem React Router Link. Eine neue Route `/shots/:id` rendert `ShotDetail.tsx`, das zwischen View- und Edit-Modus togglet (analog zu CoffeeManager). Drei neue Hooks (`useShot`, `useUpdateShot`, `useDeleteShot`) kapseln Supabase-Zugriffe.

**Tech Stack:** React 18, React Router v6, TanStack Query v5, Supabase JS v2, Vitest, @testing-library/react

---

## Datei-Übersicht

| Aktion | Pfad | Zweck |
|--------|------|-------|
| Modify | `src/hooks/useShots.ts` | `useShot`, `useUpdateShot`, `useDeleteShot` hinzufügen |
| Modify | `src/components/ShotCard.tsx` | Wrap in `<Link>` |
| Create | `src/pages/ShotDetail.tsx` | View + Edit Modus |
| Modify | `src/App.tsx` | Route `/shots/:id` registrieren |
| Create | `src/__tests__/ShotDetail.test.tsx` | Render-Tests |

---

## Task 1: Hooks erweitern

**Files:**
- Modify: `src/hooks/useShots.ts`

- [ ] **Schritt 1: `useShot` hinzufügen** — lädt einen einzelnen Shot mit Join

Füge nach `useShots` in `src/hooks/useShots.ts` ein:

```ts
export function useShot(id: string) {
  return useQuery({
    queryKey: ['shot', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shots')
        .select('*, coffees(name), roast_dates(roast_date)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as ShotWithCoffee
    },
    enabled: !!id,
  })
}
```

- [ ] **Schritt 2: `useUpdateShot` hinzufügen**

```ts
export function useUpdateShot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (shot: Partial<Shot> & { id: string }) => {
      const { id, ...fields } = shot
      const { data, error } = await supabase
        .from('shots')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Shot
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['shots'] })
      qc.invalidateQueries({ queryKey: ['shot', data.id] })
    },
  })
}
```

- [ ] **Schritt 3: `useDeleteShot` hinzufügen**

```ts
export function useDeleteShot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shots').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shots'] }),
  })
}
```

- [ ] **Schritt 4: Build prüfen**

```bash
npm run build
```

Erwartet: kein TypeScript-Fehler.

- [ ] **Schritt 5: Commit**

```bash
git add src/hooks/useShots.ts
git commit -m "feat: add useShot, useUpdateShot, useDeleteShot hooks"
```

---

## Task 2: ShotCard anklickbar machen

**Files:**
- Modify: `src/components/ShotCard.tsx`

- [ ] **Schritt 1: Import hinzufügen und `<Link>` wrappen**

Ersetze die komplette Datei `src/components/ShotCard.tsx`:

```tsx
import { Link } from 'react-router-dom'
import type { ShotWithCoffee } from '../hooks/useShots'

interface Props {
  shot: ShotWithCoffee
}

function ratingStyle(r: number) {
  if (r >= 8) return 'bg-green-100 text-green-700'
  if (r >= 5) return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-500'
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
      <span className={`text-sm font-bold px-2 py-0.5 rounded ${ratingStyle(shot.rating)}`}>
        {shot.rating}
      </span>
    </Link>
  )
}
```

- [ ] **Schritt 2: Build prüfen**

```bash
npm run build
```

Erwartet: kein Fehler.

- [ ] **Schritt 3: Commit**

```bash
git add src/components/ShotCard.tsx
git commit -m "feat: make ShotCard a clickable link to /shots/:id"
```

---

## Task 3: ShotDetail — View-Modus

**Files:**
- Create: `src/pages/ShotDetail.tsx`

- [ ] **Schritt 1: `ShotDetail.tsx` anlegen — Grundstruktur mit View-Modus**

Erstelle `src/pages/ShotDetail.tsx`:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShot, useDeleteShot } from '../hooks/useShots'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ratingBadge(v: number) {
  if (v >= 8) return 'bg-green-100 text-green-700'
  if (v >= 5) return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-500'
}

export function ShotDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: shot, isLoading } = useShot(id!)
  const deleteShot = useDeleteShot()
  const [editing, setEditing] = useState(false)

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">Laden...</p>
  if (!shot) return (
    <div className="text-center py-10">
      <p className="text-slate-500 text-sm mb-3">Shot nicht gefunden.</p>
      <button onClick={() => navigate('/shots')} className="text-orange-500 text-sm font-semibold">← Zurück</button>
    </div>
  )

  if (editing) return <ShotEditForm shot={shot} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm('Shot wirklich löschen?')) return
    await deleteShot.mutateAsync(shot!.id)
    navigate('/shots')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/shots')} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">{shot.coffees?.name ?? '—'}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">
            Bearbeiten
          </button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">
            Löschen
          </button>
        </div>
      </div>

      {/* Rating prominent */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase">Gesamtbewertung</span>
        <span className={`text-2xl font-bold px-3 py-0.5 rounded-lg ${ratingBadge(shot.rating)}`}>
          {shot.rating}
        </span>
      </div>

      {/* Body + Acidity badges */}
      {(shot.body_score !== null || shot.acidity_score !== null) && (
        <div className="flex gap-2 mb-3">
          {shot.body_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Körper</p>
              <p className="font-bold text-slate-700">{shot.body_score}</p>
            </div>
          )}
          {shot.acidity_score !== null && (
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Säure</p>
              <p className="font-bold text-slate-700">{shot.acidity_score}</p>
            </div>
          )}
        </div>
      )}

      {/* 2×2 Parameter Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Mahlgrad</p>
          <p className="text-base font-bold text-slate-800">{shot.grind_setting}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Brühzeit</p>
          <p className="text-base font-bold text-slate-800">{shot.brew_time_s ? `${shot.brew_time_s}s` : '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Einwaage → Ausbeute</p>
          <p className="text-base font-bold text-slate-800">
            {shot.dose_g && shot.yield_g ? `${shot.dose_g}g → ${shot.yield_g}g` : '—'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Verhältnis</p>
          <p className="text-base font-bold text-orange-500">
            {shot.brew_ratio ? `1 : ${shot.brew_ratio.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {/* Temp + Röstdatum */}
      {(shot.temp_c !== null || shot.roast_dates?.roast_date) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {shot.temp_c !== null && (
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Temperatur</p>
              <p className="text-base font-bold text-slate-800">{shot.temp_c}°C</p>
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

      {/* Tasting notes */}
      {shot.tasting_notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Geschmacksnotizen</p>
          <p className="text-sm text-slate-700 italic">„{shot.tasting_notes}"</p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-slate-400 text-center mt-4">{formatDate(shot.pulled_at)}</p>
    </div>
  )
}

// Placeholder — wird in Task 4 ersetzt
function ShotEditForm(_: { shot: any; onCancel: () => void; onSaved: () => void }) {
  return null
}
```

- [ ] **Schritt 2: Route in App.tsx registrieren**

In `src/App.tsx` — import hinzufügen:

```tsx
import { ShotDetail } from './pages/ShotDetail'
```

Innerhalb von `<Route element={<Layout />}>` nach `shots/new` einfügen:

```tsx
<Route path="shots/:id" element={<ShotDetail />} />
```

- [ ] **Schritt 3: Dev-Server starten und View-Modus manuell testen**

```bash
npm run dev
```

Öffne http://localhost:5173/shots, klicke einen Shot an → Detail-Seite sollte erscheinen, alle Parameter korrekt angezeigt, Back-Button navigiert zurück.

- [ ] **Schritt 4: Render-Test für View-Modus**

Erstelle `src/__tests__/ShotDetail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { ShotDetail } from '../pages/ShotDetail'

vi.mock('../hooks/useShots', () => ({
  useShot: () => ({
    data: {
      id: 'shot-1',
      coffee_id: 'coffee-1',
      roast_date_id: null,
      grind_setting: 12.5,
      dose_g: 18,
      yield_g: 36,
      brew_ratio: 2.0,
      brew_time_s: 28,
      temp_c: 93,
      rating: 8,
      body_score: 7,
      acidity_score: 5,
      tasting_notes: 'Schokolade',
      pulled_at: '2026-05-29T09:32:00.000Z',
      created_at: '2026-05-29T09:32:00.000Z',
      coffees: { name: 'Ethiopia Yirgacheffe' },
      roast_dates: null,
    },
    isLoading: false,
  }),
  useDeleteShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../hooks/useCoffees', () => ({
  useCoffees: () => ({ data: [] }),
  useRoastDates: () => ({ data: [] }),
}))

function renderDetail() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/shots/shot-1']}>
        <Routes>
          <Route path="/shots/:id" element={<ShotDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('zeigt Kaffee-Name und Bewertung', () => {
  renderDetail()
  expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument()
  expect(screen.getByText('8')).toBeInTheDocument()
})

test('zeigt Mahlgrad', () => {
  renderDetail()
  expect(screen.getByText('12.5')).toBeInTheDocument()
})

test('zeigt Tasting Notes', () => {
  renderDetail()
  expect(screen.getByText(/Schokolade/)).toBeInTheDocument()
})
```

- [ ] **Schritt 5: Tests ausführen**

```bash
npm test
```

Erwartet: alle Tests grün (mindestens die 3 neuen + bestehende).

- [ ] **Schritt 6: Commit**

```bash
git add src/pages/ShotDetail.tsx src/App.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: add ShotDetail view mode with route /shots/:id"
```

---

## Task 4: ShotDetail — Edit-Modus

**Files:**
- Modify: `src/pages/ShotDetail.tsx` — `ShotEditForm` Placeholder ersetzen

- [ ] **Schritt 1: Hilfsfunktionen für Datum-Konvertierung am Anfang der Datei hinzufügen**

Füge nach den bestehenden Hilfsfunktionen in `src/pages/ShotDetail.tsx` ein:

```ts
function toDatetimeLocal(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16)
}

function fromDatetimeLocal(local: string): string {
  return new Date(local).toISOString()
}
```

- [ ] **Schritt 2: `ShotEditForm` Placeholder komplett ersetzen**

Ersetze die Placeholder-Funktion am Ende von `src/pages/ShotDetail.tsx` (Imports kommen in Schritt 3):

```tsx
function ShotEditForm({
  shot, onCancel, onSaved,
}: {
  shot: ShotWithCoffee
  onCancel: () => void
  onSaved: () => void
}) {
  const updateShot = useUpdateShot()
  const { data: coffees = [] } = useCoffees()

  const [pulledAt, setPulledAt] = useState(toDatetimeLocal(shot.pulled_at))
  const [coffeeId, setCoffeeId] = useState(shot.coffee_id)
  const [roastDateId, setRoastDateId] = useState(shot.roast_date_id ?? '')
  const [grindSetting, setGrindSetting] = useState(String(shot.grind_setting))
  const [doseG, setDoseG] = useState(shot.dose_g ? String(shot.dose_g) : '')
  const [yieldG, setYieldG] = useState(shot.yield_g ? String(shot.yield_g) : '')
  const [brewTimeS, setBrewTimeS] = useState(shot.brew_time_s ? String(shot.brew_time_s) : '')
  const [tempC, setTempC] = useState(shot.temp_c ? String(shot.temp_c) : '')
  const [rating, setRating] = useState<number | null>(shot.rating)
  const [bodyScore, setBodyScore] = useState<number | null>(shot.body_score)
  const [acidityScore, setAcidityScore] = useState<number | null>(shot.acidity_score)
  const [tastingNotes, setTastingNotes] = useState(shot.tasting_notes ?? '')
  const [error, setError] = useState('')

  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const recentDates = roastDates.slice(0, 2)

  const doseNum = parseFloat(doseG)
  const yieldNum = parseFloat(yieldG)
  const brewRatio = doseNum > 0 && yieldNum > 0 ? yieldNum / doseNum : null

  function handleCoffeeChange(id: string) {
    setCoffeeId(id)
    setRoastDateId('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!grindSetting) { setError('Mahlgrad ist erforderlich.'); return }
    if (!rating) { setError('Bitte den Shot bewerten.'); return }

    await updateShot.mutateAsync({
      id: shot.id,
      coffee_id: coffeeId,
      roast_date_id: roastDateId || null,
      pulled_at: fromDatetimeLocal(pulledAt),
      grind_setting: parseFloat(grindSetting),
      dose_g: doseG ? parseFloat(doseG) : null,
      yield_g: yieldG ? parseFloat(yieldG) : null,
      brew_ratio: brewRatio,
      brew_time_s: brewTimeS ? parseInt(brewTimeS, 10) : null,
      temp_c: tempC ? parseFloat(tempC) : null,
      rating,
      body_score: bodyScore,
      acidity_score: acidityScore,
      tasting_notes: tastingNotes.trim() || null,
    })
    onSaved()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="text-slate-400 text-lg">←</button>
          <h1 className="text-xl font-bold text-slate-800">Shot bearbeiten</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Datum & Uhrzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Datum & Uhrzeit</label>
          <input
            type="datetime-local"
            value={pulledAt}
            onChange={e => setPulledAt(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Kaffee */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kaffee *</label>
          <select
            value={coffeeId}
            onChange={e => handleCoffeeChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400"
          >
            {coffees.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.roaster ? ` / ${c.roaster}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Röstdatum */}
        {recentDates.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Röstdatum</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoastDateId('')}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  roastDateId === '' ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold' : 'border-slate-200 text-slate-500 bg-white'
                }`}
              >
                Keine
              </button>
              {recentDates.map((rd, i) => (
                <button
                  key={rd.id}
                  type="button"
                  onClick={() => setRoastDateId(rd.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors text-center ${
                    roastDateId === rd.id ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold' : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  {formatDate(rd.roast_date)}
                  {i === 0 && <span className="block text-xs text-slate-400 font-normal">Aktuell</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mahlgrad + Temp */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Einwaage + Ausbeute + Ratio */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Einwaage (g)</label>
              <input
                type="number" step="0.1" value={doseG}
                onChange={e => setDoseG(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ausbeute (g)</label>
              <input
                type="number" step="0.1" value={yieldG}
                onChange={e => setYieldG(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
          {brewRatio !== null && (
            <p className="text-xs text-slate-500 text-right">
              Verhältnis <span className="font-semibold text-orange-500">1 : {brewRatio.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Brühzeit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Brühzeit (s)</label>
          <input
            type="number" value={brewTimeS}
            onChange={e => setBrewTimeS(e.target.value)}
            className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Ratings */}
        <div className="grid gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Geschmack *</label>
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Körper</label>
            <RatingInput value={bodyScore} onChange={setBodyScore} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Säure</label>
            <RatingInput value={acidityScore} onChange={setAcidityScore} />
          </div>
        </div>

        {/* Tasting Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Geschmacksnotizen</label>
          <textarea
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={updateShot.isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {updateShot.isPending ? 'Speichern...' : 'Änderungen speichern'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Schritt 3: Fehlende Imports am Dateianfang von `ShotDetail.tsx` sicherstellen**

Die komplette Import-Sektion von `src/pages/ShotDetail.tsx` muss enthalten:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShot, useUpdateShot, useDeleteShot } from '../hooks/useShots'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { RatingInput } from '../components/RatingInput'
import type { ShotWithCoffee } from '../hooks/useShots'
```

- [ ] **Schritt 4: Build prüfen**

```bash
npm run build
```

Erwartet: kein TypeScript-Fehler.

- [ ] **Schritt 5: Edit-Modus manuell testen**

```bash
npm run dev
```

- Shot öffnen → "Bearbeiten" klicken → Formular erscheint vorausgefüllt
- Mahlgrad ändern → Speichern → View-Modus zeigt neuen Wert
- Datum ändern → Speichern → Timestamp unten aktualisiert
- Kaffee wechseln → Röstdatum-Buttons aktualisieren sich

- [ ] **Schritt 6: Test für Edit-Modus ergänzen**

In `src/__tests__/ShotDetail.test.tsx` am Ende hinzufügen:

```tsx
import userEvent from '@testing-library/user-event'

test('zeigt Edit-Formular nach Klick auf Bearbeiten', async () => {
  renderDetail()
  await userEvent.click(screen.getByText('Bearbeiten'))
  expect(screen.getByText('Shot bearbeiten')).toBeInTheDocument()
  expect(screen.getByText('Änderungen speichern')).toBeInTheDocument()
})
```

- [ ] **Schritt 7: Tests ausführen**

```bash
npm test
```

Erwartet: alle Tests grün.

- [ ] **Schritt 8: Commit**

```bash
git add src/pages/ShotDetail.tsx src/__tests__/ShotDetail.test.tsx
git commit -m "feat: add ShotDetail edit mode with all fields editable"
```

---

## Task 5: Abschluss & Smoke-Test

**Files:**
- Modify: `src/App.tsx` (Route wurde bereits in Task 3 hinzugefügt — hier nur verifizieren)

- [ ] **Schritt 1: App.tsx prüfen** — Route muss vorhanden sein:

```tsx
<Route path="shots/:id" element={<ShotDetail />} />
```

Falls nicht vorhanden, jetzt einfügen (nach `shots/new`).

- [ ] **Schritt 2: Alle Tests ausführen**

```bash
npm test
```

Erwartet: alle Tests grün, keine Warnings über fehlende Mocks.

- [ ] **Schritt 3: Vollständiger Build**

```bash
npm run build
```

Erwartet: Build erfolgreich, keine TypeScript-Fehler.

- [ ] **Schritt 4: Funktions-Checklist im Browser**

```bash
npm run dev
```

- [ ] ShotHistory → Shot anklicken → Detail öffnet sich
- [ ] Alle Parameter sichtbar (Mahlgrad, Bewertung, Ratio, Tasting Notes)
- [ ] "Bearbeiten" → Formular vorausgefüllt
- [ ] Datum/Uhrzeit editierbar
- [ ] Kaffee wechselbar, Röstdatum passt sich an
- [ ] Speichern → View-Modus, Werte aktualisiert
- [ ] "Löschen" → confirm-Dialog → zurück zu /shots
- [ ] Browser Back-Button navigiert korrekt

- [ ] **Schritt 5: Final Commit**

```bash
git add -A
git commit -m "feat: shot detail and edit complete"
```
