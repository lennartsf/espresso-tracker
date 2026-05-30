import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { ReactNode } from 'react'
import { useGrinders, useMachines, useBaskets, useBrewDevices, useEquipmentDefaults } from '../hooks/useEquipment'
import type { Grinder, Machine, Basket, BrewDevice, EquipmentDefault } from '../types'

const mockGrinder: Grinder = {
  id: 'g1', name: 'Niche Zero', brand: 'Niche',
  notes: null, grinder_type: null, burr_size_mm: null, motor_watt: null,
  stepless: false, has_hopper: false, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
const mockMachine: Machine = {
  id: 'm1', name: 'Rancilio Silvia', brand: 'Rancilio',
  notes: null, funktionsweise: null, brew_group_type: null, brew_group_size_mm: null,
  is_favorite: true, created_at: '2026-01-01T00:00:00Z',
}
const mockBasket: Basket = {
  id: 'b1', name: 'VST 18g', brand: 'VST', diameter_mm: 58, size_g: 18,
  notes: null, is_favorite: false, created_at: '2026-01-01T00:00:00Z',
}
const mockDevice: BrewDevice = {
  id: 'd1', name: 'Hario V60 02', brand: 'Hario',
  device_type: 'v60', notes: null, is_favorite: false,
  created_at: '2026-01-01T00:00:00Z',
}
const mockDefault: EquipmentDefault = {
  method: 'espresso', grinder_id: 'g1',
  machine_id: null, basket_id: null, brew_device_id: null,
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({
          data: table === 'grinders'            ? [mockGrinder]
               : table === 'machines'           ? [mockMachine]
               : table === 'brew_devices'       ? [mockDevice]
               : [mockBasket],
          error: null,
        }),
        // equipment_defaults has no .order()
        then: (resolve: (v: { data: EquipmentDefault[]; error: null }) => void) =>
          resolve({ data: [mockDefault], error: null }),
      }),
    }),
  },
}))

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  )
}

test('useGrinders gibt Mühlen zurück', async () => {
  const { result } = renderHook(() => useGrinders(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].name).toBe('Niche Zero')
})

test('useMachines gibt Maschinen zurück', async () => {
  const { result } = renderHook(() => useMachines(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data![0].name).toBe('Rancilio Silvia')
  expect(result.current.data![0].is_favorite).toBe(true)
})

test('useBaskets gibt Siebe zurück', async () => {
  const { result } = renderHook(() => useBaskets(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data![0].name).toBe('VST 18g')
  expect(result.current.data![0].size_g).toBe(18)
})

test('useBrewDevices gibt Geräte zurück', async () => {
  const { result } = renderHook(() => useBrewDevices(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].name).toBe('Hario V60 02')
})

test('useEquipmentDefaults gibt Defaults zurück', async () => {
  const { result } = renderHook(() => useEquipmentDefaults(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data![0].method).toBe('espresso')
  expect(result.current.data![0].grinder_id).toBe('g1')
})
