import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../lib/auth'
import { reconcileLayout, DEFAULT_LAYOUT } from '../utils/dashboardWidgets'
import { reconcileNav, DEFAULT_NAV } from '../utils/navItems'
import type { DashboardLayoutEntry } from '../types'

/**
 * Dashboard-Layout des Users, synchron über alle Geräte.
 *
 * Bewusst in Supabase statt `localStorage`: Mac und iPhone sollen dasselbe
 * Dashboard zeigen. Preis ist, dass Layout-Änderungen eine Verbindung brauchen
 * — sie laufen **nicht** über die Offline-Write-Queue, die nur Creates kann.
 * Ohne Verbindung greift die optimistische Änderung lokal und wird beim
 * nächsten Load vom Server überschrieben („last write wins", bewusst simpel:
 * bei einem Ein-Personen-Dashboard ist ein Merge-Konflikt kein realer Fall).
 */
export function useDashboardLayout() {
  const uid = getCurrentUserId()

  return useQuery({
    queryKey: ['dashboard-layout', uid],
    enabled: !!uid,
    queryFn: async (): Promise<DashboardLayoutEntry[]> => {
      const { data, error } = await supabase
        .from('dashboard_layout')
        .select('layout')
        .eq('user_id', uid)
        .maybeSingle()

      // `maybeSingle` liefert null statt eines Fehlers, wenn es noch keine Zeile
      // gibt — der Normalfall beim ersten Aufruf. Kein Grund für einen Fehler.
      if (error) throw error
      return reconcileLayout(data?.layout ?? DEFAULT_LAYOUT)
    },
  })
}

export function useSaveDashboardLayout() {
  const qc = useQueryClient()
  const uid = getCurrentUserId()

  return useMutation({
    mutationFn: async (layout: DashboardLayoutEntry[]) => {
      const { error } = await supabase
        .from('dashboard_layout')
        .upsert(
          { user_id: uid, layout, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
      if (error) throw error
      return layout
    },
    // Optimistisch: das Umschalten soll sofort sichtbar sein, nicht erst nach
    // dem Roundtrip. Ohne das wirkt jeder Pfeilklick träge.
    onMutate: async (layout) => {
      await qc.cancelQueries({ queryKey: ['dashboard-layout', uid] })
      const previous = qc.getQueryData<DashboardLayoutEntry[]>(['dashboard-layout', uid])
      qc.setQueryData(['dashboard-layout', uid], layout)
      return { previous }
    },
    onError: (_err, _layout, ctx) => {
      // Schlägt der Schreibvorgang fehl (offline), den vorherigen Stand
      // zurückrollen — sonst zeigt die UI ein Layout, das nirgends steht.
      if (ctx?.previous) qc.setQueryData(['dashboard-layout', uid], ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['dashboard-layout', uid] }),
  })
}


// ── Navigation ──────────────────────────────────────────────────────────────

/**
 * Reihenfolge und Sichtbarkeit der Navigation, ebenfalls über Geräte synchron.
 *
 * Liegt in derselben Zeile wie das Dashboard-Layout (Spalte `nav_layout`) —
 * beides ist „wie dieser User seine Oberfläche eingerichtet hat", beides ist
 * per `user_id` geschlüsselt, beides teilt dieselbe RLS-Policy.
 */
export function useNavLayout() {
  const uid = getCurrentUserId()

  return useQuery({
    queryKey: ['nav-layout', uid],
    enabled: !!uid,
    queryFn: async (): Promise<DashboardLayoutEntry[]> => {
      const { data, error } = await supabase
        .from('dashboard_layout')
        .select('nav_layout')
        .eq('user_id', uid)
        .maybeSingle()
      if (error) throw error
      return reconcileNav(data?.nav_layout ?? DEFAULT_NAV)
    },
    // Die Navigation rahmt JEDE Seite. Waehrend sie laedt, zeigt `Layout` den
    // Standard — ohne diesen Platzhalter wuerde die Leiste bei jedem
    // Seitenwechsel kurz leer aufblitzen.
    placeholderData: DEFAULT_NAV,
  })
}

export function useSaveNavLayout() {
  const qc = useQueryClient()
  const uid = getCurrentUserId()

  return useMutation({
    mutationFn: async (nav_layout: DashboardLayoutEntry[]) => {
      const { error } = await supabase
        .from('dashboard_layout')
        .upsert(
          { user_id: uid, nav_layout, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
      if (error) throw error
      return nav_layout
    },
    onMutate: async (nav) => {
      await qc.cancelQueries({ queryKey: ['nav-layout', uid] })
      const previous = qc.getQueryData<DashboardLayoutEntry[]>(['nav-layout', uid])
      qc.setQueryData(['nav-layout', uid], nav)
      return { previous }
    },
    onError: (_err, _nav, ctx) => {
      if (ctx?.previous) qc.setQueryData(['nav-layout', uid], ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['nav-layout', uid] }),
  })
}
