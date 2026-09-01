import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { CoffeeRecipeList } from '../components/CoffeeRecipeList'
import type { Coffee, CoffeeRecipe } from '../types'

const created = vi.fn()
let recipes: CoffeeRecipe[] = []

vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [
    { id: 'g1', name: 'Niche', brand: 'Niche' },
    { id: 'g2', name: 'DF64', brand: null },
  ] }),
}))
vi.mock('../hooks/useCoffeeRecipes', () => ({
  useCoffeeRecipes: () => ({ data: recipes }),
  useCreateCoffeeRecipe: () => ({
    mutateAsync: (args: unknown) => { created(args); return Promise.resolve() },
  }),
  useUpdateCoffeeRecipe: () => ({ mutateAsync: () => Promise.resolve() }),
  useDeleteCoffeeRecipe: () => ({ mutate: () => {} }),
}))

const coffee = { id: 'c1', name: 'Bean' } as Coffee

function recipe(over: Partial<CoffeeRecipe> = {}): CoffeeRecipe {
  return {
    id: 'r1', coffee_id: 'c1', user_id: 'u1', name: 'My standard',
    dose_g: 18, yield_g: 36, temp_c: 93, time_s: 28,
    grinder_id: 'g1', grind_setting: 2.5, grind_hint: null,
    is_default: false, matches_roaster: false, created_at: '2026-09-01',
    ...over,
  }
}

beforeEach(() => { created.mockClear(); recipes = [] })

test('the grind setting is always shown with its grinder', () => {
  // Eine nackte „2.5" waere zwischen zwei Muehlen nicht zu deuten.
  recipes = [recipe()]
  render(<CoffeeRecipeList coffee={coffee} />)
  expect(screen.getByText(/2\.5 on Niche/)).toBeInTheDocument()
})

test('a recipe whose grinder was deleted says so instead of showing a bare number', () => {
  recipes = [recipe({ grinder_id: 'gone' })]
  render(<CoffeeRecipeList coffee={coffee} />)
  expect(screen.getByText(/2\.5 on unknown grinder/)).toBeInTheDocument()
})

test('the grind setting is locked until a grinder is picked', async () => {
  const user = userEvent.setup()
  render(<CoffeeRecipeList coffee={coffee} />)
  await user.click(screen.getByRole('button', { name: /new/i }))

  const grind = screen.getByPlaceholderText('2.5')
  expect(grind).toBeDisabled()

  await user.selectOptions(screen.getByLabelText(/grinder/i), 'g1')
  expect(grind).toBeEnabled()
})

test('clearing the grinder clears the grind setting too', async () => {
  const user = userEvent.setup()
  render(<CoffeeRecipeList coffee={coffee} />)
  await user.click(screen.getByRole('button', { name: /new/i }))

  await user.selectOptions(screen.getByLabelText(/grinder/i), 'g1')
  await user.type(screen.getByPlaceholderText('2.5'), '2.5')
  await user.selectOptions(screen.getByLabelText(/grinder/i), '')

  // Eine Zahl ohne Muehle wuerde spaeter still auf die falsche Skala bezogen.
  expect(screen.getByPlaceholderText('2.5')).toHaveValue(null)
})

test('grinder and grind setting are saved as real fields', async () => {
  const user = userEvent.setup()
  render(<CoffeeRecipeList coffee={coffee} />)
  await user.click(screen.getByRole('button', { name: /new/i }))

  await user.type(screen.getByPlaceholderText('My standard'), 'Morning')
  await user.selectOptions(screen.getByLabelText(/grinder/i), 'g2')
  await user.type(screen.getByPlaceholderText('2.5'), '11.5')
  await user.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => expect(created).toHaveBeenCalled())
  expect(created.mock.calls[0][0].recipe).toMatchObject({
    name: 'Morning', grinder_id: 'g2', grind_setting: 11.5,
  })
})

test('the free-text field survives as a general note', async () => {
  const user = userEvent.setup()
  render(<CoffeeRecipeList coffee={coffee} />)
  await user.click(screen.getByRole('button', { name: /new/i }))

  await user.type(screen.getByPlaceholderText('My standard'), 'Morning')
  await user.type(screen.getByPlaceholderText(/Loosen the puck/), 'with RDT')
  await user.click(screen.getByRole('button', { name: 'Save' }))

  await waitFor(() => expect(created).toHaveBeenCalled())
  expect(created.mock.calls[0][0].recipe.grind_hint).toBe('with RDT')
})
