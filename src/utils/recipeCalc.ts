import type { Shot } from '../types'

export interface RecipeStats {
  grindMin: number
  grindMax: number
  avgDose: number | null
  avgYield: number | null
  brewTimeMin: number | null
  brewTimeMax: number | null
  avgTemp: number | null
  avgRating: number
  shotCount: number
}

export function calcBestRecipe(shots: Shot[]): RecipeStats | null {
  const top = shots.filter(s => s.rating >= 8)
  if (top.length === 0) return null

  const avg = (arr: number[]): number | null =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  const grinds = top.map(s => s.grind_setting).sort((a, b) => a - b)
  const times = top.map(s => s.brew_time_s).filter((t): t is number => t !== null).sort((a, b) => a - b)
  const doses = top.map(s => s.dose_g).filter((d): d is number => d !== null)
  const yields = top.map(s => s.yield_g).filter((y): y is number => y !== null)
  const temps = top.map(s => s.temp_c).filter((t): t is number => t !== null)

  return {
    grindMin: grinds[0],
    grindMax: grinds[grinds.length - 1],
    avgDose: avg(doses),
    avgYield: avg(yields),
    brewTimeMin: times.length > 0 ? times[0] : null,
    brewTimeMax: times.length > 0 ? times[times.length - 1] : null,
    avgTemp: avg(temps),
    avgRating: avg(top.map(s => s.rating))!,
    shotCount: top.length,
  }
}
