import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShotCard } from '../components/ShotCard'
import type { ShotWithCoffee } from '../hooks/useShots'

const baseShot: ShotWithCoffee = {
  id: 's1',
  coffee_id: 'c1',
  roast_date_id: null,
  grind_setting: 12,
  dose_g: 18,
  yield_g: 36,
  brew_time_s: 28,
  temp_c: 93,
  pressure_bar: 9,
  rating: 8,
  body_score: null,
  acidity_score: null,
  bitterness_score: null,
  preinfusion_s: null,
  brew_ratio: 2,
  tasting_notes: null,
  used_rdt: false,
  used_wdt: false,
  used_leveler: false,
  grinder_id: null,
  machine_id: null,
  basket_id: null,
  drink_type: 'espresso',
  milk_type: null,
  milk_ml: null,
  pulled_at: '2026-05-30T10:00:00Z',
  created_at: '2026-05-30T10:00:00Z',
  coffees: { name: 'Ethiopia' },
  roast_dates: null,
  grinders: null,
  machines: null,
  baskets: null,
}

function renderCard(shot: ShotWithCoffee) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ShotCard shot={shot} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('zeigt Espresso-Badge für espresso shots', () => {
  renderCard(baseShot)
  expect(screen.getByText('Espresso')).toBeInTheDocument()
})

test('zeigt Cappuccino-Badge für cappuccino shots', () => {
  renderCard({ ...baseShot, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120 })
  expect(screen.getByText('Cappuccino')).toBeInTheDocument()
})

test('zeigt Milchsorte + ml in der Unterzeile bei Milchgetränken', () => {
  renderCard({ ...baseShot, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120 })
  expect(screen.getByText(/Oat Milk/)).toBeInTheDocument()
  expect(screen.getByText(/120 ml/)).toBeInTheDocument()
})

test('zeigt Mahlgrad in der Unterzeile bei Espresso', () => {
  renderCard(baseShot)
  expect(screen.getByText(/Mahlgrad 12/)).toBeInTheDocument()
})
