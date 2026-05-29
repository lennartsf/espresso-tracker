# Espresso Tracker — Projektdokumentation

## Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Storage)
- **Deployment:** Vercel (live: https://espresso-tracker-wine.vercel.app/)
- **Repo:** https://github.com/lennartsf/espresso-tracker
- **Supabase:** https://hkvfsiiidmqazrghvlgj.supabase.co

## Lokaler Dev-Server
```bash
cd /Users/lennartfriedel/Documents/espresso-tracker
npm run dev
```

## Projektstruktur
```
src/
  pages/         Dashboard, NewShot, ShotHistory, CoffeeManager, Analysis, Roasters
  components/    BrewTimer, RatingInput, RecipeCard, RoasterMap, ShotCard, Layout
  hooks/         useCoffees, useRoasters, useShots
  types/         index.ts (alle Interfaces)
  lib/           supabase.ts
  utils/         recipeCalc.ts
```

## Datenbank-Schema (aktuell)

### `roasters`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| name | text |
| address | text |
| lat, lng | float8 |
| website | text |
| photo_url | text |
| created_at | timestamptz |

### `coffees`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| name | text |
| roaster | text (denorm.) |
| roaster_id | uuid FK → roasters |
| origin | text |
| roast_date | text (legacy) |
| notes | text |
| arabica_pct | int2 |
| robusta_pct | int2 |
| roast_level | int2 (1–10) |
| origin_country | text |
| origin_region | text |
| altitude_m | int4 |
| photo_url | text |
| created_at | timestamptz |

### `roast_dates`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| coffee_id | uuid FK → coffees |
| roast_date | date |
| created_at | timestamptz |

### `shots`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| coffee_id | uuid FK → coffees |
| roast_date_id | uuid FK → roast_dates |
| grind_setting | float4 |
| dose_g | float4 |
| yield_g | float4 |
| brew_ratio | float4 (auto-calc: yield/dose) |
| brew_time_s | int4 |
| temp_c | float4 |
| pressure_bar | float4 (DEFAULT 9) |
| rating | int2 (1–10, Pflicht) |
| body_score | int2 (1–10) |
| acidity_score | int2 (1–10) |
| tasting_notes | text |
| pulled_at | timestamptz |
| created_at | timestamptz |

## Implementierter Stand (Mai 2026)
- [x] 5 Screens: Dashboard, NewShot, ShotHistory, CoffeeManager, Analysis
- [x] Röstereien-Seite mit Karte (Leaflet/react-leaflet, CartoDB Tiles)
- [x] Inline-Rösterei-Erstellung aus NewShot und CoffeeManager heraus
- [x] Kaffee-Detailseite: Bohnenart, Röstgrad (1–10 Skala), Herkunft, Röstdaten-Liste
- [x] NewShot: Kaffee-Dropdown, Röstdatum-Auswahl, Brew-Ratio Bar, BrewTimer, 3er-Grid (Mahlgrad/Temp/Druck), Bewertungen
- [x] ShotHistory → Shot-Detail (/shots/:id) mit View- und Edit-Modus (alle Felder editierbar)
- [x] BrewRatioBar-Komponente (permanent, Dose/Yield proportional)
- [x] Druckfeld (pressure_bar, DEFAULT 9 bar) in NewShot + ShotDetail
- [x] Kaffee-Fotos: Upload via Supabase Storage (coffee-photos), Thumbnail in Liste + Form
- [x] Rösterei-Fotos: Upload via Supabase Storage (roaster-photos), Thumbnail in Liste + Form
- [x] Analysis: Filter nach Kaffee, Körper-/Säure-Scores
- [x] Responsives Layout: Mobile Bottom-Nav, Desktop Sidebar

## Offene Aufgaben (nächste Session)

Alle geplanten Features vom 29.05.2026 sind implementiert. Mögliche nächste Schritte:
- Analysis-Seite: Druck-Auswertung (pressure_bar einbeziehen)
- Multi-User via Supabase Auth
- PWA-Verbesserungen (Offline-Support)

### 3. Druckangabe beim Shot
- Neues Feld `pressure_bar` (float) in der `shots`-Tabelle
- Standard: 9 bar (vorausgefüllt)
- UI: Nummernfeld mit Einheit "bar" neben Temp-Feld (2er-Grid)
- Supabase-Migration erforderlich: `ALTER TABLE shots ADD COLUMN pressure_bar float4 DEFAULT 9;`

### 4. Kaffee-Foto
- Neues Feld `photo_url` in `coffees`-Tabelle
- Upload über Supabase Storage (Bucket: `coffee-photos`)
- Anzeige in CoffeeDetail oben als Thumbnail/Header-Bild
- Upload-UI in NewCoffeeForm und EditCoffeeForm
- Supabase-Migration: `ALTER TABLE coffees ADD COLUMN photo_url text;`

### 5. Rösterei-Foto
- Analog zu Kaffee-Foto
- Feld `photo_url` in `roasters`-Tabelle
- Bucket: `roaster-photos`
- Anzeige in RoasterDetail / Röstereien-Karte
- Supabase-Migration: `ALTER TABLE roasters ADD COLUMN photo_url text;`

## Wichtige Hinweise
- Nach jeder Supabase-Migration immer fragen ob User die SQL bereits ausgeführt hat
- Supabase Storage-Uploads brauchen einen öffentlichen Bucket oder signierte URLs
- Brew-Ratio wird client-seitig berechnet (yield / dose), nicht als Trigger in DB
- `roaster`-Spalte in `coffees` ist denormalisiert (Name-Cache), wird bei Update mitgeschrieben
