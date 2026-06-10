import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const shotsMock = vi.fn()
const brewsMock = vi.fn()
vi.mock('../hooks/useShots', () => ({ useShots: () => shotsMock() }))
vi.mock('../hooks/useBrews', () => ({ useBrews: () => brewsMock() }))
vi.mock('../components/ShotCard', () => ({ ShotCard: ({ shot }: any) => <div>shot-{shot.id}</div> }))
vi.mock('../components/BrewCard', () => ({ BrewCard: ({ brew }: any) => <div>brew-{brew.id}</div> }))

import { Dashboard } from '../pages/Dashboard'

const renderDash = () => render(<MemoryRouter><Dashboard /></MemoryRouter>)

beforeEach(() => {
  brewsMock.mockReturnValue({ data: [] })
})

test('renders gauge, scatter and recent shots with data', () => {
  shotsMock.mockReturnValue({
    data: [
      { id: 'a', rating: 8, brew_ratio: 2.04 },
      { id: 'b', rating: 7, brew_ratio: 1.7 },
    ],
    isLoading: false,
  })
  renderDash()
  expect(screen.getByText('Ø Flavor')).toBeInTheDocument()
  expect(screen.getByText('Ratio × Flavor')).toBeInTheDocument()
  expect(screen.getByText('shot-a')).toBeInTheDocument()
})

test('shows empty state when no shots', () => {
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  renderDash()
  expect(screen.getByText(/your first pull awaits/i)).toBeInTheDocument()
  expect(screen.getByText(/log shots to see how ratio shapes flavor/i)).toBeInTheDocument()
})
