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
