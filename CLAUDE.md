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
  pages/         Dashboard, NewShot, ShotHistory, CoffeeManager, Analysis, Roasters, Equipment
  components/    BrewTimer, RatingInput, RecipeCard, RoasterMap, ShotCard, BrewRatioBar, PhotoUpload, Layout
  hooks/         useCoffees, useRoasters, useShots, useEquipment
  types/         index.ts (alle Interfaces)
  lib/           supabase.ts
  utils/         recipeCalc.ts, ratingColor.ts, drinkTypes.ts, equipmentTypes.ts
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
| used_rdt | boolean DEFAULT false |
| used_wdt | boolean DEFAULT false |
| used_leveler | boolean DEFAULT false |
| grinder_id | uuid FK → grinders ON DELETE SET NULL |
| machine_id | uuid FK → machines ON DELETE SET NULL |
| basket_id | uuid FK → baskets ON DELETE SET NULL |
| drink_type | text DEFAULT 'espresso' |
| milk_type | text |
| milk_ml | float4 |
| pulled_at | timestamptz |
| created_at | timestamptz |

### `grinders`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| name | text |
| brand | text |
| notes | text |
| grinder_type | text ('flat' / 'conical') |
| burr_size_mm | float4 |
| motor_watt | int4 |
| stepless | boolean DEFAULT false |
| has_hopper | boolean DEFAULT false |
| is_favorite | boolean DEFAULT false |
| created_at | timestamptz |

### `machines`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| name | text |
| brand | text |
| notes | text |
| funktionsweise | text ('einkreiser' / 'zweikreiser' / 'dualboiler' / 'thermoblock') |
| brew_group_type | text |
| brew_group_size_mm | float4 |
| is_favorite | boolean DEFAULT false |
| created_at | timestamptz |

### `baskets`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| name | text |
| brand | text |
| diameter_mm | float4 |
| size_g | float4 |
| notes | text |
| is_favorite | boolean DEFAULT false |
| created_at | timestamptz |

## Implementierter Stand (Mai 2026)
- [x] 5 Screens: Dashboard, NewShot, ShotHistory, CoffeeManager, Analysis
- [x] Röstereien-Seite mit Karte (Leaflet/react-leaflet, CartoDB Tiles)
- [x] Kaffee-Detailseite: Bohnenart, Röstgrad (1–10 Skala), Herkunft, Röstdaten-Liste
- [x] NewShot: Kaffee-Dropdown, Röstdatum-Auswahl, Brew-Ratio Bar, BrewTimer, Mahlgrad/Temp/Druck, Bewertungen
- [x] ShotHistory → Shot-Detail (/shots/:id) mit View- und Edit-Modus
- [x] Kaffee- und Rösterei-Fotos (Supabase Storage)
- [x] Responsives Layout: Mobile Bottom-Nav, Desktop Sidebar
- [x] Bewertungs-Farbskala 10-stufig (ratingColor utility)
- [x] RDT / WDT / Leveler Checkboxen beim Shot
- [x] Equipment-Seite (/ausruestung): Mühlen, Maschinen, Siebe mit CRUD + ⭐ Favorit
- [x] Equipment-Felder: Grinder (Typ, Mahlwerk-mm, Watt, stufenlos, Behälter), Machine (Funktionsweise, Brühgruppe), Basket (Ø mm, Nenndosis g)
- [x] Shot ↔ Equipment FK-Verknüpfung (grinder_id, machine_id, basket_id)
- [x] Milchgetränke: drink_type (Espresso/Cappuccino/Latte/Flat White/Cortado/Macchiato), Milchsorte + ml
- [x] ShotHistory: Filter-Tabs (Alle / Espresso / Milchgetränke)
- [x] ShotCard: Getränketyp-Badge + angepasste Unterzeile
- [x] Brühmethoden: `/brews` Seite (French Press, V60, AeroPress, Moka Pot), BrewCard, NewBrew, BrewDetail, MM:SS-Zeitformat
- [x] i-Button Methoden-Erklärung in NewBrew + BrewDetail (BREW_METHOD_INFO in brewMethods.ts)

## Offene Aufgaben (nächste Session)

### Als nächstes umsetzen: Guide-Tab
**Was:** Neuer `/guide` Tab mit umfassenden Brüh-Guides und Troubleshooting.
**Inhalt:**
- Espresso: Schritt-für-Schritt + Troubleshooting (zu sauer / zu bitter / zu wässrig / channeling etc.)
- Brühmethoden: French Press, V60, AeroPress, Moka Pot je mit Anleitung + Troubleshooting
- Milch aufschäumen + Latte Art: Technik, häufige Fehler
**Phase 1:** Rein textbasiert (kein DB-Schema nötig — statischer Content in `src/utils/guideContent.ts`)
**Phase 2 (später):** UI/UX mit Animationen — noch nicht spezifiziert
**Status:** Brainstorming gestartet, noch keine Spec geschrieben. Nächster Schritt: Clarifying questions → Spec schreiben → Plan → Implementierung.
**Vorgehen beim Start:** `superpowers:brainstorming` Skill aufrufen mit dem Guide-Tab als Topic.

### Weitere geplante Features
- [ ] **App auf Englisch** — komplette UI-Übersetzung
- [ ] Analysis-Seite: pressure_bar + Getränketyp-Auswertung
- [ ] Favoriten als Vorauswahl in NewShot/NewBrew
- [ ] Multi-User via Supabase Auth
- [ ] PWA-Verbesserungen (Offline-Support)

## Wichtige Hinweise
- Nach jeder Supabase-Migration immer fragen ob User die SQL bereits ausgeführt hat
- Supabase Storage-Uploads brauchen einen öffentlichen Bucket oder signierte URLs
- Brew-Ratio wird client-seitig berechnet (yield / dose), nicht als Trigger in DB
- `roaster`-Spalte in `coffees` ist denormalisiert (Name-Cache), wird bei Update mitgeschrieben
- `drink_type` DEFAULT 'espresso' — alle bestehenden Shots sind automatisch Espresso
- `drinkTypes.ts`: DRINK_TYPES, MILK_TYPES, drinkTypeLabel(), milkTypeLabel()
- `equipmentTypes.ts`: GRINDER_TYPES, FUNKTIONSWEISE_TYPES, grinderTypeLabel(), funktionsweiseLabel()
- `brewMethods.ts`: BREW_METHODS, BREW_METHOD_INFO, brewMethodLabel()
- `timeFormat.ts`: secondsToMMSS(), MMSSToSeconds(), normalizeTimeInput()
- `brews`-Tabelle hat **kein RLS** (Absicht — Single-User-App ohne Auth)
