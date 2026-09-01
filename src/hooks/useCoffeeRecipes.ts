import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../lib/auth'
import { matchesRoasterRecipe } from '../utils/recipeMatch'
import type { Coffee, CoffeeRecipe, NewCoffeeRecipe } from '../types'

/** Eigene Rezepte einer Bohne, neuestes zuerst.
 *  Das Röster-Rezept ist NICHT dabei — es steht in `coffees.rec_*`. */
export function useCoffeeRecipes(coffeeId?: string) {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['coffee-recipes', uid, coffeeId ?? 'none'],
    enabled: !!uid && !!coffeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_recipes')
        .select('*')
        .eq('user_id', uid)
        .eq('coffee_id', coffeeId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as CoffeeRecipe[]
    },
  })
}

/** Setzt `matches_roaster` aus dem Ist-Zustand, statt dem Aufrufer zu trauen.
 *
 *  Der Grund ist der Drift-Fall: der User markiert ein Rezept als „= Röster",
 *  ändert danach die Dosis, und das Badge lügt. Weil die Prüfung hier sitzt,
 *  kann kein Aufrufer sie vergessen. */
function withRoasterFlag(recipe: NewCoffeeRecipe, coffee?: Coffee): NewCoffeeRecipe {
  return { ...recipe, matches_roaster: matchesRoasterRecipe(recipe, coffee) }
}

export function useCreateCoffeeRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipe, coffee }: { recipe: NewCoffeeRecipe; coffee?: Coffee }) => {
      const { data, error } = await supabase
        .from('coffee_recipes')
        .insert({ ...withRoasterFlag(recipe, coffee), user_id: getCurrentUserId() })
        .select()
        .single()
      if (error) throw error
      return data as CoffeeRecipe
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffee-recipes'] }),
  })
}

export function useUpdateCoffeeRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, recipe, coffee }: { id: string; recipe: NewCoffeeRecipe; coffee?: Coffee }) => {
      const { data, error } = await supabase
        .from('coffee_recipes')
        .update(withRoasterFlag(recipe, coffee))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CoffeeRecipe
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffee-recipes'] }),
  })
}

export function useDeleteCoffeeRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coffee_recipes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffee-recipes'] }),
  })
}
