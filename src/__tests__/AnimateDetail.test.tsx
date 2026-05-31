import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AnimateDetail } from '../pages/AnimateDetail'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/animate/${id}`]}>
      <Routes>
        <Route path="/animate/:id" element={<AnimateDetail />} />
        <Route path="/animate" element={<div>Animate Overview</div>} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows boiler title', () => {
  renderDetail('boiler')
  expect(screen.getByText('Boiler Types')).toBeInTheDocument()
})

test('shows v60 title', () => {
  renderDetail('v60')
  expect(screen.getByText('V60 Pour Pattern')).toBeInTheDocument()
})

test('redirects to /animate for unknown id', () => {
  renderDetail('unknown')
  expect(screen.getByText('Animate Overview')).toBeInTheDocument()
})
