# Guide-Tab — Design Spec

**Datum:** 2026-05-30  
**Status:** Approved  
**Scope:** Statischer Content-Guide als neuer `/guide`-Tab

---

## Übersicht

Neuer Tab im Espresso Tracker mit Anleitungen und Troubleshooting für alle unterstützten Brühmethoden sowie Milchaufschäumen. Kein DB-Schema nötig — rein statischer Content in einer TypeScript-Datei.

**Ziel:** Schnelles Nachschlagen bei Brühproblemen direkt in der App, ohne externe Quellen.

---

## Navigation

- Neuer Eintrag `/guide` in Mobile Bottom-Nav (5. Icon: 📖) und Desktop-Sidebar
- Route `/guide` → `Guide.tsx` (Übersicht)
- Route `/guide/:id` → `GuideDetail.tsx` (Detail)

---

## Seiten

### `/guide` — Übersicht

2×3 Karten-Grid (mobile), 3×2 oder angepasst (desktop).

Jede Karte zeigt:
- Icon + Titel + Kurzbeschreibung
- 1–2 häufigste Problem-Chips als Vorschau (farbig, nicht klickbar auf Übersicht)

Karten (in dieser Reihenfolge):
1. ☕ Espresso — "Extraktion · Troubleshooting"
2. 🫖 French Press — "Anleitung · Troubleshooting"
3. 🌊 V60 — "Pour Over · Anleitung"
4. 🧪 AeroPress — "Anleitung · Varianten"
5. 🔥 Moka Pot — "Herd · Anleitung"
6. 🥛 Milch — "Aufschäumen · Latte Art"

Klick auf Karte → navigiert zu `/guide/:id`.

### `/guide/:id` — Detail

Aufbau von oben nach unten:

**1. Header**  
Icon + Titel + Kurzbeschreibung

**2. Häufige Probleme (Quick-Chips)**  
Farbige Chips (je nach Problemtyp: gelb = sauer, rot = bitter, blau = wässrig etc.).  
Klick scrollt zum zugehörigen Troubleshooting-Akkordeon-Eintrag und öffnet ihn automatisch.

**3. Schritt-für-Schritt**  
Nummerierte Liste (numbered badge in Braun), je Step: Titel + Kurzdetail (1 Satz).

**4. Troubleshooting (Akkordeon)**  
Jedes Problem als klickbare Zeile. Klappt auf → zeigt Ursache (1 Satz) + Lösungs-Bullets (3–5 Punkte). Immer nur ein Item offen gleichzeitig.

---

## Datenstruktur — `src/utils/guideContent.ts`

```ts
export interface QuickProblem {
  label: string;    // Chip-Text, z.B. "Zu sauer?"
  targetId: string; // ID des zugehörigen TroubleshootingItem
}

export interface TroubleshootingItem {
  id: string;
  problem: string;  // Akkordeon-Titel
  cause: string;    // 1 Satz Ursache
  solutions: string[]; // 3–5 Bullet-Points
}

export interface Step {
  title: string;
  detail: string;
}

export interface Guide {
  id: string;          // URL-Segment: 'espresso', 'french-press', etc.
  title: string;
  icon: string;
  description: string; // Kurzbeschreibung auf Übersichtskarte
  quickProblems: QuickProblem[];
  steps: Step[];
  troubleshooting: TroubleshootingItem[];
}

export const GUIDES: Guide[] = [
  // espresso, french-press, v60, aeropress, moka-pot, milch
];
```

---

## Content-Umfang (alle 6 Guides auf Deutsch)

| Guide | id | Steps | Troubleshooting-Items |
|---|---|---|---|
| Espresso | `espresso` | 6 | 6: sauer, bitter, channeling, wässrig, zu schnell, kein Crema |
| French Press | `french-press` | 5 | 4: trüb, bitter, schwach, Satz im Glas |
| V60 | `v60` | 5 | 4: zu langsam, zu schnell, sauer, bitter |
| AeroPress | `aeropress` | 5 | 3: zu bitter, Kolben drückt schwer, wässrig |
| Moka Pot | `moka-pot` | 5 | 4: spritzt, verbrannt, zu schwach, stockt |
| Milch | `milch` | 4 | 4: zu viel Schaum, kein Mikroschaum, verbrennt, trennt sich |

Tiefe: Mittel — kurze Erklärung (1 Satz) + 3–5 Bullet-Points pro Troubleshooting-Item. Steps: Titel + 1 Satz Detail.

---

## Neue Dateien

| Datei | Zweck |
|---|---|
| `src/utils/guideContent.ts` | Alle Guide-Inhalte (GUIDES-Array + Typen) |
| `src/pages/Guide.tsx` | Übersichtsseite — Karten-Grid |
| `src/pages/GuideDetail.tsx` | Detail-Seite — Chips + Steps + Akkordeon |

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `src/App.tsx` | Routen `/guide` und `/guide/:id` hinzufügen |
| `src/components/Layout.tsx` | Guide-Icon in Mobile-Nav + Desktop-Sidebar |

---

## Verhalten

- `GuideDetail` erhält `:id` aus URL-Params, sucht in `GUIDES.find(g => g.id === id)`
- Ungültige ID → Redirect zu `/guide`
- Quick-Chip-Klick: `element.scrollIntoView({ behavior: 'smooth' })` + Accordion-State auf `targetId` setzen
- Akkordeon: nur ein Item gleichzeitig offen (toggle schließt bei erneutem Klick)

---

## Testing

- Rendering-Test `Guide.tsx`: rendert alle 6 Karten
- Rendering-Test `GuideDetail.tsx`: rendert Steps, Chips und Troubleshooting für jeden Guide
- Struktur-Test: alle GUIDES-Einträge haben Pflichtfelder (id, title, icon, quickProblems.length > 0, steps.length > 0, troubleshooting.length > 0)

---

## Nicht in Scope (Phase 1)

- Animationen oder interaktive Illustrationen (Phase 2, nicht spezifiziert)
- Suchfunktion über Guides
- User-eigene Notizen zu Guides
- Englische Übersetzung (separates Feature)
- DB-Integration oder personalisierter Content
