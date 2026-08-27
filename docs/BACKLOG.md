# Espresso Tracker — Backlog (Stand 2026-08-25)

> Aufnahme der Wünsche aus der User-Runde vom 2026-08-25, gebündelt zu Paketen.
> Sortierung = Themenbereich + Aufwand, nicht zwingend Reihenfolge der Umsetzung.
> Reihenfolge-Vorschlag ganz unten unter **Empfohlene Reihenfolge**.
>
> Aufwands-Skala: **XS** ≈ < 1 h · **S** ≈ halber Tag · **M** ≈ 1–2 Tage ·
> **L** ≈ 3–5 Tage · **XL** ≈ > 1 Woche (jeweils fokussierte Arbeitszeit, inkl. Tests).

---

## Paket A — Dial-in Quick Wins ✅ ERLEDIGT (2026-08-27)
> Beide Tasks umgesetzt, 178 Tests grün, `tsc` sauber. Offen ist nur noch das
> Ausführen der SQL-Migration für A2 (siehe unten).


**Aufwand gesamt: S** · Kein Design-Impact · Beide Tasks fassen dieselben Dateien an
(`NewShot.tsx`, `CoffeeManager.tsx`, `RoasterRecipeFields.tsx`) → sinnvoll in *einem* Branch.

### A1 · Mahlgrad aus letztem Shot der Bohne übernehmen  *(Task 4)* — ✅ **ERLEDIGT**
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

### A2 · „Grind Note" bei Coffees durch Notizen ersetzen  *(Task 9)* — ✅ **ERLEDIGT** (Migration offen)
Das Feld `rec_grind_note` im Block *Roaster Recipe* verschwindet als eigenes
Textarea; stattdessen läuft der Inhalt über das allgemeine `notes`-Feld des Kaffees.
- Betroffen: `RoasterRecipeFields.tsx` (Feld raus, `recipePayload` anpassen),
  `CoffeeManager.tsx` (Detail-Anzeige), `NewShot.tsx:398-399` (Anzeige „Roaster grind:").
- **Migration:** `docs/migrations/2026-08-27-grind-note-to-notes.sql` — zwei Schritte
  (mergen, prüfen, dann droppen). **Vom User noch auszuführen.** Der Code läuft schon
  ohne die Spalte, die Reihenfolge ist also unkritisch.
- **Beim Bauen gefunden:** `coffees.notes` existierte in DB und Typ, war aber in *keinem*
  Formular editierbar und wurde nirgends angezeigt — „austauschen" hieß hier also erst
  einmal, das Zielfeld überhaupt zu bauen (New + Edit + Detail-Karte).
- ✅ **Bestätigt (User 2026-08-25):** Grind Note entfällt als eigenes Feld und
  wandert vollständig ins allgemeine `notes`-Feld des Kaffees.
- Kollision mit **Paket B:** wenn Rezepte pro Bohne kommen, bekommt *jedes Rezept*
  ein eigenes `grind_hint`-Feld (siehe B). Der Kaffee-`notes`-Text bleibt davon
  unberührt und beschreibt die Bohne, nicht das Rezept.

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

**⚠ Konflikt A1 ↔ B — beim Bauen von A1 gefunden, noch zu entscheiden.**
Beide wollen den Mahlgrad vorbelegen: A1 füllt aus dem letzten Shot dieser Bohne
(live seit 2026-08-27), ein B-Rezept bringt `grind_hint` mit.
**Vorschlag: A1 gewinnt beim Prefill**, der Rezept-Grind erscheint nur als Ziel-Ghost
daneben. Begründung: ein an deiner Mühle gemessener Wert schlägt eine Röster-Angabe,
die eine fremde Mühle meint. Umgekehrt wäre der Vorschlag bei jeder zweiten Bohne
falsch und müsste von Hand korrigiert werden.

**Offen für B:** „Diesen Shot als Rezept speichern" — Button in `ShotDetail`, der aus
einem guten Shot ein benanntes Rezept macht? Billig, wenn von Anfang an mitgeplant
(Rezept-Insert aus den Shot-Werten); nachträglich teurer, weil dann Rezept-Herkunft
und Namensvergabe nachgerüstet werden müssen.

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

**✅ Rollout entschieden (2026-08-27): zweistufig.**
- **C1a — reiner Token-Umbau.** Semantische Token-Paare, `data-theme`-Schalter,
  Persistenz, `prefers-color-scheme` als Default. Ziel: **Dark bleibt pixelgleich.**
  Alle heutigen `--coffee-*` bleiben als Aliase bestehen, damit nicht 30 Dateien
  gleichzeitig brechen. Abnahme = Screenshot-Diff gegen den Stand davor: sichtbare
  Änderung in Dark ⇒ Fehler, nicht Geschmackssache.
- **C1b — Light-Feinschliff Seite für Seite**, mit `npm run shoot` pro Seite.
  Erst hier darf Optik entstehen.
- Grund für die Teilung: ein Big-Bang über 14 Seiten macht Regressionen unzuordenbar.
  Nach C1a ist jede Abweichung in Dark beweisbar ein Bug.
- Schalter sitzt in `Layout` — Sidebar (Desktop) und „⋯ More"-Panel (Mobile), dort wo
  auch Logout liegt. Eigene Settings-Seite gibt es nicht und braucht es dafür nicht.

### C2 · MacroFactor-Look übernehmen  — **M**
Was an MacroFactor optisch trägt (und was wir davon übernehmen): sehr ruhige,
flächige Karten mit viel Weißraum, kräftige Zahlen-Typo, klare Datenvisualisierung
statt Deko, dezente Akzentfarbe nur an Interaktion. Das kollidiert teilweise mit dem
heutigen „Embossed-Cockpit"-Look (Verläufe + Inset-Highlight, `cardClasses`).
→ ✅ **ENTSCHIEDEN (User 2026-08-26): Embossed bleibt — in beiden Themes.**
Der flache Gegenentwurf ist verworfen. `cardClasses` behält Verlauf + Inset-Highlight,
`docs/DESIGN.md` v3 schreibt die Embossed-Signatur für Light mit fest.

**Visualisierung:** `docs/mockups/2026-08-25-embossed-vs-flat.html` (im Browser öffnen).
Zeigt drei Varianten nebeneinander: Dark (heute live), Light naiv (Dark-Rezept 1:1 —
so *nicht*) und Light getunt (Zielpalette), dazu die Kartenrezepte im Ausschnitt und
die kontrastgeprüfte Token-Tabelle.

#### Die vier Eingriffe, die Light-Embossed tragfähig machen
Ein Emboss braucht eine Fläche, die **heller als ihre Umgebung** ist, und einen
Lichtsaum, der nach *Licht* aussieht statt nach *Farbe*. In Dark ist beides geschenkt,
in Light muss man es herstellen:
1. **Grund absenken statt Karte aufhellen** — `--coffee-bg` wird `#e6ddcf` (warmes,
   deutlich abgesenktes Beige). Der naive Fehler war Grund `#f7f4ef` + Karte `#ffffff`:
   die liegen fast aufeinander, die Wölbung hat nichts zum Abheben.
2. **Lichtsaum neutralisieren** — statt warmem Gold `rgba(233,201,135,…)` (= Gelbstich
   auf Weiß) eine harte weiße Oberkante: `inset 0 1px 0 rgba(255,255,255,.95)`.
3. **Verlauf zusammenziehen, Schatten strecken** — Helligkeitsdifferenz von ~20 % auf
   ~4 % (`#fffdfa → #f6f1e8`); Tiefe kommt aus `0 10px 20px -12px` (negativer Spread).
4. **Eingaben werden eingelassen** — Wochenleiste, Ratio-Bar, Formularfelder bekommen
   `inset 0 2px 4px` statt Abwurfschatten. Karten steigen, Eingaben sinken → der Emboss
   wird ein *System* statt Kartendekoration, und `--coffee-surface-2` ist damit definiert.

#### Farbentscheidung (User 2026-08-26): **Kontrast geht vor Gold**
`--coffee-accent` in Light ist **`#835526`** — verbindlich, keine Ausnahme für Labels.
Damit erfüllt die App in Light durchgängig WCAG AA (4.5:1) für kleinen Text. Das
Marken-Gold lebt in Light ausschließlich in `--coffee-accent-deco` (textfreie Flächen)
weiter; in Dark bleibt `#c9a35e` unverändert der Akzent.

#### Kontrast-Befund für C1 (gerechnet, nicht geschätzt)
Das Marken-Gold **überlebt Light nicht als Textfarbe**: `#c9a35e` auf Kartenfläche =
**2.33:1** (AA braucht 4.5:1 für kleinen Text wie Eyebrow und Button-Label). Auch mein
erster Vorschlag `#a8763a` fällt durch (3.89 auf Karte, 2.94 auf Grund).
→ **Zwei Akzent-Token statt einem — beschlossen:**
- `--coffee-accent` = `#835526` in Light — Text/Interaktion (6.28 auf Karte, 4.74 auf
  Grund, Button-Label `#fffaf2` darauf 6.14 — alle bestanden).
- `--coffee-accent-deco` = `#b4863c` in Light / `#c9a35e` in Dark — **nur Flächen ohne
  Text**: Balken, Ratio-Bar, Dial-Ringe. So bleiben Charts golden, nur Beschriftungen
  werden dunkler.

**Regel für C1:** Ein Token, das jemals Text oder ein Icon einfärbt, ist
`--coffee-accent`. `--coffee-accent-deco` darf **nie** auf Text landen — sonst ist die
AA-Zusage still wieder weg. Beim Reskin jede Verwendung von `coffee-accent` einmal
danach durchsehen, welche der beiden Rollen sie hat.

**Folge für `ratingHex`:** wenn Kontrast vor Farbtreue geht, gilt das auch für die
10-stufige Rating-Skala. Die hellen Gelbtöne der Mitte (`#d9a441`, `#bcae49`) sind auf
`#fffdfa` grenzwertig — Stufe 5/6 brauchen in Light eine abgedunkelte Variante, sobald
sie als Text/Zahl auftreten (Badge-Ziffern!), nicht nur als Chart-Fläche.

#### Light-Tokens (Zielwerte)
| Token | Dark (bleibt) | Light (neu) |
|---|---|---|
| `--coffee-bg` | `#1c1714` | `#e6ddcf` |
| `--coffee-surface` | `#25201b` | `#fffdfa` |
| `--coffee-surface-btm` *(neu)* | *= bg* | `#f6f1e8` |
| `--coffee-surface-2` | `#33291f` | `#dcd2c1` |
| `--coffee-accent` | `#c9a35e` | `#835526` |
| `--coffee-accent-deco` *(neu)* | `#c9a35e` | `#b4863c` |
| `--coffee-text` | `#f1e9df` | `#2a221b` |
| `--coffee-muted` | `#a89784` | `#665849` |
| `--coffee-line` | `rgba(246,239,228,.10)` | `rgba(42,34,27,.14)` |

`--coffee-surface-btm` ist neu, weil der Verlauf in Dark auf `bg` endet — in Light
braucht er einen eigenen Endpunkt, sonst ist die Differenz zu groß.
**In Light ist der 1px-Rand Pflicht**, nicht optional: die Flächenkontraste sind
niedriger, der Schatten allein trägt die Kartenkante nicht.

#### Noch offen in C1
`ratingHex` (10 Stufen für dunklen Grund gewählt — die hellen Gelbtöne der Mitte
brauchen auf Weiß eine eigene Prüfung), `intensityFill`/`intensityBadge` (Creme-Alpha
auf Dunkel → muss in Light zu dunklem Alpha invertieren), Leaflet-Tiles
(`dark_all` ↔ helles Set), die vier Animations-SVGs.

### C3 · Anpassbares Dashboard  — **M**
MacroFactor-Feature: Nutzer stellt sich die Home-Kacheln selbst zusammen.
- Widget-Registry (Ø-Flavor-Dial, Shots/Tag, Ratio, Wochen-Shots, Top-Rezept,
  letzte Brews …), Reihenfolge + Sichtbarkeit pro User.

**✅ Umfang entschieden (2026-08-27): Stufe 1 — Ein/Aus + Hoch/Runter-Pfeile.**
- Persistenz in **`localStorage`**, keine Tabelle. Kein Geräte-Sync — bewusst.
- Kein Drag&Drop. Das ist auf Mobile der teure Teil und liefert bei einem
  Ein-Personen-Dashboard kaum Mehrwert über Pfeile.
- Aufwand fällt damit von M auf **S**.
- Erweiterungspfad offen: Widget-Registry so bauen, dass Reihenfolge + Sichtbarkeit
  ein serialisierbares Objekt sind. Dann ist Drag&Drop später ein Austausch der
  Bedienung, und `dashboard_layout` (user_id PK, jsonb) ein Austausch des Speichers —
  ohne die Widgets anzufassen.

### C4 · Website auf denselben Look  *(Task 2)*  — **S–M**
`src/marketing/*` (Landing, Try, Auth) auf die neuen Tokens ziehen. Geringer Umfang,
**aber nur sinnvoll direkt nach C1/C2** — sonst driften App und Website auseinander.

---

## Paket D — Röstgrad-Feinskala + Bohnen-Visual *(Task 10)*
**Aufwand: M** · Migration nötig · Isoliert umsetzbar, **aber nach Paket C bauen**
(sonst wird die Bohnen-Grafik zweimal eingefärbt).

- **✅ Feinere Skala entschieden (2026-08-27): neue Spalte daneben.**
  `roast_level_fine numeric(4,2)` (1.00–10.00) kommt dazu, `roast_level int2` **bleibt**
  und wird beim Speichern aus dem feinen Wert gerundet. Nicht-destruktiv: Badges,
  Filter und die `RatingInput`-Eingabe laufen unverändert weiter, auch für Kaffees
  ohne feinen Wert. Schiebebalken schreibt `roast_level_fine`, das grobe Feld bleibt
  als schnelle Eingabe bestehen.
- **Bohnen-Animation im Bracket:** zwei Bohnen (Arabica / Robusta) nebeneinander;
  bei 100 % einer Sorte nur diese, bei Blend beide — Datenquelle ist
  `arabica_pct` / `robusta_pct`, die es schon gibt (`CoffeeManager.tsx:324-348`).
  Slider-Bewegung färbt die Bohne live (hell → dunkel entlang der Röstkurve) und
  schreibt gleichzeitig den feinen Röstwert.
- **✅ Bohne als Fallback-Foto entschieden (2026-08-27): Laufzeit-SVG, kein Upload.**
  Die Bohne wird bei jedem Render aus `roast_level_fine` + Sortenmix gerechnet.
  Kein Storage, kein Upload, und das Bild kann nie zum gespeicherten Röstwert
  driften. `photo_url` bleibt unberührt — ein echtes Foto gewinnt weiterhin.
  Konsequenz: die Bohne ist **kein** exportierbares Bild. Falls das später gebraucht
  wird (Teilen, Export), ist PNG-in-Storage der Nachrüstweg — kostet dann Storage-RLS.
- **Verortung (Annahme, bestätigt durch Nicht-Widerspruch):** „Bracket" = der
  Röstgrad-Block im Kaffee-Formular; die Bohne(n) stehen direkt neben dem
  Schiebebalken und färben sich live mit.
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
- **Zielhardware festgelegt (User 2026-08-25): zuerst nur Bookoo** (Themis),
  langfristig alle gängigen Hersteller. → Architektur von Anfang an als
  **Adapter-Pattern**, auch wenn erst ein Adapter existiert:
  ```
  src/lib/scales/
    types.ts          ScaleAdapter { id, name, matches(device), connect(), onWeight(cb), tare(), disconnect() }
    bookoo.ts         Bookoo Themis — GATT-Service + Frame-Parser
    mock.ts           aufgezeichnete Gewichtskurve für Tests/CI
    registry.ts       Adapter-Liste; UI fragt nie einen Hersteller direkt an
  ```
  Die App-Seite (`BrewTimer`, `NewShot`) kennt **nur** `ScaleAdapter` — ein zweiter
  Hersteller ist dann eine neue Datei, kein Umbau. Kandidaten für später:
  Acaia (Pearl/Lunar), Felicita, Timemore, Decent.
- **Protokolle sind herstellerspezifisch und teils undokumentiert** — Bookoo ist
  hier ein guter Startpunkt, weil das Frame-Format vergleichsweise offen
  dokumentiert ist. Vor dem Bau: GATT-Service/Characteristic-UUIDs und Byte-Layout
  am realen Gerät verifizieren (Chrome auf Android, `chrome://bluetooth-internals`).
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
| ✅ | **A** — Dial-in Quick Wins (4, 9) | S | **Erledigt 2026-08-27** |
| 1 | **B** — Rezepte pro Bohne (5) | M | Höchster Alltagsnutzen; **Voraussetzung für den Algorithmus** |
| 2 | **C** — Design Light/Dark + Website (1, 2) | L | Muss *vor* neuen großen UI-Flächen kommen, sonst wird alles zweimal gestylt |
| 3 | **D** — Röstgrad-Skala + Bohnen-Visual (10) | M | Baut direkt auf dem neuen Design auf |
| 4 | **E** — Dial-in-Algorithmus (7) | L | Braucht B + genug aufgezeichnete Shots |
| 5 | **H** — Schönere Karte (8) | S | Jederzeit einschiebbar, gern als Pause zwischen zwei großen Paketen |
| 6 | **G** — Native Apps (3) | XL | Eigener Meilenstein; erst wenn die App inhaltlich steht |
| 7 | **F** — Bluetooth-Waage (6) | L | Auf dem iPhone erst *nach* G überhaupt möglich |

**Paket A ist erledigt.** Als Nächstes **Paket B** —
der Baustein, an dem später der Algorithmus (E) hängt. Wer lieber optisch
startet, nimmt stattdessen C zuerst — dann aber bitte **komplett** (C1–C4), sonst
driften App und Website auseinander.

---

## Fragen an den User

### Beantwortet (2026-08-25)
- ✅ **A2 — Grind Note:** wird durch das allgemeine Notizfeld *ersetzt*.
- ✅ **F — Waage:** zuerst **Bookoo**, langfristig alle gängigen Hersteller
  → Adapter-Pattern von Beginn an.
- ✅ **C2 — Embossed vs. flach:** **Embossed**, auch in Light. Flach verworfen.
  Getunte Light-Palette + Kontrastprüfung liegen in Paket C2 vor.
- ✅ **C1 — Akzentfarbe in Light:** **`#835526`**, Kontrast geht vor Gold.
  Marken-Gold nur noch auf textfreien Flächen (`--coffee-accent-deco`).
- ✅ **C1 — Rollout:** zweistufig (C1a Token-Umbau bei pixelgleichem Dark, dann
  C1b Light-Feinschliff pro Seite).
- ✅ **C3 — Dashboard:** Stufe 1, Ein/Aus + Pfeile, `localStorage`. Kein Drag&Drop.
- ✅ **D — Röstwert:** neue Spalte `roast_level_fine`, `roast_level` bleibt.
- ✅ **D — Bohnen-Bild:** Laufzeit-SVG, kein Storage.

### Noch offen
1. **B:** „Diesen Shot als Rezept speichern" — ja oder nein? **Einziger echter
   Blocker für B**; alles andere an dem Paket kann ich entscheiden.
   (Der Prefill-Konflikt A1 ↔ B ist oben mit Vorschlag dokumentiert — Widerspruch
   nur nötig, wenn dir das Röster-Rezept wichtiger ist als dein eigener Messwert.)
2. **G:** Ist die Apple-Developer-Mitgliedschaft (99 $/Jahr) gesetzt oder soll erst
   Android/Play (25 $ einmalig) getestet werden?

Beide blockieren **Paket A nicht** — das kann jederzeit starten.


---

## Bereits bekannter Alt-Backlog (unverändert offen)
Aus `CLAUDE.md` / `docs/DESIGN.md`, hier nur zur Vollständigkeit:
- **Auth-Rest:** Passwort-Reset, E-Mail-Bestätigung, Storage-RLS + per-User-Pfade,
  später geteilter Katalog-Split. *(Storage-RLS berührt Paket D Variante 2 und G.)*
- **Mobile-Visualisierung:** 390px-Audit ist gemacht, kein akuter Mangel offen —
  wartet auf gezielte Wünsche. *(Geht in Paket C auf.)*
