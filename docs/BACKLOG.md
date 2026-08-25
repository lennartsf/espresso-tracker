# Espresso Tracker — Backlog (Stand 2026-08-25)

> Aufnahme der Wünsche aus der User-Runde vom 2026-08-25, gebündelt zu Paketen.
> Sortierung = Themenbereich + Aufwand, nicht zwingend Reihenfolge der Umsetzung.
> Reihenfolge-Vorschlag ganz unten unter **Empfohlene Reihenfolge**.
>
> Aufwands-Skala: **XS** ≈ < 1 h · **S** ≈ halber Tag · **M** ≈ 1–2 Tage ·
> **L** ≈ 3–5 Tage · **XL** ≈ > 1 Woche (jeweils fokussierte Arbeitszeit, inkl. Tests).

---

## Paket A — Dial-in Quick Wins (klein, zusammen erledigen)
**Aufwand gesamt: S** · Kein Design-Impact · Beide Tasks fassen dieselben Dateien an
(`NewShot.tsx`, `CoffeeManager.tsx`, `RoasterRecipeFields.tsx`) → sinnvoll in *einem* Branch.

### A1 · Mahlgrad aus letztem Shot der Bohne übernehmen  *(Task 4)* — **XS–S**
Beim Auswählen eines Kaffees in `NewShot` den `grind_setting` des **letzten Shots
mit genau dieser Bohne** vorbefüllen (nicht des global letzten Shots).
- Heute: `↻ Repeat last` prefillt den letzten Shot *insgesamt* (`NewShot.tsx:116-137`),
  und die Röster-Empfehlung prefillt Dose/Yield/Temp (`NewShot.tsx:174-180`).
- Neu: `useShots` nach `coffee_id` filtern → jüngster Shot → `grind_setting` setzen.
- **Achtung `useRef`-Guard:** Vorauswahl darf User-Eingaben nach Coffee-Wechsel
  nicht überschreiben (Muster wie bei den Equipment-Defaults).
- Offene Detailfrage: auch bei Röstdatum-Wechsel neu vorschlagen? (Vorschlag: ja,
  aber nur wenn Feld noch unberührt.)
- Keine Migration.

### A2 · „Grind Note" bei Coffees durch Notizen ersetzen  *(Task 9)* — **XS**
Das Feld `rec_grind_note` im Block *Roaster Recipe* verschwindet als eigenes
Textarea; stattdessen läuft der Inhalt über das allgemeine `notes`-Feld des Kaffees.
- Betroffen: `RoasterRecipeFields.tsx` (Feld raus, `recipePayload` anpassen),
  `CoffeeManager.tsx` (Detail-Anzeige), `NewShot.tsx:398-399` (Anzeige „Roaster grind:").
- **Migration:** bestehende `rec_grind_note`-Werte nach `coffees.notes` mergen,
  Spalte danach droppen (oder erst als deprecated stehen lassen).
- ⚠️ **Annahme:** „austauschen" = Grind Note entfällt und wandert ins Notizfeld.
  Falls stattdessen gemeint war *„Grind Note soll ein zweites, freieres Notizfeld
  pro Kaffee bekommen"* — kurz sagen, dann drehe ich A2.
- Kollision mit **Paket B:** wenn Rezepte pro Bohne kommen, gehört die Grind Note
  ggf. *pro Rezept* statt pro Kaffee → A2 bewusst **vor** B klären.

---

## Paket B — Rezepte pro Bohne + Ziel-Anzeige *(Task 5)*
**Aufwand: M** · Migration nötig · **Fundament für Paket E (Algorithmus)**

Mehrere benannte Rezepte pro Kaffee statt der heutigen *einen* Röster-Empfehlung
(`coffees.rec_*`). Bei „Rezept übernehmen" werden Dose/Zeit/Yield **nicht** in die
Felder geschrieben, sondern als leuchtender Zielwert *neben* dem Eingabefeld gezeigt
(Orientierung statt Vorbelegung). Nur Mahlgrad/Equipment dürfen weiterhin prefillen.

- **Neue Tabelle `coffee_recipes`:** `id`, `coffee_id` FK, `user_id` + RLS,
  `name` (z. B. „Röster-Vorgabe", „Mein Standard", „Ristretto"), `dose_g`, `yield_g`,
  `temp_c`, `time_s`, `grind_hint`, `is_default`, `created_at`.
- **Backfill:** bestehende `coffees.rec_*` → je ein Rezept „Roaster" pro Kaffee.
  `rec_*`-Spalten danach deprecaten (erst nach verifiziertem Backfill droppen).
- **UI:** Rezept-Liste + CRUD in der Kaffee-Detailseite; Rezept-Picker in `NewShot`;
  neue UI-Primitive **„Target-Ghost"** (Zielwert glühend neben/unter dem Input,
  Delta-Farbe wenn Ist ≠ Ziel). Gehört als Baustein in `docs/DESIGN.md`.
- **Vorsicht Offline-Queue:** Rezept-CRUD ist *kein* Create-Shot → läuft nicht über
  `writeQueue` (nur Creates), also online-only wie Edits heute.
- Hängt zusammen mit **A2** (wo lebt die Grind Note?) und **A1** (Prefill-Regeln).

---

## Paket C — Design-Relaunch Light/Dark im MacroFactor-Look *(Tasks 1 + 2)*
**Aufwand: L** (App) + **S–M** (Website) · **Bewusst als ein Paket** — App und
Website teilen die Tokens in `src/index.css` / `tailwind.config.ts`; zwei getrennte
Wellen würden das Design-System zweimal umbauen.

### C1 · Theme-System: Light + Dark  — **M**
- Tokens von „Dark-only" auf **semantische Paare** umstellen (`--surface`, `--fg`,
  `--muted`, `--line`, `--accent` …) mit Light-/Dark-Werten; heutige `--coffee-*`
  als Aliase behalten, damit nicht 30 Dateien gleichzeitig brechen.
- Umschalter: `data-theme` am `<html>` + Setting (System / Light / Dark), Persistenz
  in `localStorage`, `prefers-color-scheme` als Default.
- **Kritisch:** Funktionsfarben bleiben unangetastet in ihrer *Bedeutung*, brauchen
  aber Light-Varianten mit ausreichendem Kontrast — `ratingColor.ts` (10-stufig
  rot→grün), `intensityFill`/`intensityBadge`, Chart-Punktfarben in `Analysis.tsx`,
  Leaflet-Tiles (`dark_all` ↔ heller Tileset), die 4 Animations-SVGs (die sind
  *schon einmal* dark-getunt worden — hier droht Doppelarbeit, deshalb Token-basiert
  lösen statt hartkodiert).
- Regressionsrisiko: hoch, weil jede Seite betroffen ist. Gegenmittel: `npm run shoot`
  + Screenshot-Vergleich Light/Dark pro Seite.

### C2 · MacroFactor-Look übernehmen  — **M**
Was an MacroFactor optisch trägt (und was wir davon übernehmen): sehr ruhige,
flächige Karten mit viel Weißraum, kräftige Zahlen-Typo, klare Datenvisualisierung
statt Deko, dezente Akzentfarbe nur an Interaktion. Das kollidiert teilweise mit dem
heutigen „Embossed-Cockpit"-Look (Verläufe + Inset-Highlight, `cardClasses`).
→ **Entscheidung nötig:** Embossed-Optik behalten und nur aufhellen, *oder* auf flach
+ Elevation-per-Schatten wechseln. Ich empfehle Letzteres, sonst wirkt Light-Mode
schnell schmutzig. `docs/DESIGN.md` v3 wird dabei neu geschrieben.

### C3 · Anpassbares Dashboard  — **M**
MacroFactor-Feature: Nutzer stellt sich die Home-Kacheln selbst zusammen.
- Widget-Registry (Ø-Flavor-Dial, Shots/Tag, Ratio, Wochen-Shots, Top-Rezept,
  letzte Brews …), Reihenfolge + Sichtbarkeit pro User.
- Persistenz: neue Tabelle `dashboard_layout` (user_id PK, jsonb) — oder erst nur
  `localStorage`, wenn es schnell gehen soll.
- Drag&Drop mobil ist der teure Teil; **Stufe 1 = Ein/Aus + Hoch/Runter-Pfeile**
  reicht für 90 % des Nutzens.

### C4 · Website auf denselben Look  *(Task 2)*  — **S–M**
`src/marketing/*` (Landing, Try, Auth) auf die neuen Tokens ziehen. Geringer Umfang,
**aber nur sinnvoll direkt nach C1/C2** — sonst driften App und Website auseinander.

---

## Paket D — Röstgrad-Feinskala + Bohnen-Visual *(Task 10)*
**Aufwand: M** · Migration nötig · Isoliert umsetzbar, **aber nach Paket C bauen**
(sonst wird die Bohnen-Grafik zweimal eingefärbt).

- **Feinere Skala:** `coffees.roast_level` ist heute `int2` 1–10. Neu: zusätzlich
  ein feiner Wert (Vorschlag `roast_level_fine numeric(4,2)`, 1.00–10.00) über einen
  Schiebebalken; das grobe Feld bleibt als schnelle Eingabe erhalten und wird aus
  dem feinen abgeleitet (Rundung), damit Badges/Filter weiterlaufen.
- **Bohnen-Animation im Bracket:** zwei Bohnen (Arabica / Robusta) nebeneinander;
  bei 100 % einer Sorte nur diese, bei Blend beide — Datenquelle ist
  `arabica_pct` / `robusta_pct`, die es schon gibt (`CoffeeManager.tsx:324-348`).
  Slider-Bewegung färbt die Bohne live (hell → dunkel entlang der Röstkurve) und
  schreibt gleichzeitig den feinen Röstwert.
- **Bohne als Fallback-Foto:** gerenderte Bohne wird zum Kaffee-Bild, wenn kein
  Foto hochgeladen wurde. Zwei Wege:
  1. **Kein Upload** — SVG zur Laufzeit aus `roast_level_fine` + Sortenmix rendern
     (billig, immer konsistent, kein Storage). **Empfohlen.**
  2. Als PNG rendern und in Supabase Storage legen (echtes `photo_url`) — nur nötig,
     wenn das Bild außerhalb der App gebraucht wird. Kostet Storage-RLS-Arbeit
     (steht ohnehin im Auth-Backlog).
- Passt technisch zur bestehenden Self-Computed-SVG-Engine (`animationEngine.ts`),
  ist aber eine eigenständige Grafik — Brief nach `docs/animation-brief-template.md`
  wäre hier sinnvoll.

---

## Paket E — Dial-in-Algorithmus *(Task 7)*
**Aufwand: L** · **Isoliert betrachten** · Setzt **Paket B** voraus (Rezept als Ziel)
und profitiert stark von **A1** (Mahlgrad-Historie pro Bohne).

Ziel: Neuer Kaffee → Mühle verhält sich anders. Der Algorithmus lernt aus den
aufgezeichneten Shots, wie *diese* Mühle auf Mahlgrad-Änderungen reagiert, und
schlägt den nächsten Mahlgrad vor, um schnellstmöglich das Ziel-Rezept zu treffen.

- **Modell (Stufe 1, ehrlich einfach):** pro `grinder_id` eine lineare Regression
  `brew_time_s ~ grind_setting` über alle Shots (ggf. je Kaffee normiert). Steigung =
  „Sekunden pro Mahlgrad-Klick" = das gesuchte Mühlenverhalten. Vorschlag =
  `aktueller Mahlgrad + (Zielzeit − Ist-Zeit) / Steigung`.
- **Stufe 2:** Bayes'sches Update — Mühlen-Prior aus allen Kaffees, pro-Kaffee-Offset
  wird mit jedem neuen Shot nachgezogen. Löst genau das „neue Bohne, gleiche Mühle"-Problem.
- **Ehrlichkeit ist Pflicht:** bei < ~3 Shots keine Zahl erfinden, sondern
  „noch zu wenig Daten — starte bei X (Röster-Rezept)". Konfidenz sichtbar machen.
- Rein clientseitig rechenbar (`src/utils/dialIn.ts`), kein Backend, gut testbar
  → TDD-Kandidat mit synthetischen Shot-Serien.
- Störgrößen dokumentieren, die das Modell *nicht* kennt: Bohnenalter (`roast_dates`
  gibt es!), Dosis-Schwankung, Puck-Prep (`used_wdt` etc.). Kandidaten für Stufe 3.

---

## Paket F — Bluetooth-Waage + Auto-Stop-Timer *(Task 6)*
**Aufwand: L** · **Isoliert** · **Harte Abhängigkeit von Paket G für iPhone**

- **Web Bluetooth ist der Blocker:** Chrome/Edge auf Android + Desktop können es,
  **Safari (iOS *und* macOS) und Firefox nicht** — und Apple erlaubt keine fremden
  Browser-Engines in der Form, dass ein PWA-Workaround entstünde. Auf dem iPhone
  gibt es Web Bluetooth also faktisch nur über Fremdbrowser wie Bluefy.
  → Für die iPhone-Nutzung führt kein Weg an **Paket G (native App)** vorbei.
- **Protokolle sind herstellerspezifisch und teils undokumentiert.** Acaia (Pearl/Lunar),
  Bookoo Themis, Felicita, Timemore, Decent — jede Waage hat eigene GATT-Services und
  Byte-Frames. Realistisch: **eine** Waage zuerst sauber unterstützen, Architektur
  aber als Adapter-Interface bauen (`scaleAdapter.ts` mit `connect/onWeight/tare`).
  → **Welche Waage besitzt du bzw. willst du kaufen?** Das entscheidet den Umfang.
- **Auto-Stop-Timer:** Gewichtsstrom glätten (gleitendes Mittel), Flow-Rate ableiten,
  bei Flow < Schwelle (z. B. < 0,2 g/s) für N ms → Timer stoppt und trägt `yield_g`
  automatisch ein. Muss `BrewTimer.tsx` (Pull-Arc-Ring) erweitern, ohne den
  manuellen Modus kaputtzumachen.
- Ohne Hardware kaum sinnvoll testbar → Mock-Adapter mit aufgezeichneter Gewichtskurve
  einplanen, sonst ist das Ding nicht CI-fähig.

---

## Paket G — Native Apps: iPhone, Mac, Android *(Task 3)*
**Aufwand: XL** · **Isoliert, eigener Meilenstein** · Website bleibt bestehen

Der bisherige Grundsatz „PWA statt native App" (`PROJECT_LOG.md`) wird damit bewusst
gekippt. Empfehlung: **kein Rewrite**, sondern die bestehende React-App verpacken.

- **Capacitor** (iOS + Android) um die vorhandene Vite-App: der React-Code bleibt
  wie er ist, native Plugins (u. a. **Bluetooth für Paket F**) werden dazugesteckt.
  Deutlich billiger als React Native/Expo, weil kein UI-Rewrite anfällt.
- **Mac:** Capacitor zielt nicht sauber auf macOS. Optionen: iPad-App via
  „Designed for iPad" auf Apple Silicon (fast gratis, wenn iOS steht), oder
  **Tauri/Electron**-Wrapper für eine echte Mac-App.
- **Laufende Kosten & Prozess** (das ist der eigentliche Aufwand, nicht der Code):
  Apple Developer Program **99 $/Jahr**, Google Play **25 $ einmalig**, App-Review,
  Store-Assets (Icons, Screenshots, Datenschutzerklärung, Account-Löschfunktion —
  Apple verlangt Letztere bei Login-Pflicht!), Signing/CI.
- **Vorarbeit, die sich lohnt:** Supabase-Auth-Redirects für native Deep Links,
  Storage-RLS (steht schon im Auth-Backlog), Offline-Queue prüfen (die gibt es).
- Website (`/`, `/try`, `/login`) läuft unverändert auf Vercel weiter.

---

## Paket H — Schönere Röster-Karte *(Task 8)*
**Aufwand: S** · Vollständig isoliert · Guter Lückenfüller

**Frage „Geht Google Maps kostenfrei?" — kurze Antwort: für deine Größenordnung ja,
aber mit Kreditkarte und Kleingedrucktem.**
- Seit März 2025 gibt es **nicht mehr** das alte 200-$-Guthaben, sondern ein
  **Free-Tier pro SKU: 10.000 Aufrufe/Monat für „Essentials"** — und *Dynamic Maps*
  (die interaktive JS-Karte) fällt genau darunter. Darüber kostet es **7 $ pro 1.000
  Map Loads**. Eine private Tracker-App liegt weit unter 10.000 → **faktisch 0 €**.
- **Aber:** Billing-Account mit Kreditkarte ist Pflicht, der API-Key liegt im Frontend
  (zwingend HTTP-Referrer-Restriktionen setzen, sonst zahlt man fremden Traffic),
  und ohne Ausgabenlimit-Alarm ist ein Kostenrisiko da, das es heute *nicht* gibt.
  Leaflet + CartoDB läuft aktuell **ohne Key und ohne Account**.
- **Meine Empfehlung:** erst die billige Variante ausreizen — bei Leaflet bleiben und
  nur die Optik heben: hübscheres Tileset (MapTiler / Stadia / Protomaps, freie Tiers),
  Marker-Cluster, Custom-Pins mit Röster-Foto, sanftes Fly-To beim Auswählen,
  Light/Dark-Tiles passend zu **Paket C**. Das holt den Großteil des optischen Gewinns
  bei null Kosten und null Key-Verwaltung.
- Google Maps nur nehmen, wenn dir explizit der *Google-Look* mit POIs, Street View
  und Google-Bewertungen der Röstereien wichtig ist. Dann Paket H auf **M** hochstufen
  (Key-Handling, Migration weg von react-leaflet, `RoasterMap.tsx` neu).

---

## Empfohlene Reihenfolge

| # | Paket | Aufwand | Warum an dieser Stelle |
|---|---|---|---|
| 1 | **A** — Dial-in Quick Wins (4, 9) | S | Sofort spürbar bei jedem Shot, kein Risiko, klärt nebenbei wo die Grind Note lebt |
| 2 | **B** — Rezepte pro Bohne (5) | M | Höchster Alltagsnutzen; **Voraussetzung für den Algorithmus** |
| 3 | **C** — Design Light/Dark + Website (1, 2) | L | Muss *vor* neuen großen UI-Flächen kommen, sonst wird alles zweimal gestylt |
| 4 | **D** — Röstgrad-Skala + Bohnen-Visual (10) | M | Baut direkt auf dem neuen Design auf |
| 5 | **E** — Dial-in-Algorithmus (7) | L | Braucht B + genug aufgezeichnete Shots |
| 6 | **H** — Schönere Karte (8) | S | Jederzeit einschiebbar, gern als Pause zwischen zwei großen Paketen |
| 7 | **G** — Native Apps (3) | XL | Eigener Meilenstein; erst wenn die App inhaltlich steht |
| 8 | **F** — Bluetooth-Waage (6) | L | Auf dem iPhone erst *nach* G überhaupt möglich |

**Vorschlag für den Start: Paket A**, direkt gefolgt von **Paket B**.
A ist in einer Sitzung erledigt und macht das tägliche Shot-Erfassen sofort besser;
B ist der Baustein, an dem später der Algorithmus (E) hängt. Wer lieber optisch
startet, nimmt stattdessen C zuerst — dann aber bitte **komplett** (C1–C4), sonst
driften App und Website auseinander.

---

## Offene Fragen an den User
1. **A2:** Grind Note *ersetzen* durch das allgemeine Notizfeld — oder soll die Grind
   Note als eigenes Feld bleiben und nur umbenannt/erweitert werden?
2. **B:** Sollen Rezepte auch *automatisch* aus guten Shots entstehen können
   („diesen Shot als Rezept speichern")?
3. **C2:** Embossed-Cockpit-Look aufhellen oder auf flach/MacroFactor-ruhig wechseln?
4. **F:** Welche Bluetooth-Waage konkret? (Acaia / Bookoo / Timemore / andere)
5. **G:** Ist die Apple-Developer-Mitgliedschaft (99 $/Jahr) gesetzt oder soll erst
   Android/Play (25 $ einmalig) getestet werden?

---

## Bereits bekannter Alt-Backlog (unverändert offen)
Aus `CLAUDE.md` / `docs/DESIGN.md`, hier nur zur Vollständigkeit:
- **Auth-Rest:** Passwort-Reset, E-Mail-Bestätigung, Storage-RLS + per-User-Pfade,
  später geteilter Katalog-Split. *(Storage-RLS berührt Paket D Variante 2 und G.)*
- **Mobile-Visualisierung:** 390px-Audit ist gemacht, kein akuter Mangel offen —
  wartet auf gezielte Wünsche. *(Geht in Paket C auf.)*
