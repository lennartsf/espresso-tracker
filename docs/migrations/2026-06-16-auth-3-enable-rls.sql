-- Step 3 of 3 — lock down. Run AFTER backfill and AFTER you can log in.
-- equipment_defaults: swap PK to (user_id, method).
alter table public.equipment_defaults drop constraint if exists equipment_defaults_pkey;
alter table public.equipment_defaults add primary key (user_id, method);

-- For every table: user_id NOT NULL + default auth.uid(), enable RLS, owner-only policy.
do $$
declare t text;
begin
  foreach t in array array[
    'shots','brews','coffees','roast_dates','grinders','machines',
    'baskets','brew_devices','roasters','equipment_defaults'
  ] loop
    execute format('alter table public.%I alter column user_id set not null;', t);
    execute format('alter table public.%I alter column user_id set default auth.uid();', t);
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy %1$I on public.%1$I for all to authenticated
      using (auth.uid() = user_id) with check (auth.uid() = user_id);$p$, t);
  end loop;
end $$;
