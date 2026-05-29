# Kaffee- & Rösterei-Fotos — Design Spec

**Datum:** 2026-05-29  
**Feature:** Foto-Upload für Kaffees und Röstereien via Supabase Storage

---

## Überblick

Kaffees und Röstereien können ein Foto bekommen, das in der Listenansicht als Thumbnail (40×40) und in Formularen als klickbares Upload-Element (52×52) erscheint. Der Upload erfolgt direkt beim Auswählen der Datei (nicht erst beim Speichern des Formulars).

---

## Datenbankänderungen

Beide Migrationen müssen in der Supabase-Console ausgeführt werden:

```sql
ALTER TABLE coffees ADD COLUMN photo_url text;
ALTER TABLE roasters ADD COLUMN photo_url text;
```

Die Storage-Buckets `coffee-photos` und `roaster-photos` sind bereits angelegt (public).

---

## Typ-Änderungen

### `src/types/index.ts`

```ts
// Coffee: nach altitude_m hinzufügen
photo_url: string | null

// Roaster: nach website hinzufügen
photo_url: string | null
```

`NewCoffee` und `NewRoaster` (Omit) erben die Änderung automatisch.

---

## Neue Komponente: `PhotoUpload`

**Pfad:** `src/components/PhotoUpload.tsx`

### Props

```ts
interface Props {
  bucket: 'coffee-photos' | 'roaster-photos'
  value: string | null
  onChange: (url: string | null) => void
  name?: string  // für Initialen-Placeholder
}
```

### Verhalten

1. **Kein Foto vorhanden:** Zeigt ein 52×52-Quadrat mit `rounded-lg bg-orange-100` und dem ersten Buchstaben von `name` (oder `☕`-Icon) — anklickbar
2. **Foto vorhanden:** Zeigt `<img src={value}>` mit `object-cover` — anklickbar (→ ändern)
3. **Hover:** Overlay mit Kamera-Icon zeigt an "klicken zum Ändern/Hochladen"; × Badge oben-rechts zum Entfernen
4. **Klick auf Thumbnail:** Öffnet versteckten `<input type="file" accept="image/*">`
5. **Datei ausgewählt:**
   - Validierung: max 5 MB (zeigt Fehlermeldung wenn größer)
   - Upload zu Supabase Storage: Dateiname `{Date.now()}-{file.name}` (verhindert Konflikte)
   - Ladeindikator während Upload (Spinner oder Puls-Animation auf dem Thumbnail)
   - Erfolg: public URL via `supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl` → ruft `onChange(url)` auf
6. **× Button (Entfernen):**
   - Löscht die Datei aus Storage: `supabase.storage.from(bucket).remove([filename])`
   - Filename wird aus der URL extrahiert (letztes Segment nach `/`)
   - Ruft `onChange(null)` auf
7. **Fehlerbehandlung:** Upload-Fehler werden als Text unter dem Thumbnail angezeigt

### Upload-Reihenfolge

Upload geschieht **sofort beim Datei-Auswählen** — nicht erst beim Formular-Submit. Das Formular speichert nur die URL.

Beim Ändern: erst neues Foto hochladen → neue URL via onChange setzen → altes Foto aus Storage löschen (fire-and-forget, kein Rollback nötig).

---

## Listenansicht: Thumbnail in Karte

### `CoffeeList` (in `CoffeeManager.tsx`)

Jede Kaffee-Karte bekommt links ein 40×40-Thumbnail:
- Foto vorhanden: `<img src={c.photo_url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />`
- Kein Foto: `<div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-content-center flex-shrink-0"><span className="text-orange-600 font-bold text-sm">{c.name[0]}</span></div>`

### `RoasterList` / Rösterei-Karten (in `Roasters.tsx`)

Gleiche Logik — Bucket ist `roaster-photos`.

---

## Formulare

### `NewCoffeeForm` und `EditCoffeeForm` (in `CoffeeManager.tsx`)

`PhotoUpload` erscheint **oben** im Formular, neben dem Namen-Input:

```tsx
<div className="flex gap-3 items-start">
  <PhotoUpload
    bucket="coffee-photos"
    value={photoUrl}
    onChange={setPhotoUrl}
    name={name}
  />
  <input value={name} ... className="flex-1 ..." />
</div>
```

State: `const [photoUrl, setPhotoUrl] = useState<string | null>(coffee?.photo_url ?? null)`

Im Submit-Payload: `photo_url: photoUrl`

### `RoasterForm` (in `Roasters.tsx`)

Gleiche Logik, bucket `roaster-photos`. Funktioniert sowohl im compact-Modus (inline in CoffeeManager) als auch im normalen Modus.

---

## Hooks

`useUpdateCoffee`, `useCreateCoffee`, `useUpdateRoaster`, `useCreateRoaster` müssen `photo_url` nicht explizit behandeln — sie übergeben bereits alle Felder des übergebenen Objekts. Sobald der Typ `photo_url` enthält, wird es automatisch mitgespeichert.

---

## Scope

**In scope:**
- `PhotoUpload`-Komponente
- Typ-Änderungen Coffee + Roaster
- Thumbnail in CoffeeList + RoasterList
- Upload in NewCoffee/EditCoffee + RoasterForm
- 2 Supabase-Migrationen

**Nicht in scope:**
- Bildoptimierung / Komprimierung
- Crop-Funktion
- Fotos in ShotHistory oder Analysis
- Multi-Foto pro Kaffee/Rösterei
