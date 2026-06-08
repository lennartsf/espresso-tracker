export function ratingColor(v: number): string {
  const map: Record<number, string> = {
    1:  'bg-red-100 text-red-900',
    2:  'bg-red-200 text-red-800',
    3:  'bg-orange-100 text-orange-900',
    4:  'bg-orange-200 text-orange-900',
    5:  'bg-amber-200 text-amber-900',
    6:  'bg-yellow-100 text-yellow-900',
    7:  'bg-lime-100 text-lime-900',
    8:  'bg-green-100 text-green-900',
    9:  'bg-green-200 text-green-900',
    10: 'bg-green-300 text-green-900',
  }
  return map[v] ?? 'bg-slate-100 text-slate-500'
}

/** Gefüllte Dark-Klassen fürs Rating-Badge (Funktionsfarbe, für dunklen Grund). */
export function ratingBadgeClasses(v: number): string {
  if (v >= 8 && v <= 10) return 'bg-green-600/90 text-green-50 ring-1 ring-green-400/40 shadow-lg shadow-green-900/30'
  if (v >= 6) return 'bg-lime-600/90 text-lime-50 ring-1 ring-lime-400/40 shadow-lg shadow-lime-900/30'
  if (v >= 4) return 'bg-amber-600/90 text-amber-50 ring-1 ring-amber-400/40 shadow-lg shadow-amber-900/30'
  if (v >= 1) return 'bg-red-600/90 text-red-50 ring-1 ring-red-400/40 shadow-lg shadow-red-900/30'
  return 'bg-coffee-surface2 text-coffee-muted ring-1 ring-coffee-line'
}
