// Auth seam. The current user id is cached at module scope and kept in sync by
// AuthProvider (src/lib/AuthContext.tsx) via supabase.auth.onAuthStateChange,
// so DB hooks can read it synchronously.
let currentUserId: string | null = null

export function getCurrentUserId(): string | null {
  return currentUserId
}

export function setCurrentUserId(id: string | null): void {
  currentUserId = id
}
