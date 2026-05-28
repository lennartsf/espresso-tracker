import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Coffee, NewCoffee, RoastDate, NewRoastDate } from '../types'

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

export function useUpdateCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewCoffee> & { id: string }) => {
      const { data, error } = await supabase
        .from('coffees')
        .update(updates)
        .eq('id', id)
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

export function useRoastDates(coffeeId: string) {
  return useQuery({
    queryKey: ['roast_dates', coffeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roast_dates')
        .select('*')
        .eq('coffee_id', coffeeId)
        .order('roast_date', { ascending: false })
      if (error) throw error
      return data as RoastDate[]
    },
    enabled: !!coffeeId,
  })
}

export function useCreateRoastDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rd: NewRoastDate) => {
      const { data, error } = await supabase
        .from('roast_dates')
        .insert(rd)
        .select()
        .single()
      if (error) throw error
      return data as RoastDate
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['roast_dates', vars.coffee_id] }),
  })
}

export function useDeleteRoastDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; coffeeId: string }) => {
      const { error } = await supabase.from('roast_dates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['roast_dates', vars.coffeeId] }),
  })
}
