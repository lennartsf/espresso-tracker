import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { ReactNode } from 'react'
import { useBrews } from '../hooks/useBrews'
import type { BrewWithCoffee } from '../hooks/useBrews'

const mockBrew: BrewWithCoffee = {
  id: 'b1',
  coffee_id: 'c1',
  grinder_id: null,
  brew_method: 'v60',
  grind_setting: 20,
  dose_g: 15,
  water_ml: 250,
  temp_c: 93,
  brew_time_s: 210,
  rating: 8,
  acidity_score: null,
  bitterness_score: null,
  tasting_notes: null,
  bloom_ml: 30,
  bloom_time_s: 45,
  inverted: false,
  first_stir_s: null,
  brewed_at: '2026-05-30T10:00:00Z',
  created_at: '2026-05-30T10:00:00Z',
  coffees: { name: 'Ethiopia' },
  grinders: null,
  brew_device_id: null,
  brew_devices: null,
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [mockBrew], error: null }),
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

test('useBrews gibt Brews zurück', async () => {
  const { result } = renderHook(() => useBrews(), { wrapper })
  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data).toHaveLength(1)
  expect(result.current.data![0].brew_method).toBe('v60')
  expect(result.current.data![0].coffees?.name).toBe('Ethiopia')
})
