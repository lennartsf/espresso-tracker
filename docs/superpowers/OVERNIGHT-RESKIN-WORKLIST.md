# Overnight Reskin Worklist (autonom)

**Auftrag (vom User, 2026-06-07 Nacht):** App-Reskin fertig bauen — Welle 2b + Welle 3 — autonom über Nacht. Best-Guess bei Design-Fragen, morgens markieren. Branch `animations-update`.

**Guardrails (HART):**
- Nur Branch `animations-update`. KEIN merge, KEIN push, KEIN deploy.
- KEINE Supabase-/DB-/RLS-/Migrations-Änderung. KEINE Logik-Änderung (nur Optik).
- Nichts Destruktives außerhalb dieses Reskins.
- Nach JEDER Seite: `npx tsc -b` + `npx vitest run` müssen grün sein + `npm run build` ok. Sonst fixen, nicht committen-und-weiter.
- Pro Seite ein Commit. Emojis raus.

**Design-System (aus Welle 1/2a, fix):**
- Tokens `coffee.*` (bg/surface/surface2/accent/accent-soft/cream/text/muted/line), `font-display` (Fraunces), `font-grotesk`.
- Primitives `src/components/ui/`: Card/cardClasses, Button/buttonClasses, Badge, RatingBadge, StatCard, PageHeader, Input, Select, Textarea, FieldLabel, InfoButton, InfoBox.
- Klassen-Mapping: bg-white→bg-coffee-surface2 | border-slate-200→border-coffee-line | text-slate-800→text-coffee-cream | text-slate-700/600→text-coffee-text | text-slate-500/400→text-coffee-muted | text-slate-300→text-coffee-muted/60 | bg-slate-50→bg-coffee-bg | bg-slate-100→bg-coffee-surface2 | bg-orange-500(btn)→buttonClasses('primary') | bg-orange-50/text-orange-700→Badge bzw. bg-coffee-accent/15 text-coffee-accent-soft | text-orange-500/600→text-coffee-accent-soft | focus:border-orange-400→entfällt (in Input) | accent-orange-500→accent-coffee-accent | rohe input/select/textarea→Input/Select/Textarea | uppercase-label→FieldLabel | i-Button+Panel→InfoButton+InfoBox | Rating-Zahl-Badge→RatingBadge | Seiten-Titel→PageHeader/Fraunces, Emoji raus | rating-Skala-Farbe (ratingColor) in Listen→ratingBadgeClasses/RatingBadge.
- Seiten-Titel-Emojis (📋📊📖📚🎬📍⚙️☕ etc.) ersatzlos raus. Karten-Icon-Emojis in guideContent/animationContent: durch nichts ersetzen (Text-Karten) ODER Lucide — Default: Emoji-Icon weglassen, Layout sauber halten; im Morning-Report markieren.
- PhotoUpload: ☕-Fallback → Lucide `Coffee` Icon; 📷-Hover → Lucide `Camera`; 📷-Avatar bg-orange-100/text-orange-600 → bg-coffee-surface2/text-coffee-muted.
- Charts (Analysis, recharts/svg): Achsen/Text coffee-muted, Linien coffee-line, Datenpunkte/Serien coffee-accent (+ ggf. zweite Serie helleres Gold/Creme). **DESIGN-FRAGE → Best-Guess, im Morning-Report markieren.**

**Pro-Seite-Protokoll:** Read ganze Datei → reskin nach Mapping (Logik unverändert) → `grep -nE "bg-white|border-slate|text-slate|bg-slate|bg-orange|text-orange|focus:border-orange|emoji"` muss leer sein → tsc+vitest+build grün → Screenshot /tmp speichern + selbst prüfen → commit `feat(reskin): <Seite> dark`.

## Queue (in Reihenfolge)
### Welle 2b
- [ ] ShotDetail.tsx (+ inline ShotEditForm) — 654 Z. Emojis: ⚙️ 🫙
- [x] BrewDetail.tsx (+ inline BrewEditForm) — DONE (Pipeline validiert)

### Welle 3
- [ ] Guide.tsx + GuideDetail.tsx (Header 📖; Karten-Icons aus guideContent)
- [ ] Glossary.tsx (Header 📚)
- [ ] Animate.tsx + AnimateDetail.tsx (Header 🎬; Karten-Icons aus animationContent; ⚙️🫙 etc. in AnimateDetail)
- [ ] Roasters.tsx (Header 📍; Karte/Leaflet — Tiles dunkel lassen, UI drumherum dark)
- [ ] CoffeeManager.tsx (Header ☕; nutzt PhotoUpload)
- [ ] Equipment.tsx (Header ⚙️)
- [ ] PhotoUpload.tsx (Emoji-Ersatz s.o.) — shared, vor/with CoffeeManager/Roasters
- [ ] Final-Sweep: `grep -rnE "bg-white|border-slate|text-slate|bg-slate|bg-orange|text-orange|<emoji>" src/pages src/components` muss leer (außer bewusst dokumentierte)

## Progress-Log
(neueste oben — jede Wake hier eintragen)
- WAKE 0 (init): BrewDetail.tsx reskinned + grün (tsc/146 Tests/build), committed. Pipeline validiert. Nächstes: ShotDetail.
- INIT 2026-06-07 Nacht: Worklist erstellt, Companion gestoppt, Dev auf 4321.

## Wenn ALLES fertig
1. Voll-Sweep grün, tsc+vitest+build grün.
2. Schreibe `docs/superpowers/MORNING-REPORT.md`: was gebaut, Commits, offene Design-Marker (v.a. Charts, Karten-Icons), Screenshot-Pfade.
3. Memory project_espresso updaten (Welle 2b+3 erledigt).
4. KEINEN weiteren Wakeup mehr planen (Loop beenden). NICHT deployen.
