import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../lib/auth'
import type { Grinder, NewGrinder, Machine, NewMachine, Basket, NewBasket, BrewDevice, NewBrewDevice, EquipmentDefault } from '../types'

// ── Grinders ──────────────────────────────────────────────────────────────────

export function useGrinders() {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['grinders', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('grinders').select('*').eq('user_id', uid).order('name')
      if (error) throw error
      return data as Grinder[]
    },
  })
}

export function useCreateGrinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (g: NewGrinder) => {
      const { data, error } = await supabase.from('grinders').insert({ ...g, user_id: getCurrentUserId() }).select().single()
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
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['machines', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('*').eq('user_id', uid).order('name')
      if (error) throw error
      return data as Machine[]
    },
  })
}

export function useCreateMachine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: NewMachine) => {
      const { data, error } = await supabase.from('machines').insert({ ...m, user_id: getCurrentUserId() }).select().single()
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
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['baskets', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('baskets').select('*').eq('user_id', uid).order('name')
      if (error) throw error
      return data as Basket[]
    },
  })
}

export function useCreateBasket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (b: NewBasket) => {
      const { data, error } = await supabase.from('baskets').insert({ ...b, user_id: getCurrentUserId() }).select().single()
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

// ── Brew Devices ──────────────────────────────────────────────────────────────

export function useBrewDevices() {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['brew_devices', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('brew_devices').select('*').eq('user_id', uid).order('name')
      if (error) throw error
      return data as BrewDevice[]
    },
  })
}

export function useCreateBrewDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (d: NewBrewDevice) => {
      const { data, error } = await supabase.from('brew_devices').insert({ ...d, user_id: getCurrentUserId() }).select().single()
      if (error) throw error
      return data as BrewDevice
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brew_devices'] }),
  })
}

export function useUpdateBrewDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewBrewDevice> & { id: string }) => {
      const { data, error } = await supabase.from('brew_devices').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as BrewDevice
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brew_devices'] }),
  })
}

export function useDeleteBrewDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brew_devices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brew_devices'] }),
  })
}

// ── Equipment Defaults ────────────────────────────────────────────────────────

export function useEquipmentDefaults() {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['equipment_defaults', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment_defaults').select('*').eq('user_id', uid)
      if (error) throw error
      return data as EquipmentDefault[]
    },
  })
}

export function useSetEquipmentDefault() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ method, field, id }: {
      method: string
      field: 'grinder_id' | 'machine_id' | 'basket_id' | 'brew_device_id'
      id: string | null
    }) => {
      const { error } = await supabase
        .from('equipment_defaults')
        .upsert({ user_id: getCurrentUserId(), method, [field]: id }, { onConflict: 'user_id,method' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment_defaults'] }),
  })
}
