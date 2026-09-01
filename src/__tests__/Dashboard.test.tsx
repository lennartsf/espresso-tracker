import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'

const shotsMock = vi.fn()
vi.mock('../hooks/useShots', () => ({ useShots: () => shotsMock() }))
vi.mock('../components/ShotCard', () => ({ ShotCard: ({ shot }: any) => <div>shot-{shot.id}</div> }))

// Layout-Hook mocken statt Supabase zu stellen: der Test prueft das Dashboard,
// nicht den Sync. Reconcile und Bedienung haben eigene Tests
// (dashboardWidgets.test.ts).
const layoutMock = vi.fn()
const saveLayout = vi.fn()
vi.mock('../hooks/useDashboardLayout', () => ({
  useDashboardLayout: () => layoutMock(),
  useSaveDashboardLayout: () => ({ mutate: saveLayout, isPending: false }),
}))

import { Dashboard } from '../pages/Dashboard'
import { ThemeProvider } from '../lib/ThemeContext'
import { DEFAULT_LAYOUT } from '../utils/dashboardWidgets'

// ThemeProvider ist Pflicht: Dashboard liest das Theme fuer die Chart-Farben.
// useTheme wirft ausserhalb des Providers absichtlich — das faengt eine
// vergessene Einbindung in der App, nicht erst im Browser.
const renderDash = () =>
  render(<ThemeProvider><MemoryRouter><Dashboard /></MemoryRouter></ThemeProvider>)
const now = new Date().toISOString() // this week

beforeEach(() => {
  layoutMock.mockReturnValue({ data: DEFAULT_LAYOUT })
  saveLayout.mockClear()
})

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

// ── Anpassbares Dashboard (Paket C3) ────────────────────────────────────────

test('a hidden widget is not rendered', () => {
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  layoutMock.mockReturnValue({
    data: DEFAULT_LAYOUT.map(e => (e.id === 'shots-per-day' ? { ...e, visible: false } : e)),
  })
  renderDash()
  expect(screen.queryByText('Shots per day')).not.toBeInTheDocument()
  expect(screen.getByText(/Ø Brew Ratio/i)).toBeInTheDocument()
})

test('the stored order decides the order on screen', () => {
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  layoutMock.mockReturnValue({
    data: [
      { id: 'shots-per-day', visible: true },
      { id: 'ratio-bar', visible: true },
      { id: 'flavor-dial', visible: true },
      { id: 'week-shots', visible: true },
    ],
  })
  renderDash()
  const rendered = screen.getByText('Shots per day').compareDocumentPosition(
    screen.getByText(/Ø Brew Ratio/i),
  )
  // Node.DOCUMENT_POSITION_FOLLOWING === 4 → Ratio steht NACH Shots per day.
  expect(rendered & 4).toBeTruthy()
})

test('hiding the shot list removes its heading too', () => {
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  layoutMock.mockReturnValue({
    data: DEFAULT_LAYOUT.map(e => (e.id === 'week-shots' ? { ...e, visible: false } : e)),
  })
  renderDash()
  expect(screen.queryByText(/This week's shots/i)).not.toBeInTheDocument()
})

test('the arrange button opens the editor and saving goes through the hook', async () => {
  const { default: userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  renderDash()

  await user.click(screen.getByRole('button', { name: /arrange dashboard/i }))
  expect(screen.getByText(/Arrange dashboard/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /hide ø flavor dial/i }))
  expect(saveLayout).toHaveBeenCalledTimes(1)
  const next = saveLayout.mock.calls[0][0]
  expect(next.find((e: any) => e.id === 'flavor-dial').visible).toBe(false)
})
