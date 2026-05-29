import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Grinder, NewGrinder, Machine, NewMachine, Basket, NewBasket } from '../types'

// ── Grinders ──────────────────────────────────────────────────────────────────

export function useGrinders() {
  return useQuery({
    queryKey: ['grinders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('grinders').select('*').order('name')
      if (error) throw error
      return data as Grinder[]
    },
  })
}

export function useCreateGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (g: NewGrinder) => {
      const { data, error } = await supabase.from('grinders').insert(g).select().single()
      if (error) throw error
      return data as Grinder
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grinders'] }),
  })
}

export function useUpdateGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewGrinder> & { id: string }) => {
      const { data, error } = await supabase.from('grinders').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Grinder
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grinders'] }),
  })
}

export function useDeleteGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('grinders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grinders'] }),
  })
}

// ── Machines ──────────────────────────────────────────────────────────────────

export function useMachines() {
  return useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('*').order('name')
      if (error) throw error
      return data as Machine[]
    },
  })
}

export function useCreateMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: NewMachine) => {
      const { data, error } = await supabase.from('machines').insert(m).select().single()
      if (error) throw error
      return data as Machine
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  })
}

export function useUpdateMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewMachine> & { id: string }) => {
      const { data, error } = await supabase.from('machines').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Machine
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  })
}

export function useDeleteMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('machines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  })
}

// ── Baskets ───────────────────────────────────────────────────────────────────

export function useBaskets() {
  return useQuery({
    queryKey: ['baskets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('baskets').select('*').order('name')
      if (error) throw error
      return data as Basket[]
    },
  })
}

export function useCreateBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (b: NewBasket) => {
      const { data, error } = await supabase.from('baskets').insert(b).select().single()
      if (error) throw error
      return data as Basket
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['baskets'] }),
  })
}

export function useUpdateBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewBasket> & { id: string }) => {
      const { data, error } = await supabase.from('baskets').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Basket
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['baskets'] }),
  })
}

export function useDeleteBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('baskets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['baskets'] }),
  })
}
