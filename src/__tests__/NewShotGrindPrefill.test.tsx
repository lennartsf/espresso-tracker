import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { NewShot } from '../pages/NewShot'

/** Ein Shot dieser Bohne, gemahlen auf 14.5. */
const shotForCoffee1 = {
  id: 'shot-1',
  coffee_id: 'coffee-1',
  grind_setting: 14.5,
  dose_g: 18,
  yield_g: 36,
  rating: 8,
  drink_type: 'espresso',
  pulled_at: '2026-08-20T09:00:00.000Z',
  created_at: '2026-08-20T09:00:00.000Z',
}

/** useShots(coffeeId) filtert serverseitig — im Test wird das nachgebildet,
 *  damit der Hook sich wie in der App verhaelt. */
vi.mock('../hooks/useShots', () => ({
  useShots: vi.fn((coffeeId?: string) => ({
    data: !coffeeId || coffeeId === 'coffee-1' ? [shotForCoffee1] : [],
  })),
  useCreateShot: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../hooks/useCoffees', () => ({
  useCoffees: () => ({
    data: [
      { id: 'coffee-1', name: 'Kenya Kirinyaga', roaster: 'Five Elephant', notes: 'fein mahlen' },
      { id: 'coffee-2', name: 'Brazil Fazenda', roaster: 'The Barn', notes: null },
    ],
  }),
  useCreateCoffee: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRoastDates: () => ({ data: [] }),
}))

vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [] }),
  useMachines: () => ({ data: [] }),
  useBaskets: () => ({ data: [] }),
  useEquipmentDefaults: () => ({ data: [], isLoading: false }),
}))

// Desktop-Modus: Ein-Seiten-Form, alle Felder gleichzeitig sichtbar.
vi.mock('../hooks/useIsMobile', () => ({ useIsMobile: () => false }))

function renderNewShot() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <NewShot />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const grindField = () => screen.getByPlaceholderText('12') as HTMLInputElement
const coffeeSelect = () => screen.getByRole('combobox', { name: '' }) as HTMLSelectElement

test('grind starts empty before a coffee is chosen', () => {
  renderNewShot()
  expect(grindField().value).toBe('')
})

test('choosing a coffee prefills grind from that coffee last shot', async () => {
  const user = userEvent.setup()
  renderNewShot()
  await user.selectOptions(coffeeSelect(), 'coffee-1')
  expect(grindField().value).toBe('14.5')
  expect(screen.getByText(/From your last shot of this coffee/i)).toBeInTheDocument()
})

test('a coffee without shots leaves grind empty', async () => {
  const user = userEvent.setup()
  renderNewShot()
  await user.selectOptions(coffeeSelect(), 'coffee-2')
  expect(grindField().value).toBe('')
  expect(screen.queryByText(/From your last shot of this coffee/i)).not.toBeInTheDocument()
})

test('a grind the user typed survives switching coffee', async () => {
  const user = userEvent.setup()
  renderNewShot()
  await user.type(grindField(), '9')
  await user.selectOptions(coffeeSelect(), 'coffee-1')
  // Eigene Eingabe schlaegt den Vorschlag — sonst wuerde ein Refetch sie wegwerfen.
  expect(grindField().value).toBe('9')
  expect(screen.queryByText(/From your last shot of this coffee/i)).not.toBeInTheDocument()
})

test('the coffee note replaces the old roaster grind hint', async () => {
  const user = userEvent.setup()
  renderNewShot()
  await user.selectOptions(coffeeSelect(), 'coffee-1')
  expect(screen.getByText(/Note: fein mahlen/i)).toBeInTheDocument()
})
