import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Shot, NewShot } from '../types'

export type ShotWithCoffee = Shot & { coffees: { name: string } | null }

export function useShots(coffeeId?: string) {
  return useQuery({
    queryKey: ['shots', coffeeId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('shots')
        .select('*, coffees(name)')
        .order('pulled_at', { ascending: false })
      if (coffeeId) query = query.eq('coffee_id', coffeeId)
      const { data, error } = await query
      if (error) throw error
      return data as ShotWithCoffee[]
    },
  })
}

export function useCreateShot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (shot: NewShot) => {
      const { data, error } = await supabase
        .from('shots')
        .insert(shot)
        .select()
        .single()
      if (error) throw error
      return data as Shot
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shots'] }),
  })
}
