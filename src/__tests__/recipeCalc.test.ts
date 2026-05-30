import { calcBestRecipe } from '../utils/recipeCalc'
import type { Shot } from '../types'

const makeShot = (overrides: Partial<Shot>): Shot => ({
  id: '1',
  coffee_id: 'c1',
  roast_date_id: null,
  grind_setting: 12,
  dose_g: 18,
  yield_g: 36,
  brew_time_s: 28,
  temp_c: 93,
  rating: 8,
  body_score: null,
  acidity_score: null,
  bitterness_score: null,
  brew_ratio: null,
  pressure_bar: null,
  tasting_notes: null,
  used_rdt: false,
  used_wdt: false,
  used_leveler: false,
  grinder_id: null,
  machine_id: null,
  basket_id: null,
  drink_type: 'espresso',
  milk_type: null,
  milk_ml: null,
  pulled_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
})

describe('calcBestRecipe', () => {
  test('returns null when no shots have rating >= 8', () => {
    const shots = [makeShot({ rating: 5 }), makeShot({ rating: 7 })]
    expect(calcBestRecipe(shots)).toBeNull()
  })

  test('returns null for empty array', () => {
    expect(calcBestRecipe([])).toBeNull()
  })

  test('returns grind range from top-rated shots', () => {
    const shots = [
      makeShot({ rating: 9, grind_setting: 11 }),
      makeShot({ rating: 8, grind_setting: 13 }),
      makeShot({ rating: 5, grind_setting: 8 }),
    ]
    const result = calcBestRecipe(shots)!
    expect(result.grindMin).toBe(11)
    expect(result.grindMax).toBe(13)
  })

  test('includes only shots with rating >= 8 in shotCount', () => {
    const shots = [
      makeShot({ rating: 9 }),
      makeShot({ rating: 8 }),
      makeShot({ rating: 6 }),
    ]
    expect(calcBestRecipe(shots)!.shotCount).toBe(2)
  })

  test('averages dose and yield from top shots', () => {
    const shots = [
      makeShot({ rating: 9, dose_g: 18, yield_g: 36 }),
      makeShot({ rating: 8, dose_g: 18, yield_g: 38 }),
    ]
    const result = calcBestRecipe(shots)!
    expect(result.avgDose).toBe(18)
    expect(result.avgYield).toBe(37)
  })

  test('handles null optional fields gracefully', () => {
    const shots = [makeShot({ rating: 9, dose_g: null, yield_g: null, brew_time_s: null, temp_c: null })]
    const result = calcBestRecipe(shots)!
    expect(result.avgDose).toBeNull()
    expect(result.avgYield).toBeNull()
    expect(result.brewTimeMin).toBeNull()
    expect(result.avgTemp).toBeNull()
  })
})
