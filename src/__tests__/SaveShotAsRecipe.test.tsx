import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SaveShotAsRecipe } from '../components/SaveShotAsRecipe'
import type { ShotWithCoffee } from '../hooks/useShots'

const created = vi.fn()

vi.mock('../hooks/useCoffees', () => ({
  useCoffees: () => ({ data: [{ id: 'c1', name: 'Bean', rec_dose_g: null }] }),
}))
vi.mock('../hooks/useCoffeeRecipes', () => ({
  useCreateCoffeeRecipe: () => ({
    mutateAsync: (args: unknown) => { created(args); return Promise.resolve() },
    isPending: false,
  }),
}))

function shot(over: Partial<ShotWithCoffee> = {}): ShotWithCoffee {
  return {
    id: 's1', coffee_id: 'c1', grind_setting: 10.5, dose_g: 18, yield_g: 36,
    brew_time_s: 28, temp_c: 93, rating: 9, tasting_notes: 'lovely',
    grinder_id: 'g1', basket_id: 'b1', machine_id: null,
    pulled_at: '2026-08-30T09:00:00.000Z',
    grinders: { name: 'Niche' },
    ...over,
  } as unknown as ShotWithCoffee
}

function renderIt(s: ShotWithCoffee) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}><SaveShotAsRecipe shot={s} /></QueryClientProvider>)
}

beforeEach(() => created.mockClear())

test('carries the shot numbers into the recipe', async () => {
  const user = userEvent.setup()
  renderIt(shot())
  await user.click(screen.getByRole('button', { name: /save as recipe/i }))
  await user.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => expect(created).toHaveBeenCalled())
  const { recipe } = created.mock.calls[0][0]
  expect(recipe).toMatchObject({
    coffee_id: 'c1', dose_g: 18, yield_g: 36, time_s: 28, temp_c: 93,
    grinder_id: 'g1', grind_setting: 10.5,
  })
})

test('ratings and notes stay with the shot', async () => {
  const user = userEvent.setup()
  renderIt(shot())
  await user.click(screen.getByRole('button', { name: /save as recipe/i }))
  await user.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => expect(created).toHaveBeenCalled())
  const { recipe } = created.mock.calls[0][0]
  // Ein Rezept ist eine Vorschrift, kein Protokoll — die Bewertung beschreibt
  // diesen einen Bezug und gehoert nicht in die Vorschrift.
  expect(recipe).not.toHaveProperty('rating')
  expect(JSON.stringify(recipe)).not.toContain('lovely')
})

test('a grind setting without a grinder is dropped, not stored blind', async () => {
  const user = userEvent.setup()
  // Mahlgradzahlen sind zwischen Muehlen nicht vergleichbar. Ohne verknuepfte
  // Muehle laesst sich die Zahl spaeter auf keine Skala beziehen.
  renderIt(shot({ grinder_id: null, grinders: undefined }))
  await user.click(screen.getByRole('button', { name: /save as recipe/i }))
  await user.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => expect(created).toHaveBeenCalled())
  const { recipe } = created.mock.calls[0][0]
  expect(recipe.grind_setting).toBeNull()
  expect(recipe.grinder_id).toBeNull()
})

test('the name is required', async () => {
  const user = userEvent.setup()
  renderIt(shot())
  await user.click(screen.getByRole('button', { name: /save as recipe/i }))
  await user.clear(screen.getByRole('textbox'))
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
})

test('it says which numbers it is about to take over', async () => {
  const user = userEvent.setup()
  renderIt(shot())
  await user.click(screen.getByRole('button', { name: /save as recipe/i }))
  expect(screen.getByText(/18→36 g/)).toBeInTheDocument()
  expect(screen.getByText(/grind 10.5 on Niche/)).toBeInTheDocument()
})

test('confirms once saved instead of leaving the form open', async () => {
  const user = userEvent.setup()
  renderIt(shot())
  await user.click(screen.getByRole('button', { name: /save as recipe/i }))
  await user.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(screen.getByText(/Saved to this coffee's recipes/)).toBeInTheDocument())
})
