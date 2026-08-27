-- Paket A2: "Grind Note" verschwindet als eigenes Feld; ihr Inhalt lebt ab jetzt
-- im allgemeinen Notizfeld des Kaffees (coffees.notes).
--
-- Reihenfolge ist unkritisch: der App-Code liest und schreibt rec_grind_note
-- bereits nicht mehr. Trotzdem in ZWEI Schritten ausfuehren und zwischendurch
-- das Ergebnis pruefen — Schritt 2 ist nicht umkehrbar.
--
-- Run in Supabase SQL editor.

-- ── Schritt 1: Inhalte zusammenfuehren ────────────────────────────────────
-- Vorhandene Notizen bleiben erhalten, die Grind Note wird mit Praefix
-- angehaengt. Nur Zeilen anfassen, die ueberhaupt eine Grind Note haben.
update public.coffees
set notes = case
  when notes is null or btrim(notes) = ''
    then 'Grind: ' || btrim(rec_grind_note)
  else btrim(notes) || E'\n\nGrind: ' || btrim(rec_grind_note)
end
where rec_grind_note is not null
  and btrim(rec_grind_note) <> '';

-- ── Kontrolle vor Schritt 2 ───────────────────────────────────────────────
-- Muss 0 Zeilen liefern (jede Grind Note ist in notes angekommen):
--
--   select id, name, rec_grind_note, notes
--   from public.coffees
--   where rec_grind_note is not null
--     and btrim(rec_grind_note) <> ''
--     and notes not like '%' || btrim(rec_grind_note) || '%';
--
-- Erst wenn das leer ist, Schritt 2 ausfuehren.

-- ── Schritt 2: Spalte entfernen (NICHT umkehrbar) ─────────────────────────
alter table public.coffees
  drop column if exists rec_grind_note;
