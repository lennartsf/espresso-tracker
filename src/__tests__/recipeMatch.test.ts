import { matchesRoasterRecipe, roasterRecipeOf } from '../utils/recipeMatch'
import type { Coffee } from '../types'

const coffee = (over: Partial<Coffee> = {}): Coffee => ({
  id: 'c1', name: 'Kenya', roaster: null, roaster_id: null, origin: null,
  roast_date: null, notes: null, created_at: '', arabica_pct: null,
  robusta_pct: null, roast_level: null, roast_level_fine: null, origin_country: null,
  origin_region: null, altitude_m: null, photo_url: null,
  rec_dose_g: 18, rec_yield_g: 36, rec_temp_c: 93, rec_time_s: 28,
  ...over,
})

const recipe = (over = {}) => ({ dose_g: 18, yield_g: 36, temp_c: 93, time_s: 28, ...over })

test('identical values count as a match', () => {
  expect(matchesRoasterRecipe(recipe(), coffee())).toBe(true)
})

test('any differing value breaks the match', () => {
  expect(matchesRoasterRecipe(recipe({ dose_g: 18.5 }), coffee())).toBe(false)
  expect(matchesRoasterRecipe(recipe({ yield_g: 40 }), coffee())).toBe(false)
  expect(matchesRoasterRecipe(recipe({ temp_c: 94 }), coffee())).toBe(false)
  expect(matchesRoasterRecipe(recipe({ time_s: 30 }), coffee())).toBe(false)
})

test('floating point noise does not break the match', () => {
  // 18 und 18.0000001 sind dieselbe Dosis.
  expect(matchesRoasterRecipe(recipe({ dose_g: 18.0000001 }), coffee())).toBe(true)
})

test('a coffee without a roaster recipe can never match', () => {
  // Sonst gaelte ein leeres Rezept auf einer leeren Referenz als
  // "deckungsgleich" — inhaltlich eine Aussage ueber nichts.
  const bare = coffee({ rec_dose_g: null, rec_yield_g: null, rec_temp_c: null, rec_time_s: null })
  expect(matchesRoasterRecipe({ dose_g: null, yield_g: null, temp_c: null, time_s: null }, bare)).toBe(false)
  expect(matchesRoasterRecipe(recipe(), bare)).toBe(false)
})

test('no coffee at all is not a match', () => {
  expect(matchesRoasterRecipe(recipe(), undefined)).toBe(false)
})

test('a value set on one side only is not a match', () => {
  expect(matchesRoasterRecipe(recipe({ temp_c: null }), coffee())).toBe(false)
  expect(matchesRoasterRecipe(recipe(), coffee({ rec_temp_c: null }))).toBe(false)
})

test('a partial roaster recipe still compares on the fields it has', () => {
  const partial = coffee({ rec_temp_c: null, rec_time_s: null })
  expect(matchesRoasterRecipe(recipe({ temp_c: null, time_s: null }), partial)).toBe(true)
  expect(matchesRoasterRecipe(recipe(), partial)).toBe(false)
})

// ── roasterRecipeOf ────────────────────────────────────────────────────────

test('roasterRecipeOf exposes the reference as a recipe-shaped object', () => {
  const r = roasterRecipeOf(coffee())
  expect(r).toEqual({ name: 'Roaster recipe', dose_g: 18, yield_g: 36, temp_c: 93, time_s: 28 })
})

test('roasterRecipeOf returns null when there is no reference', () => {
  expect(roasterRecipeOf(undefined)).toBeNull()
  expect(roasterRecipeOf(coffee({
    rec_dose_g: null, rec_yield_g: null, rec_temp_c: null, rec_time_s: null,
  }))).toBeNull()
})

test('a single set value is enough to count as a roaster recipe', () => {
  const onlyDose = coffee({ rec_yield_g: null, rec_temp_c: null, rec_time_s: null })
  expect(roasterRecipeOf(onlyDose)?.dose_g).toBe(18)
})
