-- Paket C3: anpassbares Dashboard mit Geraete-Sync.
-- Eine Zeile pro User, Layout als jsonb. Kein Verlust moeglich: die Tabelle ist
-- neu, bestehende Daten werden nicht angefasst.
--
-- Run in Supabase SQL editor.

create table if not exists public.dashboard_layout (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  layout     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dashboard_layout enable row level security;

-- WICHTIG (Lehre aus dem Auth-Rollout 2026-06-16): beim RLS-Enable immer
-- pg_policies auf brachliegende permissive Policies pruefen. Eine alte
-- "Public access"-Policy wuerde hier allen Vollzugriff geben.
--   select * from pg_policies where tablename = 'dashboard_layout';

drop policy if exists "own dashboard layout" on public.dashboard_layout;
create policy "own dashboard layout"
  on public.dashboard_layout
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
