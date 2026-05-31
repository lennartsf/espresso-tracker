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
  pages/         Dashboard, NewShot, ShotHistory, CoffeeManager, Analysis, Roasters, Equipment, Brews, NewBrew, BrewDetail, Guide, GuideDetail, Glossary, Animate, AnimateDetail
  components/    BrewTimer, RatingInput, RecipeCard, RoasterMap, ShotCard, BrewCard, BrewRatioBar, PhotoUpload, Layout
  components/animations/  BoilerAnimation, V60Animation, MilkAnimation, LatteHeartAnimation; hooks: usePhaseTimeline, animationEngine (useRamp/useSpin); pitcherShape.ts (Jug-Pfade)
  hooks/         useCoffees, useRoasters, useShots, useEquipment, useBrews
  types/         index.ts (alle Interfaces)
  lib/           supabase.ts
  utils/         recipeCalc.ts, ratingColor.ts, drinkTypes.ts, equipmentTypes.ts, brewMethods.ts, timeFormat.ts, guideContent.ts, glossaryContent.ts, animationContent.ts
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
| preinfusion_s | float4 |
| rating | int2 (1–10, Pflicht) |
| body_score | int2 (1–10) |
| acidity_score | int2 (1–10) |
| bitterness_score | int2 (1–10) |
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

### `brew_devices`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| name | text |
| brand | text |
| device_type | text ('french_press' / 'v60' / 'aeropress' / 'moka_pot' / 'chemex' / 'other') |
| notes | text |
| is_favorite | boolean DEFAULT false |
| created_at | timestamptz |

### `equipment_defaults`
| Spalte | Typ |
|--------|-----|
| method | text PK ('espresso' / 'french_press' / 'v60' / 'aeropress' / 'moka_pot') |
| grinder_id | uuid FK → grinders ON DELETE SET NULL |
| machine_id | uuid FK → machines ON DELETE SET NULL |
| basket_id | uuid FK → baskets ON DELETE SET NULL |
| brew_device_id | uuid FK → brew_devices ON DELETE SET NULL |

### `brews`
| Spalte | Typ |
|--------|-----|
| id | uuid PK |
| coffee_id | uuid FK → coffees |
| grinder_id | uuid FK → grinders ON DELETE SET NULL |
| brew_device_id | uuid FK → brew_devices ON DELETE SET NULL |
| brew_method | text ('french_press' / 'v60' / 'aeropress' / 'moka_pot') |
| grind_setting | float4 |
| dose_g | float4 |
| water_ml | float4 |
| temp_c | float4 |
| brew_time_s | int4 |
| rating | int2 (1–10, Pflicht) |
| acidity_score | int2 (1–10) |
| bitterness_score | int2 (1–10) |
| tasting_notes | text |
| bloom_ml | float4 |
| bloom_time_s | int4 |
| inverted | boolean DEFAULT false |
| first_stir_s | int4 |
| brewed_at | timestamptz |
| created_at | timestamptz |

## Implementierter Stand (Mai 2026)
- [x] Dashboard: Shot-Statistiken (total, Ø Bewertung, Top Shots, Ø Verhältnis) + Brews-Statistiken + letzte Shots & Brews
- [x] Röstereien-Seite mit Karte (Leaflet/react-leaflet, CartoDB Tiles)
- [x] Kaffee-Detailseite: Bohnenart, Röstgrad (1–10 Skala), Herkunft, Röstdaten-Liste
- [x] NewShot: Kaffee-Dropdown (+ Mühle direkt darunter), Röstdatum-Auswahl, Brew-Ratio Bar, BrewTimer, Mahlgrad/Temp/Druck, Preinfusion (Checkbox + inline Sekunden), Bewertungen mit i-Button
- [x] ShotHistory → Shot-Detail (/shots/:id) mit View- und Edit-Modus
- [x] Kaffee- und Rösterei-Fotos (Supabase Storage)
- [x] Responsive layout: Mobile Bottom-Nav (4 primary + "⋯ More" panel), Desktop Sidebar (all 8)
- [x] **App in English** — UI fully translated (routes, labels, content, guides, glossary)
- [x] Bewertungs-Farbskala 10-stufig (ratingColor utility)
- [x] RDT / WDT / Leveler Checkboxen beim Shot
- [x] Shot-Bewertungsparameter: rating (Pflicht), body_score, acidity_score, bitterness_score — alle mit i-Button Erklärung
- [x] ShotCard: zeigt Mühlenname in Unterzeile wenn verknüpft
- [x] Equipment-Seite (/ausruestung): Mühlen, Maschinen, Siebe, **Geräte** mit CRUD + ⭐ Favorit; Detail-View zeigt Leerstate wenn keine optionalen Felder gesetzt
- [x] Equipment-Felder: Grinder (Typ, Mahlwerk-mm, Watt, stufenlos, Behälter), Machine (Funktionsweise, Brühgruppe), Basket (Ø mm, Nenndosis g), BrewDevice (Typ, Marke)
- [x] Shot ↔ Equipment FK-Verknüpfung (grinder_id, machine_id, basket_id)
- [x] **Equipment-Defaults**: „Standard für ▾"-Button auf jeder Equipment-Karte → setzt Methoden-spezifische Vorauswahl in `equipment_defaults`
- [x] **Automatische Vorauswahl** in NewShot (espresso-Defaults) und NewBrew (methodenspezifisch, wechselt bei Methodenwahl); Fallback auf `is_favorite`
- [x] Milchgetränke: drink_type (Espresso/Cappuccino/Latte/Flat White/Cortado/Macchiato), Milchsorte + ml
- [x] ShotHistory: Filter-Tabs (Alle / Espresso / Milchgetränke)
- [x] ShotCard: Getränketyp-Badge + angepasste Unterzeile + Mühlenname
- [x] Brühmethoden: `/brews` Seite (French Press, V60, AeroPress, Moka Pot), BrewCard, NewBrew, BrewDetail, MM:SS-Zeitformat
- [x] Brew-Bewertungsparameter: rating (Pflicht), acidity_score, bitterness_score — alle mit i-Button Erklärung
- [x] Brew ↔ Brew-Device FK-Verknüpfung (brew_device_id); Gerät-Dropdown in NewBrew + BrewDetail
- [x] BrewCard: zeigt Mühle + Gerät in Unterzeile wenn verknüpft
- [x] i-Button Methoden-Erklärung in NewBrew + BrewDetail (BREW_METHOD_INFO in brewMethods.ts)
- [x] **Guide-Tab** (`/guide`): 6 statische Guides (Espresso, French Press, V60, AeroPress, Moka Pot, Milch), Übersicht als Karten-Grid, Detail mit Quick-Chips + Schritt-für-Schritt + Troubleshooting-Akkordeon
- [x] **Analysis** (`/analyse`): 3 Tabs — Espresso (Scatter Mahlgrad→Bewertung, Mühlen-Filter, Best-Recipe), Brews (Methoden/Kaffee/Mühlen-Filter, Top-Rezept mit Ø-Parametern), Milch (Typ-Aufschlüsselung + Ø-Bewertung); Hinweis wenn keine Mühle gefiltert
- [x] **Glossar** (`/glossar`): 46 Fachbegriffe alphabetisch sortiert mit Volltextsuche; Kategorien: Espresso, Brühen, Equipment, Milch; eigener Nav-Eintrag im „⋯ Mehr"-Panel
- [x] **Animate** (`/animate`): 4 SVG explainers — Boiler Types (AnimeJS), V60 Pour Pattern, Milk Steaming, Latte Art Heart (rebuilt 2026-05-31)

## Weitere geplante Features
- [x] **App in English** — complete UI translation
- [ ] Multi-User via Supabase Auth
- [x] **Animations** — dedicated `/animate` page, AnimeJS + SVG illustrated style:
  - Boiler types (Single Boiler, Heat Exchanger, Dual Boiler, Thermoblock) — animated water flow diagrams
  - V60 — pouring pattern with time markers (Bloom 0:00, Pour 1–3, Drain)
  - Milk steaming — pitcher cross-section, foam volume per drink (Cappuccino 1/3, Flat White microfoam, Cortado minimal, Latte Macchiato medium)
  - Latte art Heart — animated pitcher path; Tulip + Rosetta deferred
  - Spec: docs/superpowers/specs/2026-05-30-animations-design.md
  - Plan: docs/superpowers/plans/2026-05-30-animations.md

## Wichtige Hinweise
- Nach jeder Supabase-Migration immer fragen ob User die SQL bereits ausgeführt hat
- Supabase Storage-Uploads brauchen einen öffentlichen Bucket oder signierte URLs
- Brew-Ratio wird client-seitig berechnet (yield / dose), nicht als Trigger in DB
- `roaster`-Spalte in `coffees` ist denormalisiert (Name-Cache), wird bei Update mitgeschrieben
- `drink_type` DEFAULT 'espresso' — alle bestehenden Shots sind automatisch Espresso
- `equipment_defaults` hat kein RLS — Single-User-App ohne Auth (wie `brews`)
- Vorauswahl in NewShot/NewBrew: `useRef`-Guard verhindert Überschreiben nach User-Auswahl bei react-query-Refetches
- `drinkTypes.ts`: DRINK_TYPES, MILK_TYPES, drinkTypeLabel(), milkTypeLabel()
- `equipmentTypes.ts`: GRINDER_TYPES, FUNKTIONSWEISE_TYPES, DEVICE_TYPES, grinderTypeLabel(), funktionsweiseLabel(), deviceTypeLabel()
- `brewMethods.ts`: BREW_METHODS, BREW_METHOD_INFO, brewMethodLabel()
- `timeFormat.ts`: secondsToMMSS(), MMSSToSeconds(), normalizeTimeInput()
- `guideContent.ts`: GUIDES (Guide[]), Typen QuickProblem, TroubleshootingItem, Step, Guide
- `glossaryContent.ts`: GLOSSARY (GlossaryTerm[]), Interface GlossaryTerm { term, definition, category }; 46 Begriffe alphabetisch sortiert
- `animationContent.ts`: ANIMATIONS (AnimationMeta[]), Interface AnimationMeta { id, title, icon, description, tags }; 4 Einträge (boiler, v60, milk, latte-heart). **id + title NICHT ändern** — AnimateDetail/animationContent Tests hängen dran (tags/description sind frei).
- **Animationen-Tech (Stand 2026-05-31):** V60/Milk/Latte rendern Geometrie **selbst berechnet pro Frame** — kein Animations-Lib für diese SVGs (Framer Motion verworfen: imperatives `animate()` animiert SVG-Attribute wie height/cy/y2 *nicht*, nur Transform). Stattdessen: `usePhaseTimeline` = Phasen-Takt (Captions/Chips/Replay, deterministisch testbar), `animationEngine.ts` = `useRamp(key, ms)` (Fortschritt 0→1 je Phase via rAF) + `useSpin(active, degPerSec)` (rotierender Winkel, z.B. Vortex). Komponenten rechnen Wasser-Polygon / Schaum / Tip-Tiefe / Pitcher-Position / Blob→Herz-Morph direkt aus (phase, p).
- `usePhaseTimeline(count, step)`: `step` = `number` (gleichmäßig) **oder** `number[]` (gewichtete Phasendauern in ms — z.B. V60 Bloom lang, Pulse kurz). Array muss stabil sein (Modul-Konstante `DUR`, nicht inline). phase -1 (idle) → 0..count-1 → playing=false; `replay()` neu. Tests via fake timers; rAF-Hooks guarded (kein rAF in jsdom → Visuals bewusst ungetestet, Tests prüfen nur Captions/Chips/Buttons).
- `pitcherShape.ts`: `JUG_BODY/JUG_HANDLE` (aufrecht, Milch-Querschnitt) + `POUR_JUG_BODY/POUR_JUG_HANDLE` (gekippte Gieß-Form, Ausguss = tiefster Punkt, Henkel oben). Latte Herz-Morph: `DISC`/`HEART` Punkt-Arrays gleicher Pfad-Struktur (M + 4 Cubics) → `lerpArr` morpht ohne Größensprung.
- **Animationen sind technik-akkurat aus Briefs gebaut** (Latte/V60/Milch nach James-Hoffmann-Technik). Vorlage: `docs/animation-brief-template.md`; ausgefüllt: `docs/animation-brief-milk.md`. Für neue/geänderte Animationen: Brief + Referenz-Stills → bauen.
- **Self-Review-Workflow (wichtig):** NICHT blind Koordinaten raten. `npm run shoot [ids]` (`scripts/shoot.mjs`, Playwright + sharp, dev-deps) screenshottet `/animate/:id` über Phasen und stitcht zu *einer* Montage `screenshots/{id}-montage.png`. Ablauf: bauen → shoot → **Montage lesen (ein Bild)** → gegen Brief/Stills selbst kritisieren → fixen → erst dann dem User die Montage zeigen. `SHOTS`-Frame-Zeiten in shoot.mjs decken bis ~11,5 s ab (längste Animation V60). `screenshots/` ist gitignored.
- BoilerAnimation nutzt weiterhin **AnimeJS v3 (^3.2.2)** — nicht v4, API unterscheidet sich stark; `anime.setDashoffset`, `anime.stagger`, `anime.path()` v3-spezifisch. `animejs` bleibt nur deswegen Dependency.
- `brews`-Tabelle hat **kein RLS** (Absicht — Single-User-App ohne Auth)
