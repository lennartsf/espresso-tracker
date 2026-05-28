# Espresso Tracker — Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

A Progressive Web App (PWA) to track and analyse espresso shots pulled on a Rancilio Silvia. The goal is to find the optimal grind setting per coffee bean by logging every shot and visualising the relationship between parameters and taste.

---

## Scope

### v1 (this spec)
- Manual shot logging with all key parameters
- Cross-device sync (iPhone ↔ Windows/Mac) via Supabase, no login required
- Two analysis views: scatter plot (grind vs. rating) and best-recipe card per coffee

### v2 (out of scope now)
- User authentication (Supabase Auth + Row Level Security)
- Multi-user / publishable app
- Gaggimate PID integration (machine data sync)

---

## Architecture

```
[React PWA] ←→ [Supabase (PostgreSQL)]
     ↑                   ↑
  Vercel             Supabase Cloud
  (free)             (free tier)
```

**Frontend:** React + Vite + TypeScript, Tailwind CSS, Recharts, React Query  
**Backend:** Supabase — direct database access via anon key (no auth in v1)  
**Deployment:** Vercel (frontend) + Supabase Cloud  
**Platform:** Installable PWA on iPhone (add to home screen), Windows, macOS

### Auth Migration Path (v2)
Add `user_id uuid references auth.users` to both tables, enable Row Level Security, assign existing rows to first user via a one-time SQL script. No frontend restructuring required.

---

## Data Model

### `coffees`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| name | text | e.g. "Ethiopia Yirgacheffe" |
| roaster | text | |
| origin | text | |
| roast_date | date | |
| notes | text | free text |
| created_at | timestamptz | auto |
| *(user_id)* | *(uuid FK)* | *added in v2* |

### `shots`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| coffee_id | uuid FK → coffees.id | required |
| grind_setting | numeric | mühlen-specific number |
| dose_g | numeric | input weight in grams |
| yield_g | numeric | output weight in grams |
| brew_time_s | integer | seconds |
| temp_c | numeric | °C, manual entry in v1 |
| rating | integer (1–10) | 10-button scale, no stars |
| tasting_notes | text | free text |
| pulled_at | timestamptz | when the shot was pulled |
| created_at | timestamptz | auto |
| *(user_id)* | *(uuid FK)* | *added in v2* |

**Relationship:** one `coffee` → many `shots`

---

## Screens

### 1. Dashboard
- Stats summary: total shots, average rating
- List of last 5–10 shots with coffee name, grind setting, brew time, rating badge (color-coded: green ≥8, yellow 5–7, grey ≤4)
- Prominent "Neuer Shot" button (orange CTA)

### 2. Neuer Shot (form)
- Coffee dropdown (select from existing coffees, or add new inline)
- Fields: Mahlgrad, Temperatur, Einwaage (g), Ausbeute (g)
- Brühzeit with integrated timer (tap to start/stop, result pre-fills the field)
- Rating: row of 10 tappable number buttons (1–10), selected button highlighted orange
- Tasting notes: free text area
- Save / Cancel

### 3. Shot History
- Full list of all shots, newest first
- Filter by coffee
- Tap a shot to view/edit details

### 4. Kaffee-Verwaltung
- List of coffees with shot count and average rating
- Add / edit / delete coffee

### 5. Analyse
- Coffee selector dropdown
- **Scatter plot:** x-axis = grind setting, y-axis = rating. Each dot = one shot. Best shot highlighted in green. Helps identify optimal grind range visually.
- **Best-recipe card:** computed from shots with rating ≥ 8 for the selected coffee. Shows median grind range, typical ratio, typical brew time range, typical temperature.

---

## UI Design

- **Mode:** Light
- **Accent colour:** Orange (#f97316)
- **Layout:** Mobile-first, responsive for desktop
- **Rating input:** 10 tappable number buttons in a row (no stars)
- **Bottom navigation** on mobile: Dashboard · Shots · Analyse · Coffees
- **PWA manifest:** app name "Espresso", icon, standalone display mode

---

## Error Handling

- Supabase connection errors: show inline toast, data not lost (React Query retries automatically)
- Required fields (coffee, grind setting, rating): validated before save, inline error messages
- Empty analysis state: friendly empty state with "Noch keine Shots für diesen Kaffee"

---

## Out of Scope for v1

- Offline support / service worker caching (add alongside Auth in v2)
- Push notifications
- Dark mode
- CSV/JSON export (considered for v2)
- Gaggimate / machine integration
