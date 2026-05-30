import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrewCard } from '../components/BrewCard'
import type { BrewWithCoffee } from '../hooks/useBrews'

const baseBrew: BrewWithCoffee = {
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

function renderCard(brew: BrewWithCoffee) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <BrewCard brew={brew} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('shows V60 method badge', () => {
  renderCard(baseBrew)
  expect(screen.getByText('V60')).toBeInTheDocument()
})

test('shows coffee name', () => {
  renderCard(baseBrew)
  expect(screen.getByText('Ethiopia')).toBeInTheDocument()
})

test('shows brew time as 03:30', () => {
  renderCard(baseBrew)
  expect(screen.getByText(/03:30/)).toBeInTheDocument()
})

test('shows rating badge', () => {
  renderCard(baseBrew)
  expect(screen.getByText('8')).toBeInTheDocument()
})

test('shows French Press badge', () => {
  renderCard({ ...baseBrew, brew_method: 'french_press' })
  expect(screen.getByText('French Press')).toBeInTheDocument()
})

test('shows fallback dash when coffees is null', () => {
  renderCard({ ...baseBrew, coffees: null })
  expect(screen.getByText('—')).toBeInTheDocument()
})
