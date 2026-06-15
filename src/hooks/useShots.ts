import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { enqueueWrite } from '../lib/writeQueue'
import type { Shot, NewShot } from '../types'

export type ShotWithCoffee = Shot & {
  coffees: { name: string } | null
  roast_dates: { roast_date: string } | null
  grinders: { name: string } | null
  machines: { name: string } | null
  baskets: { name: string; size_g: number | null } | null
}

export function useShots(coffeeId?: string, roastDateId?: string, drinkFilter?: 'espresso' | 'milk') {
  return useQuery({
    queryKey: ['shots', coffeeId ?? 'all', roastDateId ?? 'all', drinkFilter ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('shots')
        .select('*, coffees(name), roast_dates(roast_date), grinders(name), machines(name), baskets(name, size_g)')
        .order('pulled_at', { ascending: false })
      if (coffeeId) query = query.eq('coffee_id', coffeeId)
      if (roastDateId) query = query.eq('roast_date_id', roastDateId)
      if (drinkFilter === 'espresso') query = query.eq('drink_type', 'espresso')
      if (drinkFilter === 'milk') query = query.neq('drink_type', 'espresso')
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
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueWrite('shots', shot as unknown as Record<string, unknown>)
        return { ...shot, id: `queued-${crypto.randomUUID()}`, created_at: new Date().toISOString() } as Shot
      }
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

export function useShot(id: string) {
  return useQuery({
    queryKey: ['shot', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shots')
        .select('*, coffees(name), roast_dates(roast_date), grinders(name), machines(name), baskets(name, size_g)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as ShotWithCoffee
    },
    enabled: !!id,
  })
}

export function useUpdateShot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (shot: Partial<Shot> & { id: string }) => {
      const { id, ...fields } = shot
      const { data, error } = await supabase
        .from('shots')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Shot
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['shots'] })
      qc.invalidateQueries({ queryKey: ['shot', data.id] })
    },
  })
}

export function useDeleteShot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shots').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shots'] }),
  })
}
