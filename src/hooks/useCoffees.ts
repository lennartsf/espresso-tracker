import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Coffee, NewCoffee } from '../types'

export function useCoffees() {
  return useQuery({
    queryKey: ['coffees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Coffee[]
    },
  })
}

export function useCreateCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (coffee: NewCoffee) => {
      const { data, error } = await supabase
        .from('coffees')
        .insert(coffee)
        .select()
        .single()
      if (error) throw error
      return data as Coffee
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffees'] }),
  })
}

export function useDeleteCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coffees').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coffees'] })
      qc.invalidateQueries({ queryKey: ['shots'] })
    },
  })
}
