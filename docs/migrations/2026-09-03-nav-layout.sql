-- Anpassbare untere Navigationsleiste, mit Geraete-Sync.
--
-- Bewusst eine SPALTE auf `dashboard_layout` und keine neue Tabelle: die
-- Tabelle haelt bereits „das UI-Layout dieses Users", ist per user_id
-- geschluesselt und hat die passende RLS-Policy. Eine zweite Tabelle mit
-- derselben Struktur waere doppelte Pflege ohne Gewinn.
--
-- Kein Datenverlust moeglich: die Spalte ist neu und nullable. Wer sie nicht
-- gesetzt hat, bekommt in der App die Standard-Reihenfolge (siehe
-- src/utils/navItems.ts) — `reconcileNav` faengt fehlende, unbekannte und
-- doppelte IDs ab.

alter table public.dashboard_layout
  add column if not exists nav_layout jsonb;

comment on column public.dashboard_layout.nav_layout is
  'Reihenfolge und Sichtbarkeit der Navigation als [{id, visible}]. NULL = '
  'Standard. Die IDs stehen in src/utils/navItems.ts und duerfen NICHT '
  'umbenannt werden — sie liegen hier auf allen Geraeten des Users.';
