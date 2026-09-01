import { useState } from 'react'
import { BookmarkPlus, Check } from 'lucide-react'
import { Input, FieldLabel, buttonClasses } from './ui'
import { useCoffees } from '../hooks/useCoffees'
import { useCreateCoffeeRecipe } from '../hooks/useCoffeeRecipes'
import type { NewCoffeeRecipe } from '../types'
import type { ShotWithCoffee } from '../hooks/useShots'

/**
 * „Diesen Shot als Rezept sichern."
 *
 * Der übliche Weg zu einem Rezept führt über einen gelungenen Shot: man merkt
 * beim Trinken, dass es gepasst hat, und will genau diese Zahlen behalten.
 * Sie danach von Hand in ein leeres Formular abzutippen, ist die Stelle, an
 * der Rezepte nicht entstehen — und ein Tippfehler wäre still.
 *
 * Übernommen werden **Einstellungen und Ergebnis gemeinsam**: Dosis,
 * Temperatur und Mahlgrad sind das, was man einstellt; Yield und Zeit sind
 * das, was dabei herauskam — als Ziel für das nächste Mal ist beides richtig.
 * Bewertungen und Notizen wandern NICHT mit: sie beschreiben diesen einen
 * Bezug, nicht die Vorschrift.
 *
 * `matches_roaster` wird nicht hier gesetzt — das rechnet der Hook beim
 * Speichern aus, damit das Badge nicht lügen kann.
 */
export function SaveShotAsRecipe({ shot }: { shot: ShotWithCoffee }) {
  const createRecipe = useCreateCoffeeRecipe()
  const { data: coffees = [] } = useCoffees()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  const coffee = coffees.find(c => c.id === shot.coffee_id)

  async function save() {
    if (!name.trim()) return
    const recipe: NewCoffeeRecipe = {
      coffee_id: shot.coffee_id,
      name: name.trim(),
      dose_g: shot.dose_g,
      yield_g: shot.yield_g,
      temp_c: shot.temp_c,
      time_s: shot.brew_time_s,
      grinder_id: shot.grinder_id,
      // Der Mahlgrad ergibt nur zusammen mit der Mühle Sinn. Ohne verknüpfte
      // Mühle wäre die Zahl später nicht auf eine Skala zu beziehen.
      grind_setting: shot.grinder_id ? shot.grind_setting : null,
      grind_hint: null,
      is_default: false,
      matches_roaster: false,
    }
    await createRecipe.mutateAsync({ recipe, coffee })
    setSaved(true)
    setOpen(false)
    setName('')
  }

  if (saved) {
    return (
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-coffee-accent-soft">
        <Check size={15} /> Saved to this coffee's recipes.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          // Vorschlag statt leerem Feld — der haeufigste Name ist ohnehin das
          // Datum, an dem es geklappt hat.
          setName(`${new Date(shot.pulled_at).toLocaleDateString('en-GB')} dial-in`)
          setOpen(true)
        }}
        className={buttonClasses('secondary', 'mt-3 w-full')}
      >
        <BookmarkPlus size={15} /> Save as recipe
      </button>
    )
  }

  return (
    <div className="mt-3 rounded-lg border-2 border-coffee-field bg-coffee-surface2 p-3">
      <FieldLabel required>Recipe name</FieldLabel>
      <Input
        autoFocus value={name}
        onChange={e => setName(e.target.value)}
        placeholder="My standard"
      />
      <p className="mt-2 text-xs text-coffee-muted">
        Takes over{' '}
        {[
          shot.dose_g != null && shot.yield_g != null && `${shot.dose_g}→${shot.yield_g} g`,
          shot.brew_time_s != null && `${shot.brew_time_s}s`,
          shot.temp_c != null && `${shot.temp_c} °C`,
          shot.grinder_id && shot.grind_setting != null &&
            `grind ${shot.grind_setting} on ${shot.grinders?.name ?? 'this grinder'}`,
        ].filter(Boolean).join(' · ') || 'no values — this shot has none recorded'}.
        Ratings and notes stay with the shot.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button" onClick={save}
          disabled={!name.trim() || createRecipe.isPending}
          className={buttonClasses('primary', 'flex-1 disabled:opacity-50')}
        >
          {createRecipe.isPending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={buttonClasses('secondary')}>
          Cancel
        </button>
      </div>
    </div>
  )
}
