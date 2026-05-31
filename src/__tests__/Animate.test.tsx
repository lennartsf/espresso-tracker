import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Animate } from '../pages/Animate'

test('shows all 4 animation cards', () => {
  render(<MemoryRouter><Animate /></MemoryRouter>)
  expect(screen.getByText('Boiler Types')).toBeInTheDocument()
  expect(screen.getByText('V60 Pour Pattern')).toBeInTheDocument()
  expect(screen.getByText('Milk Steaming')).toBeInTheDocument()
  expect(screen.getByText('Latte Art Heart')).toBeInTheDocument()
})

test('each card links to correct animate route', () => {
  render(<MemoryRouter><Animate /></MemoryRouter>)
  const links = screen.getAllByRole('link')
  expect(links.find(l => l.getAttribute('href') === '/animate/boiler')).toBeTruthy()
  expect(links.find(l => l.getAttribute('href') === '/animate/latte-heart')).toBeTruthy()
})
