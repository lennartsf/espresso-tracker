import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Roaster, NewRoaster } from '../types'

export function useRoasters() {
  return useQuery({
    queryKey: ['roasters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roasters')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Roaster[]
    },
  })
}

export function useCreateRoaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (roaster: NewRoaster) => {
      const { data, error } = await supabase
        .from('roasters')
        .insert(roaster)
        .select()
        .single()
      if (error) throw error
      return data as Roaster
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roasters'] }),
  })
}

export function useUpdateRoaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewRoaster> & { id: string }) => {
      const { data, error } = await supabase
        .from('roasters')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Roaster
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roasters'] }),
  })
}

export function useDeleteRoaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roasters').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roasters'] })
      qc.invalidateQueries({ queryKey: ['coffees'] })
    },
  })
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    { headers: { 'Accept-Language': 'de', 'User-Agent': 'EspressoTracker/1.0' } }
  )
  const data = await res.json()
  if (!data.length) return null
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  }
}
