import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { ShotDetail } from '../pages/ShotDetail'
import { useShot } from '../hooks/useShots'

vi.mock('../hooks/useShots', () => ({
  useShot: vi.fn(() => ({
    data: {
      id: 'shot-1',
      coffee_id: 'coffee-1',
      roast_date_id: null,
      grind_setting: 12.5,
      dose_g: 18,
      yield_g: 36,
      brew_ratio: 2.0,
      pressure_bar: 9,
      brew_time_s: 28,
      temp_c: 93,
      rating: 8,
      body_score: 7,
      acidity_score: 5,
      bitterness_score: null,
      tasting_notes: 'Schokolade',
      used_rdt: false,
      used_wdt: false,
      used_leveler: false,
      grinder_id: null,
      machine_id: null,
      basket_id: null,
      drink_type: 'espresso',
      milk_type: null,
      milk_ml: null,
      pulled_at: '2026-05-29T09:32:00.000Z',
      created_at: '2026-05-29T09:32:00.000Z',
      coffees: { name: 'Ethiopia Yirgacheffe' },
      roast_dates: null,
      grinders: null,
      machines: null,
      baskets: null,
    },
    isLoading: false,
  })),
  useDeleteShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../hooks/useCoffees', () => ({
  useCoffees: () => ({ data: [] }),
  useRoastDates: () => ({ data: [] }),
}))

vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [] }),
  useMachines: () => ({ data: [] }),
  useBaskets: () => ({ data: [] }),
}))

function renderDetail() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/shots/shot-1']}>
        <Routes>
          <Route path="/shots/:id" element={<ShotDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('zeigt Kaffee-Name und Bewertung', () => {
  renderDetail()
  expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument()
  expect(screen.getByText('8')).toBeInTheDocument()
})

test('zeigt Mahlgrad', () => {
  renderDetail()
  expect(screen.getByText('12.5')).toBeInTheDocument()
})

test('zeigt Tasting Notes', () => {
  renderDetail()
  expect(screen.getByText(/Schokolade/)).toBeInTheDocument()
})

test('zeigt Druck wenn pressure_bar vorhanden', () => {
  renderDetail()
  expect(screen.getByText('9 bar')).toBeInTheDocument()
})

test('zeigt Edit-Formular nach Klick auf Bearbeiten', async () => {
  renderDetail()
  await userEvent.click(screen.getByText('Bearbeiten'))
  expect(screen.getByText('Shot bearbeiten')).toBeInTheDocument()
  expect(screen.getByText('Änderungen speichern')).toBeInTheDocument()
})

test('zeigt Getränketyp-Badge für Cappuccino', () => {
  vi.mocked(useShot).mockReturnValueOnce({
    data: {
      id: 'shot-1',
      coffee_id: 'coffee-1',
      roast_date_id: null,
      grind_setting: 12.5,
      dose_g: 18,
      yield_g: 36,
      brew_ratio: 2.0,
      pressure_bar: 9,
      brew_time_s: 28,
      temp_c: 93,
      rating: 8,
      body_score: 7,
      acidity_score: 5,
      tasting_notes: null,
      used_rdt: false,
      used_wdt: false,
      used_leveler: false,
      grinder_id: null,
      machine_id: null,
      basket_id: null,
      drink_type: 'cappuccino',
      milk_type: 'hafer',
      milk_ml: 120,
      pulled_at: '2026-05-30T10:00:00Z',
      created_at: '2026-05-30T10:00:00Z',
      coffees: { name: 'Ethiopia Yirgacheffe' },
      roast_dates: null,
      grinders: null,
      machines: null,
      baskets: null,
    },
    isLoading: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  renderDetail()
  expect(screen.getByText('Cappuccino')).toBeInTheDocument()
  expect(screen.getByText('Hafermilch')).toBeInTheDocument()
  expect(screen.getByText('120 ml')).toBeInTheDocument()
})

test('zeigt Ausrüstungs-Chips wenn Equipment vorhanden', () => {
  vi.mocked(useShot).mockReturnValueOnce({
    data: {
      id: 'shot-1',
      coffee_id: 'coffee-1',
      roast_date_id: null,
      grind_setting: 12.5,
      dose_g: 18,
      yield_g: 36,
      brew_ratio: 2.0,
      pressure_bar: 9,
      brew_time_s: 28,
      temp_c: 93,
      rating: 8,
      body_score: 7,
      acidity_score: 5,
      bitterness_score: null,
      tasting_notes: 'Schokolade',
      used_rdt: false,
      used_wdt: false,
      used_leveler: false,
      grinder_id: 'g1',
      machine_id: null,
      basket_id: 'b1',
      drink_type: 'espresso',
      milk_type: null,
      milk_ml: null,
      pulled_at: '2026-05-29T09:32:00.000Z',
      created_at: '2026-05-29T09:32:00.000Z',
      coffees: { name: 'Ethiopia Yirgacheffe' },
      roast_dates: null,
      grinders: { name: 'Niche Zero' },
      machines: null,
      baskets: { name: 'VST 18g', size_g: 18 },
    },
    isLoading: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  renderDetail()
  expect(screen.getByText(/Niche Zero/)).toBeInTheDocument()
  expect(screen.getByText(/VST 18g/)).toBeInTheDocument()
})
