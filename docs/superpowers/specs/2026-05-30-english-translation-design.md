# English Translation — Design Spec

**Date:** 2026-05-30  
**Scope:** Permanent full translation of the Espresso Tracker app from German to English. No language toggle, no i18n framework — direct string replacement across all files.

---

## 1. Route Changes

Update `App.tsx` (route definitions) and `Layout.tsx` (nav `to` paths):

| Old route | New route |
|-----------|-----------|
| `/analyse` | `/analysis` |
| `/kaffee` | `/coffees` |
| `/ausruestung` | `/equipment` |
| `/glossar` | `/glossary` |

Routes that stay unchanged: `/shots`, `/shots/new`, `/shots/:id`, `/brews`, `/brews/new`, `/brews/:id`, `/roasters`, `/guide`, `/guide/:id`

---

## 2. File Rename

`src/pages/Glossar.tsx` → `src/pages/Glossary.tsx`

- Export renamed: `Glossar` → `Glossary`
- Import updated in `App.tsx`

---

## 3. Navigation Labels (Layout.tsx)

| Old | New |
|-----|-----|
| Brühen | Brews |
| Analyse | Analysis |
| Kaffee | Coffees |
| Röstereien | Roasters |
| Ausrüstung | Equipment |
| Glossar | Glossary |
| Mehr | More |

"Home", "Shots", "Guide" stay unchanged.

---

## 4. UI Strings — Pages & Components

All German labels, placeholders, headings, button text, error messages, and inline info strings replaced with English equivalents across:

**Pages:**
- `Dashboard.tsx` — section headings, stat labels
- `NewShot.tsx` — form labels, placeholders, i-button descriptions
- `ShotHistory.tsx` — filter tab labels, empty states
- `ShotDetail.tsx` — field labels, edit mode strings
- `ShotCard.tsx` — badge labels, sublabels (already partially English)
- `Analysis.tsx` — tab labels, axis labels, filter labels, section headings
- `CoffeeManager.tsx` — form labels, headings, empty states
- `Roasters.tsx` — form labels, headings
- `Equipment.tsx` — tab labels, form labels, section headings, default-setting button
- `Brews.tsx` — headings, empty states
- `NewBrew.tsx` — form labels, placeholders, i-button descriptions, method info
- `BrewDetail.tsx` — field labels, edit mode strings
- `BrewCard.tsx` — sublabels
- `Guide.tsx` — page heading, subheading
- `GuideDetail.tsx` — section headings (Quick Tips, Steps, Troubleshooting)
- `Glossary.tsx` (renamed) — search placeholder, category filter labels, empty state
- `Layout.tsx` — nav labels (see §3)

**Components:**
- `PhotoUpload.tsx` — button text, error messages
- `BrewTimer.tsx` — button labels
- `RatingInput.tsx` — label text
- `RecipeCard.tsx` — field labels

---

## 5. Content Files

### 5a. `glossaryContent.ts`

- **Terms (`term` field):** Most espresso terms are internationally known (Crema, Bloom, TDS, WDT, RDT, Puck, Tampen, etc.) — keep as-is where they are standard international terms; translate purely German terms (e.g. "Brühgruppe" → "Group Head", "Brühtemperatur" → "Brew Temperature", "Stufenlose Mühle" → "Stepless Grinder").
- **Definitions:** All 46 definitions rewritten in English.
- **Category type:** `'milch'` → `'milk'` in the `GlossaryTerm` interface and all entries.
- Sort locale changed from `'de'` to `'en'`.

### 5b. `guideContent.ts`

All prose content translated to English:
- Guide titles and subtitles
- Quick-chip labels
- Step titles and descriptions
- Troubleshooting questions and answers

Guide IDs (used in routing) stay unchanged: `espresso`, `french-press`, `v60`, `aeropress`, `moka-pot`, `milk`.

### 5c. `brewMethods.ts`

Label strings in `BREW_METHOD_INFO` translated. Method keys unchanged (`french_press`, `v60`, etc.).

### 5d. `drinkTypes.ts`

`drinkTypeLabel()` and `milkTypeLabel()` return English strings. Type keys unchanged.

### 5e. `equipmentTypes.ts`

All label functions return English strings. Type keys unchanged (they are already English-style: `flat`, `conical`, `einkreiser`, etc. — the German machine types like `einkreiser`/`zweikreiser` stay as DB values but their display labels become English: "Single Boiler", "Heat Exchanger", "Dual Boiler", "Thermoblock").

---

## 6. Tests

Test files that assert on German strings are updated to match new English strings:
- `ShotCard.test.tsx`
- `ShotDetail.test.tsx`
- `BrewCard.test.tsx`
- `Equipment.test.tsx`
- `Guide.test.tsx`
- `GuideDetail.test.tsx`
- `guideContent.test.ts`
- `drinkTypes.test.ts`
- `equipmentTypes.test.ts`
- `brewMethods.test.ts`

---

## 7. CLAUDE.md Update

- Update implemented features list to reflect English UI
- Remove "App auf Englisch" from planned features (already done at planning stage)

---

## Out of Scope

- Database column names / values (e.g. `drink_type = 'espresso'`, `funktionsweise = 'einkreiser'`) — these are internal DB keys, not user-visible strings; left unchanged
- Route redirects for old German routes (single-user app, no external links to preserve)
- PWA manifest `name`/`short_name` (optional, low priority)
