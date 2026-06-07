// Auth-/Multi-User-Naht.
//
// Phase 0 (jetzt): App ist Single-User, KEIN echtes Auth. Gibt immer null zurück.
//
// Phase 2 (Multi-User): Hier kommt der echte Supabase-Auth-User rein
// (supabase.auth.getUser()). Dann ergänzt jeder DB-Query in den react-query-
// Hooks (src/hooks/use*.ts) `.eq('user_id', uid)` — die Hooks sind die einzige
// DB-Grenze. Zusätzlich brauchen alle Tabellen user_id-Spalten + RLS-Policies,
// sonst kann jeder eingeloggte Nutzer fremde Daten lesen/ändern.
export function getCurrentUserId(): string | null {
  return null
}
