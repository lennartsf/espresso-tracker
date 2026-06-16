-- Step 2 of 3 — assign all existing rows to the owner's account.
-- First sign up in the app, then get your id:  select id, email from auth.users;
-- Replace YOUR_USER_ID below with that uuid, then run.
update public.shots             set user_id = 'YOUR_USER_ID' where user_id is null;
update public.brews             set user_id = 'YOUR_USER_ID' where user_id is null;
update public.coffees           set user_id = 'YOUR_USER_ID' where user_id is null;
update public.roast_dates       set user_id = 'YOUR_USER_ID' where user_id is null;
update public.grinders          set user_id = 'YOUR_USER_ID' where user_id is null;
update public.machines          set user_id = 'YOUR_USER_ID' where user_id is null;
update public.baskets           set user_id = 'YOUR_USER_ID' where user_id is null;
update public.brew_devices      set user_id = 'YOUR_USER_ID' where user_id is null;
update public.roasters          set user_id = 'YOUR_USER_ID' where user_id is null;
update public.equipment_defaults set user_id = 'YOUR_USER_ID' where user_id is null;
