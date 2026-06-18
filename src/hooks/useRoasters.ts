import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentUserId } from '../lib/auth'
import type { Roaster, NewRoaster } from '../types'

export function useRoasters() {
  const uid = getCurrentUserId()
  return useQuery({
    queryKey: ['roasters', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roasters')
        .select('*')
        .eq('user_id', uid)
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
        .insert({ ...roaster, user_id: getCurrentUserId() })
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

export interface GeoResult {
  lat: number
  lng: number
  displayName: string
  shortName: string
}

export async function searchAddresses(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 3) return []
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'de', 'User-Agent': 'EspressoTracker/1.0' } }
  )
  const data = await res.json()
  return data.map((d: Record<string, unknown>) => {
    const addr = d.address as Record<string, string> | undefined
    return {
      lat: parseFloat(d.lat as string),
      lng: parseFloat(d.lon as string),
      displayName: d.display_name as string,
      shortName: [addr?.road, addr?.city || addr?.town || addr?.village, addr?.country]
        .filter(Boolean).join(', ') || (d.display_name as string),
    }
  })
}
