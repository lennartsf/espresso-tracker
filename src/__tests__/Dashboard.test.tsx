import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const shotsMock = vi.fn()
vi.mock('../hooks/useShots', () => ({ useShots: () => shotsMock() }))
vi.mock('../components/ShotCard', () => ({ ShotCard: ({ shot }: any) => <div>shot-{shot.id}</div> }))

import { Dashboard } from '../pages/Dashboard'

const renderDash = () => render(<MemoryRouter><Dashboard /></MemoryRouter>)
const now = new Date().toISOString() // this week

test('renders weekly cockpit with this week shots', () => {
  shotsMock.mockReturnValue({
    data: [
      { id: 'a', rating: 8, brew_ratio: 2.04, pulled_at: now, created_at: now },
      { id: 'b', rating: 7, brew_ratio: 1.7, pulled_at: now, created_at: now },
    ],
    isLoading: false,
  })
  renderDash()
  expect(screen.getByText(/Ø Flavor/)).toBeInTheDocument()
  expect(screen.getByText('Shots per day')).toBeInTheDocument()
  expect(screen.getByText(/KW \d+/)).toBeInTheDocument()
  expect(screen.getByText('shot-a')).toBeInTheDocument()
})

test('shows empty state when no shots this week', () => {
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  renderDash()
  expect(screen.getByText(/your first pull awaits/i)).toBeInTheDocument()
})
