# Shot Detail & Edit — Design Spec

**Datum:** 2026-05-29  
**Feature:** Shots in ShotHistory öffnen und alle Parameter bearbeiten

---

## Überblick

Shots in der ShotHistory sind aktuell reine Anzeigeelemente. Das Feature fügt hinzu:
- Jeder Shot ist anklickbar und öffnet eine Detailansicht (`/shots/:id`)
- Die Detailansicht zeigt alle gespeicherten Parameter (Layout A: kompakter 2×2-Grid)
- Ein "Bearbeiten"-Button schaltet inline in den Edit-Modus (analog zu CoffeeManager)
- Alle Felder sind editierbar: inkl. Kaffee, Röstdatum, Datum/Uhrzeit des Shots
- Löschen mit `confirm()`-Dialog

---

## Navigation

```
/shots               → ShotHistory (Liste)
/shots/:id           → ShotDetail (View-Modus)
/shots/:id           → ShotDetail (Edit-Modus, inline toggle)
```

ShotCard wird zu einem `<Link to={/shots/${shot.id}}>` umgebaut. Der Browser-Back-Button navigiert zurück zur Liste.

---

## Komponenten & Hooks

### Neue Hooks in `useShots.ts`

```ts
useShot(id: string)       // einzelnen Shot laden (Query: ['shot', id])
useUpdateShot()           // PATCH shots SET ... WHERE id = ?
useDeleteShot()           // DELETE shots WHERE id = ?
```

`useUpdateShot` invalidiert `['shots']` und `['shot', id]`.  
`useDeleteShot` invalidiert `['shots']` und navigiert zurück.

### Neue Seite: `src/pages/ShotDetail.tsx`

Zwei interne Views, gesteuert per `editing: boolean`:

**View-Modus** (Layout A):
- Header: `←` Zurück + Kaffee-Name + "Bearbeiten"-Button (orange) + "Löschen"-Button (grau)
- Bewertungs-Block: Gesamtbewertung prominent (orange Badge), Körper + Säure als kleinere Badges
- 2×2-Grid: Mahlgrad, Brühzeit, Einwaage→Ausbeute, Verhältnis (1:X orange)
- Weitere Zeile: Temp, Röstdatum (falls vorhanden)
- Tasting Notes als Freitext-Block (nur wenn vorhanden)
- Datum/Uhrzeit des Shots unten klein (grau)

**Edit-Modus** (vorausgefülltes Formular):
- Header: `←` Abbrechen + "Shot bearbeiten" + "Löschen"-Button
- Felder in dieser Reihenfolge:
  1. Datum & Uhrzeit (`<input type="datetime-local">`, aus `pulled_at`)
  2. Kaffee (Dropdown, alle Coffees)
  3. Röstdatum (Button-Gruppe: die 2 neuesten des gewählten Kaffees + "Keine")
  4. Mahlgrad + Temp (2er-Grid)
  5. Einwaage + Ausbeute (2er-Grid) + Ratio-Bar darunter
  6. Brühzeit (Zahl + "s")
  7. Geschmack / Körper / Säure (RatingInput, je mit Info-Button)
  8. Tasting Notes (Textarea)
- "Änderungen speichern"-Button (orange, full-width)
- Nach Speichern: zurück in View-Modus (kein navigate)

### Änderung: `ShotCard.tsx`

Wrap in `<Link to={/shots/${shot.id}}>` mit `hover:border-orange-300 transition-colors` — analog zu Coffee-Karten.

### Route in `App.tsx`

```tsx
<Route path="/shots/:id" element={<ShotDetail />} />
```

---

## Daten

Kein Datenbankschema-Change nötig — alle Felder existieren bereits.

`pulled_at` wird als `datetime-local`-String gespeichert und bei Submit zu ISO-String konvertiert:
```ts
new Date(localDatetimeString).toISOString()
```

Beim Laden: ISO → `datetime-local`-Format via:
```ts
new Date(shot.pulled_at).toISOString().slice(0, 16)
```

---

## Error Handling

- Ungültige `id` in der URL (Shot nicht gefunden): Fehlermeldung + Zurück-Link
- Pflichtfeld Mahlgrad + Bewertung: client-seitige Validierung wie in NewShot
- Löschen: `confirm("Shot wirklich löschen?")` vor dem DELETE

---

## Was nicht in Scope ist

- Foto-Upload (eigenes Feature)
- Brew-Ratio Bar (eigenes Feature)
- Druckangabe / pressure_bar (eigenes Feature, braucht Migration)
- Bulk-Löschen
