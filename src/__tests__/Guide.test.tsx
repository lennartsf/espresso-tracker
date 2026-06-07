import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Guide } from '../pages/Guide'

function renderGuide() {
  return render(
    <MemoryRouter>
      <Guide />
    </MemoryRouter>
  )
}

test('shows all 6 guide cards', () => {
  renderGuide()
  expect(screen.getByText('Espresso')).toBeInTheDocument()
  expect(screen.getByText('French Press')).toBeInTheDocument()
  expect(screen.getByText('V60')).toBeInTheDocument()
  expect(screen.getByText('AeroPress')).toBeInTheDocument()
  expect(screen.getByText('Moka Pot')).toBeInTheDocument()
  expect(screen.getByText('Milk')).toBeInTheDocument()
})

test('Espresso card links to /app/guide/espresso', () => {
  renderGuide()
  const links = screen.getAllByRole('link')
  const espressoLink = links.find(l => l.getAttribute('href') === '/app/guide/espresso')
  expect(espressoLink).toBeTruthy()
})

test('each card shows quick problem chips', () => {
  renderGuide()
  expect(screen.getByText('Too sour?')).toBeInTheDocument()
  expect(screen.getByText('Too cloudy?')).toBeInTheDocument()
})
