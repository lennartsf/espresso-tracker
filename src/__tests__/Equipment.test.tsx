import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { Equipment } from '../pages/Equipment'
import type { Grinder, Machine, Basket } from '../types'

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

vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [mockGrinder], isLoading: false }),
  useCreateGrinder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateGrinder: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteGrinder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMachines: () => ({ data: [mockMachine], isLoading: false }),
  useCreateMachine: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMachine: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteMachine: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useBaskets: () => ({ data: [mockBasket], isLoading: false }),
  useCreateBasket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBasket: () => ({ mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false }),
  useDeleteBasket: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

function renderEquipment() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Equipment />
    </QueryClientProvider>
  )
}

test('zeigt Mühlen-Tab standardmäßig', () => {
  renderEquipment()
  expect(screen.getByText('Niche Zero')).toBeInTheDocument()
})

test('wechselt zu Maschinen-Tab', async () => {
  renderEquipment()
  await userEvent.click(screen.getByRole('button', { name: 'Maschinen' }))
  expect(screen.getByText('Rancilio Silvia')).toBeInTheDocument()
})

test('wechselt zu Siebe-Tab', async () => {
  renderEquipment()
  await userEvent.click(screen.getByRole('button', { name: 'Siebe' }))
  expect(screen.getByText('VST 18g')).toBeInTheDocument()
})

test('zeigt Neu-Formular nach Klick auf + Neu', async () => {
  renderEquipment()
  await userEvent.click(screen.getByRole('button', { name: '+ Neu' }))
  expect(screen.getByPlaceholderText('Name *')).toBeInTheDocument()
})

test('zeigt Favorit-Stern in der Liste', () => {
  renderEquipment()
  const favoriteButtons = screen.getAllByRole('button', { name: 'Favorit' })
  expect(favoriteButtons.length).toBeGreaterThan(0)
})

test('zeigt Detail-Ansicht nach Klick auf Item-Name', async () => {
  renderEquipment()
  await userEvent.click(screen.getByText('Niche Zero'))
  expect(screen.getByRole('button', { name: 'Bearbeiten' })).toBeInTheDocument()
})
