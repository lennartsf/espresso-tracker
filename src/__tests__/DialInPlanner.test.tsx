import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DialInPlanner } from '../components/DialInPlanner'

const coffee = { id: 'c1', name: 'Bean', roaster: 'R', rec_dose_g: null, rec_yield_g: null, rec_temp_c: null, rec_time_s: null }

/** Saubere Serie: -2 s pro Klick um den Arbeitspunkt 14 / 30 s. */
const shots = [
  { grind_setting: 14, brew_time_s: 30, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
  { grind_setting: 12, brew_time_s: 34, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
  { grind_setting: 13, brew_time_s: 32, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
  { grind_setting: 15, brew_time_s: 28, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
  { grind_setting: 16, brew_time_s: 26, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b1' },
  // Dieselbe Bohne im zweiten Sieb, durchgehend 5 s langsamer.
  { grind_setting: 14, brew_time_s: 35, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b2' },
  { grind_setting: 15, brew_time_s: 33, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b2' },
  { grind_setting: 16, brew_time_s: 31, coffee_id: 'c1', grinder_id: 'g1', basket_id: 'b2' },
]

vi.mock('../hooks/useCoffees', () => ({ useCoffees: () => ({ data: [coffee] }) }))
vi.mock('../hooks/useShots', () => ({ useShots: () => ({ data: shots }) }))
vi.mock('../hooks/useEquipment', () => ({
  useGrinders: () => ({ data: [{ id: 'g1', name: 'Niche' }] }),
  useBaskets: () => ({ data: [
    { id: 'b1', name: 'Stock', size_g: 18 },
    { id: 'b2', name: 'VST', size_g: 20 },
  ] }),
}))
vi.mock('../hooks/useCoffeeRecipes', () => ({
  useCoffeeRecipes: () => ({ data: [
    { id: 'r1', name: 'My standard', dose_g: 18, yield_g: 36, temp_c: 93, time_s: 34,
      grinder_id: 'g1', grind_setting: 12 },
  ] }),
}))

async function pickCoffeeAndRecipe() {
  const user = userEvent.setup()
  render(<DialInPlanner />)
  await user.selectOptions(screen.getByLabelText('Coffee'), 'c1')
  await user.selectOptions(screen.getByLabelText('Target recipe'), 'r1')
  return user
}

test('asks for a coffee before saying anything', () => {
  render(<DialInPlanner />)
  expect(screen.getByText(/Pick a coffee and a target recipe/)).toBeInTheDocument()
})

test('works out a grind setting for the chosen target', async () => {
  await pickCoffeeAndRecipe()
  // Letzter Shot: 14 bei 30 s. Ziel 34 s, -2 s/Klick -> 2 Klicks feiner = 12.
  expect(screen.getByText('12')).toBeInTheDocument()
})

test('shows the target the number is aiming at', async () => {
  await pickCoffeeAndRecipe()
  expect(screen.getByText('18 g')).toBeInTheDocument()
  expect(screen.getByText('34s')).toBeInTheDocument()
})

test('measures what each basket does, in seconds and in grind steps', async () => {
  await pickCoffeeAndRecipe()
  expect(screen.getByText(/What your baskets do/)).toBeInTheDocument()
  // b2 laeuft rund 5 s langsamer als b1; bei 2 s/Klick sind das ~2.5 Klicks.
  // Ausgewiesen wird die Abweichung vom Mittel, die Spanne betraegt also ~5 s.
  const rows = screen.getAllByText(/steps\)/)
  expect(rows.length).toBe(2)
})

test('the basket is part of the calculation, not decoration', async () => {
  const user = await pickCoffeeAndRecipe()
  await user.selectOptions(screen.getByLabelText('Basket'), 'b2')
  expect(screen.getByText('Same basket as your last shot')).toBeInTheDocument()
})

test('the derivation is available but folded away', async () => {
  const user = await pickCoffeeAndRecipe()
  expect(screen.queryByText(/Learned slope/)).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /How this is worked out/ }))
  expect(screen.getByText(/Learned slope/)).toBeInTheDocument()
  // Die gelernte Steigung wird beziffert, nicht behauptet.
  expect(screen.getByText(/-2\.00 s per step/)).toBeInTheDocument()
})

test('lists the step size per basket, because flow differs between them', async () => {
  await pickCoffeeAndRecipe()
  expect(screen.getByText(/Step size per basket/)).toBeInTheDocument()
  // Das Stock-Sieb hat genug Shots fuer eine eigene Steigung...
  expect(screen.getByText('-2.00 s/step')).toBeInTheDocument()
  // ...das VST nicht. Das gehoert dann auch so dagestanden, statt still eine
  // fremde Zahl zu uebernehmen.
  expect(screen.getByText('not enough shots yet')).toBeInTheDocument()
})

test('says when the step size had to be pooled across baskets', async () => {
  const user = await pickCoffeeAndRecipe()
  await user.selectOptions(screen.getByLabelText('Basket'), 'b2')
  await user.click(screen.getByRole('button', { name: /How this is worked out/ }))
  expect(screen.getByText(/all baskets pooled/)).toBeInTheDocument()
})

test('names the basket when the slope came from that basket alone', async () => {
  const user = await pickCoffeeAndRecipe()
  await user.selectOptions(screen.getByLabelText('Basket'), 'b1')
  await user.click(screen.getByRole('button', { name: /How this is worked out/ }))
  expect(screen.getByText('Stock only')).toBeInTheDocument()
})
