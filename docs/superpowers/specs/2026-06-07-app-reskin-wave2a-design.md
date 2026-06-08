# App-Reskin Welle 2a — Create-Forms + Form-Primitives

## Context
Fortsetzung des App-Reskins (Dark Premium). Welle 1 lieferte das Fundament + Shell + Dashboard +
Cards. **Welle 2** = Formulare; wegen Umfang (~2000 Zeilen) gesplittet in **2a** (Create-Forms +
Form-Primitives + geteilte Form-Komponenten) und **2b** (Detail/Edit-Seiten, eigener Spec).

Diese Spec = **Welle 2a**. Baut auf den vorhandenen ui-Primitives (`src/components/ui/`:
Card/Button/Badge/RatingBadge/StatCard/PageHeader, `buttonClasses`, `cardClasses`) und Tokens
(`coffee.*`, `font-display`/`font-grotesk`) aus Welle 1 auf.

Form-Look im Brainstorm visuell bestätigt: Felder recessed (dunkler als Panel) mit Gold-Fokusring,
Rating-Buttons gold-aktiv, Info-Box mit Gold-i-Button, Ratio-Bar mit Gold-Verlauf, Primär-Button Gold.

## Scope Welle 2a
**Drin:**
- Neue Form-Primitives `src/components/ui/`: `Input`, `Select`, `Textarea`, `FieldLabel`, `InfoBox`, `InfoButton`
- Reskin geteilte Form-Komponenten: `RatingInput` (Gold-Akzent), `BrewTimer` (dark), `BrewRatioBar` (Gold-Verlauf)
- Reskin Seiten: `NewShot`, `NewBrew`
- `PageHeader` (Welle 1) für die Seiten-Titel

**Nicht drin:** `ShotDetail`/`BrewDetail` (+ deren Edit-Forms) → **Welle 2b**. `PhotoUpload` + dessen
☕/📷 → Welle 3 (wird nur von Coffee/Roaster-Seiten genutzt, nicht von NewShot/NewBrew). Content-Seiten → Welle 3.

## Form-Primitives (`src/components/ui/`)
Kapseln die Dark-Form-Klassen, damit die ~400 Klassen-Stellen konsistent statt von Hand:
- **`FieldLabel`** — `props: children, htmlFor?, required?`. Uppercase, `text-coffee-muted`, kleiner Tracking; bei `required` ein `*`.
- **`Input`** — `<input>`-Wrapper, alle native Props durchgereicht. Klassen: recessed `bg-coffee-bg border border-coffee-line rounded-lg text-coffee-text px-3 py-2.5 placeholder:text-coffee-muted/60 focus:border-coffee-accent focus:ring-2 focus:ring-coffee-accent/20 focus:outline-none w-full`.
- **`Select`** — wie Input, plus `appearance-none` + Gold-Chevron-Hintergrund-SVG. Children = `<option>`s durchgereicht.
- **`Textarea`** — wie Input für `<textarea>`.
- **`InfoButton`** — der runde „i"-Toggle. `props: open, onClick`. Offen = `bg-coffee-accent text-coffee-bg`, zu = `bg-coffee-surface2 text-coffee-muted`.
- **`InfoBox`** — das aufklappbare Erklär-Panel. `props: children`. `bg-coffee-surface2 border border-coffee-accent/30 rounded-lg p-3 text-xs text-coffee-cream/80`. (Die 1→10-Skala-Darstellung bleibt seitenspezifisch im jeweiligen `RatingField`, nutzt aber `InfoBox` als Hülle.)

Barrel `src/components/ui/index.ts` um diese erweitern. Native-Prop-Typen via `InputHTMLAttributes`/`SelectHTMLAttributes`/`TextareaHTMLAttributes`/`LabelHTMLAttributes`.

## Geteilte Komponenten-Reskins
- **`RatingInput`** — selektiert `bg-coffee-accent text-coffee-bg` (statt `bg-orange-500 text-white`); unselektiert `bg-coffee-surface2 text-coffee-muted hover:bg-coffee-surface`. **Test anpassen:** `RatingInput.test` erwartet `bg-orange-500` → auf `bg-coffee-accent` ändern.
- **`BrewTimer`** — Zeit-Text `text-coffee-cream`; Start-Button `bg-coffee-surface2 text-coffee-cream`, Stop-Button `bg-coffee-accent text-coffee-bg`, Reset `bg-coffee-surface2 text-coffee-muted`. Symbole ▶/■/↺ bleiben (keine Emojis).
- **`BrewRatioBar`** — Dose-Segment `bg-coffee-accent/30`, Yield-Segment `bg-coffee-accent` (statt orange); Track-Hintergrund `bg-coffee-bg`; Texte `text-coffee-muted`, Ratio-Wert `text-coffee-accent-soft`.

## Seiten-Reskins (NewShot, NewBrew)
- Seiten-Titel über `PageHeader` (kein Emoji).
- Alle `<input>/<select>/<textarea>` → `Input`/`Select`/`Textarea`. Labels → `FieldLabel`.
- i-Button-Erklär-Muster (`RATING_INFO`/`RatingField`) → `InfoButton` + `InfoBox` (1→10-Skala-Inhalt bleibt, nur Hülle/Optik dunkel).
- Buttons (Save/Submit/Sekundär) → `buttonClasses`/`Button`.
- Container-Panels (Karten/Sektionen) → `Card`/`cardClasses` bzw. Token-Klassen; alle `bg-white`/`border-slate-*`/`text-slate-*` → `coffee.*`.
- Funktionsfarben/-logik unverändert (Validierung, Vorauswahl-`useRef`-Guard, Brew-Ratio-Berechnung).

## Interim-Strategie
Wie Welle 1: alles auf Branch `animations-update`, kein Deploy bis alle Wellen konsistent.
ShotDetail/BrewDetail (2b) + Content-Seiten (3) bleiben in der Übergangszeit lokal hell/Emoji — egal, nicht live.

## Testing
- Neue Primitives: Render-Tests (`Input`/`Select`/`Textarea` reichen Props durch + Klassen; `FieldLabel` zeigt `*` bei required; `InfoButton` open-State; `InfoBox` rendert Kinder).
- `RatingInput.test`: Assert auf `bg-coffee-accent` aktualisieren.
- Alle bestehenden Tests grün halten (aktuell 141). NewShot/NewBrew haben keine eigenen Render-Tests → primär per Typecheck + Screenshot abgesichert.
- `matchMedia`-Polyfill deckt GSAP ab (bereits vorhanden).

## Verification
1. `npx tsc -b` fehlerfrei.
2. `npx vitest run` — alle grün (≥141).
3. `npm run dev` → `/app/shots/new` + `/app/brews/new`: dunkle Formulare, recessed Felder mit Gold-Fokus, Rating-Buttons gold-aktiv, Info-Boxen dark, Ratio-Bar gold, kein Emoji, Save-Button gold. Funktioniert (Anlegen testen lokal).
4. Selbst-Review per Playwright-Screenshots (beide New-Seiten, Desktop + Mobile).
5. `npm run build` erfolgreich.
6. Nicht deployen (Branch only).

## Out of Scope
ShotDetail/BrewDetail + Edit-Forms (2b), PhotoUpload + Content-Seiten + restliche Emojis (Welle 3),
Demo-Sandbox (Subprojekt C), Marketing-Content (B), Auth/RLS (Phase 2).
