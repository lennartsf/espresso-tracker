# Spec: Phase 2 — Multi-User Auth + RLS (all data private)

Date: 2026-06-16
Status: approved (design), pending implementation plan

## Context & goal
The app is live and single-user: `getCurrentUserId()` returns `null`, `/app/*` is
unprotected, no table has `user_id` or RLS. Phase 2 makes it real multi-user:
each user signs up (email + password) and sees **only their own** data. Every table
is private per user. A possible future split into a shared global catalog + private
data is explicitly out of scope for now.

Decisions (user, 2026-06-16):
- **Auth method:** email + password (not magic link).
- **Scope (now):** minimal — NO email confirmation (Supabase setting off), NO
  password reset flow. Both captured as follow-up backlog.
- **Privacy:** everything private per user (all 10 tables get `user_id` + RLS).
- **Rollout:** sequenced migration on live prod (Approach A) — no data loss, no
  lockout, existing data backfilled to the owner's new account.

## Non-goals (follow-up backlog)
- Password reset ("forgot password") flow.
- Email confirmation on signup.
- Storage RLS / per-user photo paths (buckets stay public-by-URL for v1).
- Shared global catalog (roasters/coffees) + private overlay split.

## Data model
Add `user_id uuid references auth.users(id)` to all 10 tables:
`shots, brews, coffees, roast_dates, grinders, machines, baskets, brew_devices,
roasters, equipment_defaults`.

- **`equipment_defaults`**: current PK is `method` (text). Becomes composite
  PK `(user_id, method)` so each user has their own default per brew method.
- After backfill: `user_id` set `not null` with `default auth.uid()`.
- **RLS** enabled on every table; per-table policies for select/insert/update/
  delete all using `auth.uid() = user_id`.
- **Storage** (`coffee-photos`, `roaster-photos`): public bucket stays as-is for
  v1 (readable by unguessable URL). Tightening is backlog.

## Auth core
- **`src/lib/auth.ts`**: module-level cached `currentUserId`, kept in sync by a
  `supabase.auth.onAuthStateChange` subscription started at app init.
  `getCurrentUserId()` returns the cached id (keeps hooks synchronous).
- **`AuthProvider`** (new React context, e.g. `src/lib/AuthContext.tsx`): exposes
  `session`, `user`, `loading`, `signOut()`. On `onAuthStateChange` it updates the
  cached id and calls `queryClient.invalidateQueries()` (or `clear()`) so cache
  resets on login/logout/user switch. Wrap the app in `AuthProvider` in `App.tsx`.

## Login / Signup
Wire `src/marketing/auth/AuthForm.tsx` (+ `Login.tsx`/`Signup.tsx`) to:
- Login → `supabase.auth.signInWithPassword({ email, password })`
- Signup → `supabase.auth.signUp({ email, password })`
On success `navigate(ROUTES.app)`; show returned error message inline. Loading
state on submit. Keep the existing dark-premium styling.

## Route guard
- **`ProtectedRoute`** wrapping the `/app` route element: if `loading` show nothing/
  spinner; if no session redirect to `ROUTES.login`. Implemented via `AuthProvider`.
- **Logout**: button in `Layout` (desktop sidebar footer + mobile "More" panel) →
  `signOut()` → redirect to `/login`.

## Hook changes (`src/hooks/use*.ts` — the only DB boundary)
For every query hook: read `uid = getCurrentUserId()`, add `uid` to `queryKey`,
add `.eq('user_id', uid)`, and `enabled: !!uid`. For every insert mutation:
include `user_id: uid`. Files: `useShots`, `useBrews`, `useCoffees`,
`useRoasters`, `useEquipment` (grinders/machines/baskets/brew_devices +
equipment_defaults). Update/delete already key by row `id`; RLS enforces ownership
server-side regardless.

## Migration sequence (run by user in Supabase, ordered)
Files under `docs/migrations/` (date-prefixed, matching existing convention):
1. **`2026-06-16-auth-1-add-user-id.sql`** — add nullable `user_id` to all 10
   tables; rebuild `equipment_defaults` PK to `(user_id, method)`. **No RLS yet.**
2. **(manual)** user signs up in the app; fetch id:
   `select id, email from auth.users;`
3. **`2026-06-16-auth-2-backfill.sql`** — `update <table> set user_id = '<ID>'
   where user_id is null;` for all tables (user pastes their id).
4. **`2026-06-16-auth-3-enable-rls.sql`** — `alter table … enable row level security`,
   create select/insert/update/delete policies (`auth.uid() = user_id`), set
   `user_id` `not null` + `default auth.uid()`.
5. Deploy app build with guard + filters.

Supabase dashboard: turn OFF "Confirm email" (Authentication → Providers → Email).

Ordering guarantees safety: RLS is enabled **last**, after backfill and after the
owner can log in — so no row ever becomes orphaned/invisible and the owner is
never locked out.

## Testing
- Auth: signIn / signUp success + error, guard redirect when logged out
  (mock `supabase.auth`).
- Hooks: query applies `.eq('user_id', uid)` and is gated by `enabled: !!uid`.
- **Existing hook/page tests** assume data loads with no auth → they need a
  "logged-in" mock. Add a small test helper that makes `getCurrentUserId()`
  return a fake uid (and stubs `supabase.auth.getSession`). Keep all 170 tests green.
- `npm run build` clean; verify end-to-end on a deploy: signup → empty app →
  add a shot → only own data visible.

## Risks
- Live prod data: mitigated by sequenced rollout (Approach A); RLS last.
- Lockout: avoided by enabling RLS only after backfill + successful login.
- Test breakage from the auth gate: addressed by the logged-in test helper.
