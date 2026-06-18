-- Step 1 of 3 — add nullable user_id to all tables (NO RLS yet). Safe: existing
-- rows keep working (single-user reads still find them until RLS is enabled).
alter table public.shots             add column if not exists user_id uuid references auth.users(id);
alter table public.brews             add column if not exists user_id uuid references auth.users(id);
alter table public.coffees           add column if not exists user_id uuid references auth.users(id);
alter table public.roast_dates       add column if not exists user_id uuid references auth.users(id);
alter table public.grinders          add column if not exists user_id uuid references auth.users(id);
alter table public.machines          add column if not exists user_id uuid references auth.users(id);
alter table public.baskets           add column if not exists user_id uuid references auth.users(id);
alter table public.brew_devices      add column if not exists user_id uuid references auth.users(id);
alter table public.roasters          add column if not exists user_id uuid references auth.users(id);
alter table public.equipment_defaults add column if not exists user_id uuid references auth.users(id);

-- equipment_defaults PK swap to (user_id, method) happens in step 3, after backfill.
