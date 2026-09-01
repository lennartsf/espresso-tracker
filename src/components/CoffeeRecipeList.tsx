import { useState } from 'react'
import { Trash2, Pencil, Plus } from 'lucide-react'
import { cardClasses, Badge, Input, FieldLabel, buttonClasses } from './ui'
import {
  useCoffeeRecipes, useCreateCoffeeRecipe, useUpdateCoffeeRecipe, useDeleteCoffeeRecipe,
} from '../hooks/useCoffeeRecipes'
import { matchesRoasterRecipe } from '../utils/recipeMatch'
import type { Coffee, CoffeeRecipe, NewCoffeeRecipe } from '../types'

const EMPTY = (coffeeId: string): NewCoffeeRecipe => ({
  coffee_id: coffeeId,
  name: '',
  dose_g: null,
  yield_g: null,
  temp_c: null,
  time_s: null,
  grind_hint: null,
  is_default: false,
  matches_roaster: false,
})

const num = (s: string) => (s.trim() ? parseFloat(s) : null)
const int = (s: string) => (s.trim() ? parseInt(s, 10) : null)

/** Eigene Rezepte einer Bohne. Das Röster-Rezept steht bewusst NICHT hier —
 *  es hat einen eigenen Block und bleibt unveränderliche Referenz. */
export function CoffeeRecipeList({ coffee }: { coffee: Coffee }) {
  const { data: recipes = [] } = useCoffeeRecipes(coffee.id)
  const createRecipe = useCreateCoffeeRecipe()
  const updateRecipe = useUpdateCoffeeRecipe()
  const deleteRecipe = useDeleteCoffeeRecipe()

  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<NewCoffeeRecipe>(EMPTY(coffee.id))

  function startNew() {
    setDraft(EMPTY(coffee.id))
    setEditing('new')
  }

  function startEdit(r: CoffeeRecipe) {
    setDraft({
      coffee_id: r.coffee_id, name: r.name, dose_g: r.dose_g, yield_g: r.yield_g,
      temp_c: r.temp_c, time_s: r.time_s, grind_hint: r.grind_hint,
      is_default: r.is_default, matches_roaster: r.matches_roaster,
    })
    setEditing(r.id)
  }

  async function save() {
    if (!draft.name.trim()) return
    if (editing === 'new') await createRecipe.mutateAsync({ recipe: draft, coffee })
    else if (editing) await updateRecipe.mutateAsync({ id: editing, recipe: draft, coffee })
    setEditing(null)
  }

  // Vorschau: zeigt schon beim Tippen, ob das Rezept der Röster-Vorgabe
  // entspricht — sonst überrascht das Badge nach dem Speichern.
  const draftMatches = matchesRoasterRecipe(draft, coffee)

  return (
    <div className={`${cardClasses} mb-3 p-3`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-coffee-muted">My Recipes</p>
        {editing === null && (
          <button
            type="button"
            onClick={startNew}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-coffee-accent-soft hover:bg-coffee-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
          >
            <Plus size={14} /> New
          </button>
        )}
      </div>

      {recipes.length === 0 && editing === null && (
        <p className="py-2 text-sm text-coffee-muted">
          No own recipes yet. The roaster's numbers stay above as a reference.
        </p>
      )}

      <div className="grid gap-2">
        {recipes.map(r => (
          <div key={r.id} className="rounded-lg border border-coffee-line bg-coffee-surface2 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-coffee-cream">{r.name}</span>
              {r.matches_roaster && <Badge>= Roaster</Badge>}
              <button
                type="button" aria-label={`Edit ${r.name}`} onClick={() => startEdit(r)}
                className="rounded-md p-1.5 text-coffee-muted hover:text-coffee-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
              ><Pencil size={14} /></button>
              <button
                type="button" aria-label={`Delete ${r.name}`} onClick={() => deleteRecipe.mutate(r.id)}
                className="rounded-md p-1.5 text-coffee-muted hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
              ><Trash2 size={14} /></button>
            </div>
            <p className="mt-0.5 text-xs text-coffee-muted">
              {[
                r.dose_g != null && r.yield_g != null && `${r.dose_g}→${r.yield_g} g`,
                r.time_s != null && `${r.time_s}s`,
                r.temp_c != null && `${r.temp_c} °C`,
                r.grind_hint,
              ].filter(Boolean).join(' · ') || 'No values set'}
            </p>
          </div>
        ))}
      </div>

      {editing !== null && (
        <div className="mt-3 grid gap-3 rounded-lg border border-coffee-accent/30 p-3">
          <div>
            <FieldLabel required>Recipe name</FieldLabel>
            <Input
              autoFocus value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              placeholder="My standard"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Dose (g)</FieldLabel>
              <Input type="number" step="0.1" value={draft.dose_g ?? ''} placeholder="18"
                onChange={e => setDraft({ ...draft, dose_g: num(e.target.value) })} />
            </div>
            <div>
              <FieldLabel>Yield (g)</FieldLabel>
              <Input type="number" step="0.1" value={draft.yield_g ?? ''} placeholder="36"
                onChange={e => setDraft({ ...draft, yield_g: num(e.target.value) })} />
            </div>
            <div>
              <FieldLabel>Temp (°C)</FieldLabel>
              <Input type="number" value={draft.temp_c ?? ''} placeholder="93"
                onChange={e => setDraft({ ...draft, temp_c: num(e.target.value) })} />
            </div>
            <div>
              <FieldLabel>Time (s)</FieldLabel>
              <Input type="number" value={draft.time_s ?? ''} placeholder="28"
                onChange={e => setDraft({ ...draft, time_s: int(e.target.value) })} />
            </div>
          </div>
          <div>
            <FieldLabel>Grind hint</FieldLabel>
            <Input value={draft.grind_hint ?? ''} placeholder="2.5 on the Niche"
              onChange={e => setDraft({ ...draft, grind_hint: e.target.value || null })} />
          </div>

          {draftMatches && (
            <p className="text-xs text-coffee-accent-soft">
              These numbers match the roaster's recipe — it will be marked.
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button" onClick={save} disabled={!draft.name.trim()}
              className={buttonClasses('primary', 'flex-1 disabled:opacity-50')}
            >Save</button>
            <button
              type="button" onClick={() => setEditing(null)}
              className={buttonClasses('secondary')}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
