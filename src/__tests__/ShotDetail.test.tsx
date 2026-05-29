import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { ShotDetail } from '../pages/ShotDetail'

vi.mock('../hooks/useShots', () => ({
  useShot: () => ({
    data: {
      id: 'shot-1',
      coffee_id: 'coffee-1',
      roast_date_id: null,
      grind_setting: 12.5,
      dose_g: 18,
      yield_g: 36,
      brew_ratio: 2.0,
      brew_time_s: 28,
      temp_c: 93,
      rating: 8,
      body_score: 7,
      acidity_score: 5,
      tasting_notes: 'Schokolade',
      pulled_at: '2026-05-29T09:32:00.000Z',
      created_at: '2026-05-29T09:32:00.000Z',
      coffees: { name: 'Ethiopia Yirgacheffe' },
      roast_dates: null,
    },
    isLoading: false,
  }),
  useDeleteShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../hooks/useCoffees', () => ({
  useCoffees: () => ({ data: [] }),
  useRoastDates: () => ({ data: [] }),
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
