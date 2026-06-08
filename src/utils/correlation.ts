export interface Point { x: number; y: number }

/** Mindestzahl Datenpunkte, ab der Regressionslinie + r gezeigt werden. */
export const MIN_SHOTS_FOR_CORRELATION = 5

export function hasEnoughForCorrelation(n: number): boolean {
  return n >= MIN_SHOTS_FOR_CORRELATION
}

/** Pearson-Korrelationskoeffizient. 0 bei <2 Punkten oder Null-Varianz. */
export function pearsonR(points: Point[]): number {
  const n = points.length
  if (n < 2) return 0
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  let cov = 0, vx = 0, vy = 0
  for (const p of points) {
    const dx = p.x - mx, dy = p.y - my
    cov += dx * dy; vx += dx * dx; vy += dy * dy
  }
  if (vx === 0 || vy === 0) return 0
  return cov / Math.sqrt(vx * vy)
}

/** Lineare Regression (kleinste Quadrate). slope=0/intercept=Mittel bei Null-Varianz. */
export function linearRegression(points: Point[]): { slope: number; intercept: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: n === 1 ? points[0].y : 0 }
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  let num = 0, den = 0
  for (const p of points) {
    const dx = p.x - mx
    num += dx * (p.y - my); den += dx * dx
  }
  const slope = den === 0 ? 0 : num / den
  return { slope, intercept: my - slope * mx }
}
