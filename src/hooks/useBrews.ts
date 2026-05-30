import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Brew, NewBrew } from '../types'

export type BrewWithCoffee = Brew & {
  coffees: { name: string } | null
  grinders: { name: string } | null
}

export function useBrews(coffeeId?: string, brewMethod?: string) {
  return useQuery({
    queryKey: ['brews', coffeeId ?? 'all', brewMethod ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('brews')
        .select('*, coffees(name), grinders(name)')
        .order('brewed_at', { ascending: false })
      if (coffeeId) query = query.eq('coffee_id', coffeeId)
      if (brewMethod) query = query.eq('brew_method', brewMethod)
      const { data, error } = await query
      if (error) throw error
      return data as BrewWithCoffee[]
    },
  })
}

export function useBrew(id: string) {
  return useQuery({
    queryKey: ['brew', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brews')
        .select('*, coffees(name), grinders(name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as BrewWithCoffee
    },
    enabled: !!id,
  })
}

export function useCreateBrew() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (brew: NewBrew) => {
      const { data, error } = await supabase.from('brews').insert(brew).select().single()
      if (error) throw error
      return data as Brew
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brews'] }),
  })
}

export function useUpdateBrew() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (brew: Partial<Brew> & { id: string }) => {
      const { id, ...fields } = brew
      const { data, error } = await supabase
        .from('brews').update(fields).eq('id', id).select().single()
      if (error) throw error
      return data as Brew
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['brews'] })
      qc.invalidateQueries({ queryKey: ['brew', data.id] })
    },
  })
}

export function useDeleteBrew() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brews').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brews'] }),
  })
}
