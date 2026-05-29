# Brew-Ratio Bar & Druckangabe — Design Spec

**Datum:** 2026-05-29  
**Features:** Permanente Ratio-Visualisierung als Bar + Druckfeld (pressure_bar) in NewShot und ShotDetail

---

## Überblick

Zwei zusammenhängende Verbesserungen am Shot-Formular:

1. **Brew-Ratio Bar** — ersetzt den bisherigen bedingten Verhältnis-Text durch eine permanente visuelle Bar unterhalb der Einwaage/Ausbeute-Felder
2. **Druckangabe** — neues Pflichtfeld `pressure_bar` (float, Standard 9 bar) im Shot-Formular, gespeichert in Supabase

---

## Feature 1: Brew-Ratio Bar

### Verhalten

- **Immer sichtbar** — die Bar erscheint immer, nicht nur wenn beide Werte ausgefüllt sind
- **Leer-Zustand:** Wenn Dose oder Yield fehlt → rechtes Segment grau (`bg-slate-200`), Text zeigt `— : —`
- **Gefüllt:** Beide Segmente orange, Ratio-Text darunter

### Visuelle Struktur

```
[ Einwaage (g) ] [ Ausbeute (g) ]   ← bestehende 2-col Inputs
[░░░░░░][████████████████████████]   ← Bar (flex: dose/yield-Verhältnis)
18g Dose         1 : 2.00  36g Yield ← Label-Zeile darunter
```

**Bar-Segmente:**
- Links (Dose): `bg-orange-200` (`#fdba74`), `flex: 1` (immer gleich breit = 1 Teil)
- Rechts (Yield): `bg-orange-500` (`#f97316`), `flex: ratio` (z.B. bei 1:2 → `flex: 2`)
- Wenn kein Yield: rechts `bg-slate-200`, `flex: 2` (Fallback)
- Gesamte Bar: `h-3 rounded-full overflow-hidden`

**Label-Zeile (unter Bar):**
- Links: `text-xs text-slate-400` — `{doseG}g Dose` (oder `—` wenn leer)
- Mitte: `text-xs font-semibold text-orange-500` — `1 : {ratio}` (oder `text-slate-300` + `— : —`)
- Rechts: `text-xs text-slate-400` — `{yieldG}g Yield` (oder `—` wenn leer)

### Betroffene Dateien

- `src/pages/NewShot.tsx` — ersetzt den bedingten `<p>Verhältnis...` Block
- `src/pages/ShotDetail.tsx` — gleiche Änderung in `ShotEditForm` (ersetzt dort ebenfalls den bedingten Text)

---

## Feature 2: Druckangabe

### Datenbankänderung

```sql
ALTER TABLE shots ADD COLUMN pressure_bar float4 DEFAULT 9;
```

**Wichtig:** Diese Migration muss in der Supabase-Console ausgeführt werden, bevor die App deployed wird.

### Typ-Änderung

In `src/types/index.ts`, Interface `Shot`:
```ts
pressure_bar: number | null
```

`NewShot`-Type (Omit) erbt die Änderung automatisch.

### NewShot.tsx

- State: `const [pressureBar, setPressureBar] = useState('9')` (vorausgefüllt)
- Das bisherige 2er-Grid (Mahlgrad + Temp) wird zum **3er-Grid**: Mahlgrad · Temp · Druck
- Input: `type="number"`, `step="0.1"`, Einheit nicht separat (Feld-Label "Druck (bar)")
- Beim Submit: `pressure_bar: pressureBar ? parseFloat(pressureBar) : null`

### ShotDetail.tsx — View-Modus

`pressure_bar` wird im bestehenden 2×2-Grid als zusätzliche Kachel angezeigt — neben Temp (falls vorhanden):
```
[ Temperatur: 93°C ] [ Druck: 9 bar ]
```
Nur angezeigt wenn `pressure_bar !== null`.

### ShotDetail.tsx — Edit-Modus (ShotEditForm)

- State: `const [pressureBar, setPressureBar] = useState(shot.pressure_bar ? String(shot.pressure_bar) : '9')`
- Gleiches 3er-Grid wie NewShot: Mahlgrad · Temp · Druck
- Beim Submit: `pressure_bar: pressureBar ? parseFloat(pressureBar) : null`

---

## Scope

**In scope:**
- NewShot: Ratio Bar + Druck-Feld
- ShotDetail View: pressure_bar anzeigen
- ShotDetail Edit: Ratio Bar + Druck-Feld
- Types + Migration

**Nicht in scope:**
- Analysis-Seite (Druck-Auswertung kommt später)
- Dashboard (keine Änderung)
- ShotHistory (ShotCard zeigt kein Druck)
