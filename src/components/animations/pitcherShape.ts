// Flowing milk-pitcher silhouette in a local frame. The spout is part of the
// body outline (not a bolted-on triangle). Spout tip sits at JUG_SPOUT.
// Origin (0,0) is roughly the jug's center.
export const JUG_BODY =
  'M-20 -16 ' +
  'C-26 -19 -29 -16 -25 -10 ' +   // spout flares out from the top-left rim
  'C-22 -4 -21 8 -20 14 ' +       // front (left) wall down
  'C-19 21 -13 23 -5 23 ' +       // bottom-left curve
  'L7 23 ' +                       // base
  'C15 23 19 20 19 12 ' +          // bottom-right curve
  'C20 0 20 -10 19 -16 ' +         // back (right) wall up
  'C18 -21 -12 -22 -20 -16 Z'      // top rim back into the spout

export const JUG_HANDLE = 'M19 -8 C33 -8 33 14 19 15'

export const JUG_SPOUT = { x: -27, y: -14 }
