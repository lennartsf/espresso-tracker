# Espresso Tracker — Projektlog

> Audit-Trail aller Entscheidungen, Features und offenen Ideen.  
> Maschine: Rancilio Silvia · Geplante Aufrüstung: Gaggimate PID

---

## Projekt-Übersicht

Eine Progressive Web App zum Tracken und Analysieren von Espresso-Shots. Ziel: den optimalen Mahlgrad pro Kaffeesorte durch systematisches Aufzeichnen und Auswerten der Brühparameter finden.

**Live-URL:** https://espresso-tracker-wine.vercel.app  
**GitHub:** https://github.com/lennartsf/espresso-tracker  
**Lokal:** `/Users/lennartfriedel/Documents/espresso-tracker`

---

## Tech Stack

| Bereich | Technologie | Begründung |
|---|---|---|
| Frontend | React 18 + Vite 5 + TypeScript | PWA-fähig, schnell, moderne Toolchain |
| Styling | Tailwind CSS 3 | Utility-first, responsive mit `md:` Breakpoints |
| State/Daten | React Query 5 | Server-State-Caching, automatische Revalidierung |
| Routing | React Router 6 | SPA-Navigation, bottom nav / sidebar |
| Charts | Recharts 2 | Scatter-Plot für Mahlgrad-Analyse |
| Karte | Leaflet + react-leaflet 4 | Open-Source, kein API-Key, CartoDB Positron Tiles |
| Geocoding | Nominatim (OpenStreetMap) | Kostenlos, kein API-Key |
| Backend | Supabase (PostgreSQL) | Auth-ready, Row Level Security, kostenloses Tier |
| Deployment | Vercel | Kostenlos, automatisch bei Git-Push |
| Tests | Vitest + Testing Library | TDD für Komponenten und Utilities |

---

## Architektur-Entscheidungen

### Supabase ohne Auth (v1)
Bewusste Entscheidung: v1 läuft mit dem Anon-Key direkt im Frontend. Kein Login nötig, da die App nur für eine Person ist. Migration auf Auth später:
1. `user_id` zu `coffees`, `shots`, `roasters` hinzufügen
2. Row Level Security aktivieren
3. Bestehende Daten per SQL-Script dem ersten User zuweisen

### PWA statt native App
Kein App Store, kein Build-Prozess — URL im Safari öffnen → Teilen → Zum Homebildschirm. Funktioniert auf iPhone, Windows und Mac identisch.

### Responsive Layout
- **Mobile** (< 768px): Bottom-Navigation, schmaler Content
- **Desktop** (≥ 768px): Sidebar-Navigation links (220px), max-w-4xl Content-Bereich, 2-spaltige Grids auf Dashboard, Shots, Analyse

---

## Datenbank-Schema (Supabase)

### `roasters`
| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid PK | auto |
| name | text | z.B. "Five Elephant" |
| address | text | Vollständige Adresse |
| lat / lng | numeric | Koordinaten (via Nominatim) |
| website | text | |
| created_at | timestamptz | |

### `coffees`
| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid PK | |
| name | text | z.B. "Ethiopia Yirgacheffe" |
| roaster | text | Kopie des Rösterei-Namens (Denormalisierung für Anzeige) |
| roaster_id | uuid FK → roasters | Verknüpfung zur Rösterei-Tabelle |
| arabica_pct / robusta_pct | integer | Bohnenart; beide gesetzt = Blend |
| roast_level | integer 1–10 | Röstgrad (1 = hell, 10 = dunkel) |
| origin_country / origin_region | text | Herkunft |
| altitude_m | integer | Anbauhöhe in Meter |
| roast_date | date | Legacy-Feld (ersetzt durch roast_dates-Tabelle) |
| notes | text | |
| created_at | timestamptz | |

### `roast_dates`
| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid PK | |
| coffee_id | uuid FK → coffees | |
| roast_date | date | Datum der Röstung |
| created_at | timestamptz | |

Zweck: Eine Kaffeesorte bleibt dauerhaft eingetragen. Neue Bestellungen bekommen ein neues Röstdatum. Beim Shot-Erfassen werden die 2 neuesten Röstdaten zur Auswahl angeboten.

### `shots`
| Spalte | Typ | Beschreibung |
|---|---|---|
| id | uuid PK | |
| coffee_id | uuid FK → coffees | |
| roast_date_id | uuid FK → roast_dates | Optional |
| grind_setting | numeric | Mahlgrad (maschinenspezifisch) |
| dose_g | numeric | Einwaage in Gramm |
| yield_g | numeric | Ausbeute in Gramm |
| brew_ratio | numeric | Automatisch: yield_g / dose_g |
| brew_time_s | integer | Brühzeit in Sekunden |
| temp_c | numeric | Temperatur in °C |
| rating | integer 1–10 | Geschmack (höher = besser) |
| body_score | integer 1–10 | Körper (1 = cremig/vollmundig, 10 = dünn) |
| acidity_score | integer 1–10 | Säure (1 = mild, 10 = stark) |
| tasting_notes | text | Freitext |
| pulled_at | timestamptz | Zeitpunkt des Shots |
| created_at | timestamptz | |

---

## Feature-Geschichte

### 2026-05-28 — Initiales Setup
- Projektstruktur mit Vite + React + Tailwind + Vitest
- Supabase-Projekt angelegt, Tabellen `coffees` und `shots` erstellt
- 5 Screens implementiert: Dashboard, Neuer Shot, Shot-Liste, Kaffee-Verwaltung, Analyse
- PWA Manifest, Vercel Deployment
- 13 automatische Tests (TDD: RatingInput, BrewTimer, calcBestRecipe)

### 2026-05-29 — Erweiterungen
- **Röstdaten**: Neue Tabelle `roast_dates`. Kaffeesorte bleibt permanent; neue Röstdaten werden separat hinterlegt. Shot-Formular bietet die 2 neuesten Röstdaten zur Auswahl.
- **Erweitertes Kaffee-Modell**: Bohnenart (Arabica/Robusta + Blend-%-Angabe), Röstgrad 1–10, Rohkaffee-Sektion (Land, Region, Anbauhöhe)
- **Kaffee bearbeiten**: Detailseite mit "Bearbeiten"-Button
- **Röstereien mit Map**: Neue Tabelle `roasters`, eigener Tab mit Leaflet-Karte (CartoDB Positron Tiles), Adress-Autocomplete via Nominatim, orangener Pin
- **Kaffee–Rösterei-Verknüpfung**: Kaffees referenzieren Röstereien; Rösterei-Detailseite zeigt zugehörige Kaffees
- **Körper & Säure**: Zwei neue Shot-Parameter (Skala 1–10) mit ⓘ-Button und erklärenden Tooltips
- **Brew Ratio**: Automatische Berechnung (Ausbeute / Einwaage) beim Erfassen eines Shots
- **Analyse-Toggle**: Scatter-Plot umschaltbar zwischen Geschmack / Körper / Säure
- **Responsive Layout**: Sidebar auf Desktop, 2-spaltige Grids auf Dashboard/Shots/Analyse

---

## Bewertungs-Logik

| Parameter | Skala | Bedeutung niedrig | Bedeutung hoch |
|---|---|---|---|
| Geschmack | 1–10 | kaum trinkbar | perfekter Espresso |
| Körper | 1–10 | cremig & vollmundig | dünn & wässrig |
| Säure | 1–10 | sehr mild | stark & spritzig |

**Bestes Rezept** (RecipeCard): Shots mit Geschmack ≥ 8 werden gemittelt → zeigt optimale Mahlgrad-Spanne, Ratio, Brühzeit, Temperatur.

---

## Offene Ideen & Backlog

### Geplant (nächste Schritte)
- [ ] **Gaggimate PID-Integration**: Maschinenparameter (Temperatur, Druck) automatisch via Bluetooth/API übernehmen. Rancilio Silvia + Gaggimate Controller.
- [ ] **Auth / Multi-User**: Supabase Auth (Email/Passwort), Row Level Security aktivieren, App veröffentlichen. Migration: `user_id` zu allen Tabellen + einmaliges SQL-Script.
- [ ] **Echtes App-Icon**: Aktuell Platzhalter-PNG. Professionelles Espresso-Icon für PWA.

### Analyse & Visualisierung
- [ ] Zeitreihe: Wie entwickeln sich Mahlgrad und Bewertung über Zeit?
- [ ] Körper vs. Säure Scatter (Charakterprofil des Kaffees)
- [ ] Export als CSV / JSON

### UX
- [ ] Shot bearbeiten / löschen (aktuell nur anzeigen)
- [ ] Offline-Support (Service Worker) — kommt mit Auth zusammen
- [ ] Dark Mode Toggle

### Daten
- [ ] Rösterei: Öffnungszeiten / Notizen-Feld
- [ ] Kaffee: Preis pro 100g tracken
- [ ] Tasting Notes als Tags (statt Freitext) für bessere Auswertung

---

## Deployment

| | |
|---|---|
| Frontend | Vercel (Auto-Deploy bei Push auf `main`) |
| Backend | Supabase Cloud, Region Frankfurt |
| Supabase URL | `https://hkvfsiiidmqazrghvlgj.supabase.co` |
| Env Vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in Vercel hinterlegt |

---

## Bekannte Limitierungen (v1)

- Kein Login → alle Daten öffentlich lesbar über Anon-Key (akzeptabel für persönlichen Gebrauch)
- Kein Offline-Support (Service Worker fehlt noch)
- Shot-Liste: kein Edit/Delete
- Brew Ratio wird nur bei neuen Shots berechnet — alte Shots haben `null`
