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

test('zeigt alle 6 Guide-Karten', () => {
  renderGuide()
  expect(screen.getByText('Espresso')).toBeInTheDocument()
  expect(screen.getByText('French Press')).toBeInTheDocument()
  expect(screen.getByText('V60')).toBeInTheDocument()
  expect(screen.getByText('AeroPress')).toBeInTheDocument()
  expect(screen.getByText('Moka Pot')).toBeInTheDocument()
  expect(screen.getByText('Milch')).toBeInTheDocument()
})

test('Espresso-Karte verlinkt zu /guide/espresso', () => {
  renderGuide()
  const links = screen.getAllByRole('link')
  const espressoLink = links.find(l => l.getAttribute('href') === '/guide/espresso')
  expect(espressoLink).toBeTruthy()
})

test('jede Karte zeigt Quick-Problem-Chips', () => {
  renderGuide()
  expect(screen.getByText('Zu sauer?')).toBeInTheDocument()
  expect(screen.getByText('Zu trüb?')).toBeInTheDocument()
})
