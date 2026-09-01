-- Paket B: mehrere eigene Rezepte pro Bohne.
--
-- WICHTIG: das Roester-Rezept bleibt, wo es ist (coffees.rec_*). Es ist die
-- unveraenderliche Referenz von der Tuete und wird NICHT hierher migriert.
-- Eigene Rezepte leben daneben und koennen ueber `matches_roaster` auf die
-- Referenz zeigen. Deshalb kein Backfill und kein Droppen von rec_*.

create table if not exists public.coffee_recipes (
  id              uuid primary key default gen_random_uuid(),
  coffee_id       uuid not null references public.coffees(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  dose_g          real,
  yield_g         real,
  temp_c          real,
  time_s          integer,
  grind_hint      text,
  is_default      boolean not null default false,
  -- Markiert ein eigenes Rezept als deckungsgleich mit coffees.rec_*.
  -- Bewusst ein Flag und keine FK: die Referenz ist keine Zeile.
  matches_roaster boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists coffee_recipes_coffee_idx
  on public.coffee_recipes (coffee_id, created_at desc);

alter table public.coffee_recipes enable row level security;

-- Vor dem Enable pruefen, ob brachliegende permissive Policies existieren
-- (Lehre aus dem Auth-Rollout 2026-06-16):
--   select * from pg_policies where tablename = 'coffee_recipes';

drop policy if exists "own coffee recipes" on public.coffee_recipes;
create policy "own coffee recipes"
  on public.coffee_recipes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
