import { Input, Textarea, FieldLabel } from './ui'
import type { Coffee } from '../types'

/** Draft state for the roaster's recommended recipe (strings for inputs). */
export interface RecipeDraft {
  dose: string
  yield: string
  temp: string
  time: string
  grind: string
}

export function initialRecipe(coffee?: Coffee): RecipeDraft {
  return {
    dose: coffee?.rec_dose_g != null ? String(coffee.rec_dose_g) : '',
    yield: coffee?.rec_yield_g != null ? String(coffee.rec_yield_g) : '',
    temp: coffee?.rec_temp_c != null ? String(coffee.rec_temp_c) : '',
    time: coffee?.rec_time_s != null ? String(coffee.rec_time_s) : '',
    grind: coffee?.rec_grind_note ?? '',
  }
}

/** Map the draft to the nullable DB columns. */
export function recipePayload(d: RecipeDraft) {
  const num = (s: string) => (s.trim() ? parseFloat(s) : null)
  const int = (s: string) => (s.trim() ? parseInt(s, 10) : null)
  return {
    rec_dose_g: num(d.dose),
    rec_yield_g: num(d.yield),
    rec_temp_c: num(d.temp),
    rec_time_s: int(d.time),
    rec_grind_note: d.grind.trim() || null,
  }
}

export function RoasterRecipeFields({
  value,
  onChange,
}: {
  value: RecipeDraft
  onChange: (next: RecipeDraft) => void
}) {
  const set = (k: keyof RecipeDraft) => (e: { target: { value: string } }) =>
    onChange({ ...value, [k]: e.target.value })

  return (
    <div>
      <p className="text-xs font-semibold text-coffee-muted uppercase mb-2">Roaster Recipe (optional)</p>
      <p className="text-xs text-coffee-muted/70 mb-3">As recommended on the bag — used as a reference and prefill for new shots.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Dose (g)</FieldLabel>
          <Input type="number" step="0.1" value={value.dose} onChange={set('dose')} placeholder="18" />
        </div>
        <div>
          <FieldLabel>Yield (g)</FieldLabel>
          <Input type="number" step="0.1" value={value.yield} onChange={set('yield')} placeholder="36" />
        </div>
        <div>
          <FieldLabel>Temp (°C)</FieldLabel>
          <Input type="number" value={value.temp} onChange={set('temp')} placeholder="93" />
        </div>
        <div>
          <FieldLabel>Time (s)</FieldLabel>
          <Input type="number" value={value.time} onChange={set('time')} placeholder="28" />
        </div>
      </div>
      <div className="mt-3">
        <FieldLabel>Grind note</FieldLabel>
        <Textarea rows={2} value={value.grind} onChange={set('grind')} placeholder="e.g. medium-fine, 2.5 on EK43" />
      </div>
    </div>
  )
}
