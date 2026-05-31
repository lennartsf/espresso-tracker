// Flowing milk-pitcher silhouette in a local frame (origin ≈ centre).
// Upright, spout integrated at the top-left. Tip at JUG_SPOUT.
// For latte the whole group is tilted/mirrored; for milk it is drawn upright.
export const JUG_BODY =
  'M15 -18 ' +
  'C18 -7 18 8 14 16 ' +     // right wall down (slight belly)
  'C12 22 -12 22 -14 16 ' +  // rounded base
  'C-18 8 -18 -7 -15 -17 ' + // left wall up toward the spout
  'C-21 -19 -26 -21 -27 -20 ' + // spout flares out (top-left)
  'C-25 -16 -20 -15 -14 -15 ' + // spout underside back to the rim
  'C-6 -16 8 -17 15 -18 Z'   // top rim across to the start

export const JUG_HANDLE = 'M15 -9 C29 -9 29 11 15 12'

export const JUG_SPOUT = { x: -27, y: -20 }

// Tilted POURING pitcher — spout tip at the origin (the lowest point, where
// milk leaves), body and handle up-and-back. Used for latte art so the spout
// is always below the handle.
export const POUR_JUG_BODY =
  'M0 0 ' +              // spout tip (pour point, lowest)
  'L6 -9 ' +             // front lip
  'C16 -15 34 -17 42 -13 ' + // top rim rising to the back
  'C48 -4 48 14 40 22 ' +    // back/right wall down
  'C30 28 14 28 8 20 ' +     // bottom
  'C4 14 1 6 0 0 Z'          // front wall back to the spout
export const POUR_JUG_HANDLE = 'M44 -7 C58 -7 58 17 44 19'
