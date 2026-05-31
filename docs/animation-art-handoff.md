# Animation Art Handoff

Ziel: schöne, technik-genaue Animationen, kostenlos. Arbeitsteilung:
- **Du / Designer:** liefern hübsche **statische** Vektor-Grafik (SVG).
- **Ich (Code):** Bewegung, Timing, Phasen, und alle **dynamischen** Schichten (Wasser, Schaum, Vortex, Gieß-Strahl, Kännchen-Pfad).

So bleibt die Technik exakt deine, die Optik wird profi, und ich muss keine Formen mehr „blind raten".

## Format-Regeln (für alle Assets)
- **Format:** SVG (aus Figma / Inkscape / freie Packs wie unDraw, SVGRepo).
- **viewBox fix** pro Asset (siehe unten) — keine festen `width/height`, nur `viewBox`.
- **Ebenen sinnvoll benennen** (Figma-Layer → werden zu Gruppen). Was sich bewegt, kommt **nicht** ins statische Asset (das mach ich).
- **Keine eingebetteten Rasterbilder**, reine Pfade/Shapes (skaliert sauber).
- **Export:** Figma → Export als SVG (Layer-Namen behalten). Inkscape → „Optimiertes SVG".

## Anker (damit meine Bewegung exakt sitzt)
Nenn mir pro Szene ein paar Koordinaten im viewBox (oder zeichne dünne Hilfslinien, die ich entferne):
- Wo ist die **Flüssigkeits-Oberfläche** (y) bei „leer" und „voll"?
- Wo ist die **Mitte** / der **Rand** (für Top-Views)?
- Wo der **Ausguss-Punkt** des Kännchens (der Gieß-Punkt)?

---

## Assets pro Animation

### V60
- **`v60-side-scene.svg`** (viewBox `0 0 240 140`): Dripper-Kegel, Rippen, Filter, Kaffeebett unten, Karaffe drunter, Tropfloch. *Statisch.* Anker: Bett-Oberkante y, Kegel-Innenkanten.
- **`v60-top-scene.svg`** (viewBox `0 0 120 132`): Dripper von oben, Rippen, Bett. *Statisch.* Anker: Mitte (cx,cy), Innenradius.
- *Ich überlagere:* Wasser-Polygon (steigt/sinkt), Gieß-Strahl, Spiral-Punkt, Bloom-Swirl, CO₂-Blasen.

### Milch
- **`milk-side-scene.svg`** (viewBox `0 0 200 150`): Kännchen-Querschnitt (Spout links, Henkel rechts), Dampflanze. *Statisch.* Anker: Innenraum-Pfad (für Milch-Clip), Milch-Oberfläche y „leer/voll", Spout-Position.
- **`milk-top-scene.svg`** (viewBox `0 0 120 132`): Milch-Oberfläche von oben (Kreis), Rand. Anker: Mitte, Lanzen-Position (außermittig).
- *Ich überlagere:* Milch-Füllung + Schaum (wächst), Vortex (dreht), Pitcher-Vertikalbewegung.

### Latte Art
- **`latte-side-scene.svg`** (viewBox `0 0 240 160`): Tasse von der Seite (Henkel), leer. *Statisch.* Anker: Tassen-Innenraum (Clip), Füllstand y „leer/voll", Rand-Positionen.
- **`pour-jug.svg`** (eigenes Asset): gekipptes Gieß-Kännchen, **Ausguss-Spitze bei lokal (0,0)**, Henkel oben. Wird von mir bewegt.
- **`latte-top-scene.svg`** (viewBox `0 0 120 132`): Tasse von oben, Crema. Anker: Mitte.
- *Ich überlagere:* Kaffee-Füllung (steigt), weiße Scheibe → Herz-Morph, Pour-Punkt, Kännchen-Pfad.

---

## Ablauf
1. Du lieferst die statischen SVGs (oder ich gebe dir ein **beschriftetes Skelett** mit richtigem viewBox + Ankern + Platzhalter-Formen, das du in Figma „hübsch machst" — IDs/Struktur behalten).
2. Ich klinke sie ein, wire Anker, animiere mit der bestehenden Engine.
3. Ich self-reviewe per Montage (`npm run shoot`) und zeige dir near-final.

## Pilot
Eine Animation zuerst, um den Handoff zu testen — dann Routine für den Rest.
