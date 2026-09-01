-- Paket D: feinere Roestgrad-Skala.
--
-- Nicht-destruktiv: die bestehende Spalte roast_level (int2, 1-10) BLEIBT und
-- wird beim Speichern aus dem feinen Wert gerundet. Badges, Filter und die
-- RatingInput-Eingabe laufen dadurch unveraendert weiter, auch fuer Kaffees
-- ohne feinen Wert.

alter table public.coffees
  add column if not exists roast_level_fine numeric(4,2);

-- Bestehende Kaffees bekommen den groben Wert als Startpunkt, damit der
-- Schieberegler nicht bei 1 steht, wenn schon ein Roestgrad erfasst ist.
update public.coffees
set roast_level_fine = roast_level
where roast_level is not null
  and roast_level_fine is null;
