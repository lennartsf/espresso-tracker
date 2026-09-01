import type { Coffee } from '../types'

/** Die vier Werte, die ein Rezept mit der Röster-Vorgabe vergleichbar machen.
 *  `grind_hint` zählt bewusst NICHT mit: die Röster-Angabe meint eine fremde
 *  Mühle, ein Vergleich wäre bedeutungslos. */
export interface ComparableRecipe {
  dose_g: number | null
  yield_g: number | null
  temp_c: number | null
  time_s: number | null
}

/** Zwei Werte gelten als gleich, wenn beide fehlen oder beide (auf 0.1 genau)
 *  denselben Betrag haben. Die Toleranz fängt Fließkomma-Rauschen ab —
 *  18 und 18.0000001 sind dieselbe Dosis. */
function same(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return Math.abs(a - b) < 0.05
}

/**
 * Deckt sich das Rezept mit der Röster-Vorgabe des Kaffees?
 *
 * Wird bei jedem Speichern neu ausgewertet, damit das Badge „= Röster-Rezept"
 * nicht lügt, sobald jemand danach die Dosis verstellt.
 *
 * Ein Kaffee **ohne** Röster-Vorgabe kann nie eine Übereinstimmung haben —
 * sonst würde ein leeres Rezept auf einer leeren Referenz als „deckungsgleich"
 * gelten, was inhaltlich nichts aussagt.
 */
export function matchesRoasterRecipe(recipe: ComparableRecipe, coffee?: Coffee): boolean {
  if (!coffee) return false

  const hasRoasterRecipe =
    coffee.rec_dose_g != null || coffee.rec_yield_g != null ||
    coffee.rec_temp_c != null || coffee.rec_time_s != null
  if (!hasRoasterRecipe) return false

  return (
    same(recipe.dose_g, coffee.rec_dose_g) &&
    same(recipe.yield_g, coffee.rec_yield_g) &&
    same(recipe.temp_c, coffee.rec_temp_c) &&
    same(recipe.time_s, coffee.rec_time_s)
  )
}

/** Das Röster-Rezept als Rezept-förmiges Objekt — damit Picker und
 *  Ziel-Anzeige es wie jedes andere behandeln können. `null`, wenn der Kaffee
 *  keine Vorgabe hat. */
export function roasterRecipeOf(coffee?: Coffee): (ComparableRecipe & { name: string }) | null {
  if (!coffee) return null
  const has =
    coffee.rec_dose_g != null || coffee.rec_yield_g != null ||
    coffee.rec_temp_c != null || coffee.rec_time_s != null
  if (!has) return null
  return {
    name: 'Roaster recipe',
    dose_g: coffee.rec_dose_g,
    yield_g: coffee.rec_yield_g,
    temp_c: coffee.rec_temp_c,
    time_s: coffee.rec_time_s,
  }
}
