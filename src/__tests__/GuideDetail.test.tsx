import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GuideDetail } from '../pages/GuideDetail'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/guide/${id}`]}>
      <Routes>
        <Route path="/guide/:id" element={<GuideDetail />} />
        <Route path="/guide" element={<div>Guide Overview</div>} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows title and icon of Espresso guide', () => {
  renderDetail('espresso')
  expect(screen.getByText('Espresso')).toBeInTheDocument()
  expect(screen.getByText('Extraction · Troubleshooting')).toBeInTheDocument()
})

test('shows quick chips for Espresso', () => {
  renderDetail('espresso')
  expect(screen.getByText('Too sour?')).toBeInTheDocument()
  expect(screen.getByText('Too bitter?')).toBeInTheDocument()
})

test('shows step by step for Espresso', () => {
  renderDetail('espresso')
  expect(screen.getByText('Prepare grinder')).toBeInTheDocument()
  expect(screen.getByText('Dose')).toBeInTheDocument()
})

test('troubleshooting items are collapsed by default', () => {
  renderDetail('espresso')
  expect(screen.queryByText(/Under-extraction/)).not.toBeInTheDocument()
})

test('opens accordion item on click', async () => {
  renderDetail('espresso')
  const user = userEvent.setup()
  await user.click(screen.getByText('Espresso too sour / astringent'))
  expect(screen.getByText(/Under-extraction/)).toBeInTheDocument()
})

test('closes open accordion item on second click', async () => {
  renderDetail('espresso')
  const user = userEvent.setup()
  const item = screen.getByText('Espresso too sour / astringent')
  await user.click(item)
  await user.click(item)
  expect(screen.queryByText(/Under-extraction/)).not.toBeInTheDocument()
})

test('opens only one accordion item at a time', async () => {
  renderDetail('espresso')
  const user = userEvent.setup()
  await user.click(screen.getByText('Espresso too sour / astringent'))
  await user.click(screen.getByText('Espresso too bitter / burnt'))
  expect(screen.queryByText(/Under-extraction/)).not.toBeInTheDocument()
  expect(screen.getByText(/Over-extraction/)).toBeInTheDocument()
})

test('redirects to /guide for unknown id', () => {
  renderDetail('unknown')
  expect(screen.getByText('Guide Overview')).toBeInTheDocument()
})

test('renders all 6 guides without error', () => {
  const ids = ['espresso', 'french-press', 'v60', 'aeropress', 'moka-pot', 'milch']
  for (const id of ids) {
    const { unmount } = renderDetail(id)
    expect(document.body).toBeTruthy()
    unmount()
  }
})
