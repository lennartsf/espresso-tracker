-- Roaster's recommended recipe per coffee (single recipe, as printed on the bag).
-- All columns optional/nullable; existing rows default to NULL (no recipe).
-- Run in Supabase SQL editor.

alter table public.coffees
  add column if not exists rec_dose_g     real,
  add column if not exists rec_yield_g    real,
  add column if not exists rec_temp_c     real,
  add column if not exists rec_time_s     integer,
  add column if not exists rec_grind_note text;
