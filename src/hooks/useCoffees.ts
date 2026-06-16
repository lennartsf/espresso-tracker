import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../lib/auth'
import type { Coffee, NewCoffee, RoastDate, NewRoastDate } from '../types'

export function useCoffees() {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['coffees', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .eq('user_id', uid)
        .order('name')
      if (error) throw error
      return data as Coffee[]
    },
  })
}

export function useCoffeesByRoaster(roasterId: string) {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['coffees', 'roaster', uid, roasterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .eq('user_id', uid)
        .eq('roaster_id', roasterId)
        .order('name')
      if (error) throw error
      return data as Coffee[]
    },
    enabled: !!roasterId && !!uid,
  })
}

export function useCreateCoffee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (coffee: NewCoffee) => {
      const { data, error } = await supabase
        .from('coffees')
        .insert({ ...coffee, user_id: getCurrentUserId() })
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
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['roast_dates', uid, coffeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roast_dates')
        .select('*')
        .eq('user_id', uid)
        .eq('coffee_id', coffeeId)
        .order('roast_date', { ascending: false })
      if (error) throw error
      return data as RoastDate[]
    },
    enabled: !!coffeeId && !!uid,
  })
}

export function useCreateRoastDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rd: NewRoastDate) => {
      const { data, error } = await supabase
        .from('roast_dates')
        .insert({ ...rd, user_id: getCurrentUserId() })
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
