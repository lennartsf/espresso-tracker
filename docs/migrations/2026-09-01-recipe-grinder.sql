-- Eigene Rezepte: Muehle + Mahlgrad als echte Felder.
--
-- Bisher gab es nur `grind_hint` als Freitext ("2.5 on the Niche"). Damit
-- laesst sich nicht rechnen: der Dial-in-Algorithmus kann einen Zielmahlgrad
-- nicht mit einer Zeichenkette vergleichen, und beim Uebernehmen eines
-- Rezepts musste man den Wert von Hand abtippen.
--
-- `grind_hint` bleibt BESTEHEN und wird nicht gedroppt. Es ist jetzt das
-- allgemeine Notizfeld des Rezepts (in der UI "Notes") — dort steht, was sich
-- nicht in Zahlen fassen laesst ("Puck vorher lockern", "mit RDT"). Ein
-- Backfill waere Raten: aus "2.5 on the Niche" liesse sich zwar eine Zahl
-- ziehen, aber welche Muehle gemeint ist, weiss nur der Nutzer. Bestehende
-- Texte bleiben deshalb unangetastet stehen und sind weiterhin sichtbar.

alter table public.coffee_recipes
  add column if not exists grinder_id uuid
    references public.grinders(id) on delete set null;

alter table public.coffee_recipes
  add column if not exists grind_setting real;

-- ON DELETE SET NULL statt CASCADE: verkauft jemand seine Muehle und loescht
-- sie aus dem Equipment, soll das Rezept bleiben. Dosis, Yield, Zeit und
-- Temperatur gelten weiter; nur der Mahlgrad verliert seinen Bezug.
--
-- Hinweis: der Index auf (coffee_id, created_at desc) reicht weiter aus —
-- ueber grinder_id wird nicht gefiltert, die Rezepte werden immer pro Bohne
-- geladen.

comment on column public.coffee_recipes.grind_setting is
  'Mahlgrad auf der Skala von grinder_id. Ohne grinder_id bedeutungslos, weil '
  'Mahlgradzahlen zwischen Muehlen nicht vergleichbar sind.';

comment on column public.coffee_recipes.grind_hint is
  'Freie Notiz zum Rezept. War bis 2026-09-01 der Mahlgrad-Hinweis als Text.';
