import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { GuideDetail } from '../pages/GuideDetail'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/guide/${id}`]}>
      <Routes>
        <Route path="/guide/:id" element={<GuideDetail />} />
        <Route path="/guide" element={<div>Guide Übersicht</div>} />
      </Routes>
    </MemoryRouter>
  )
}

test('zeigt Titel und Icon des Espresso-Guides', () => {
  renderDetail('espresso')
  expect(screen.getByText('Espresso')).toBeInTheDocument()
  expect(screen.getByText('Extraktion · Troubleshooting')).toBeInTheDocument()
})

test('zeigt Quick-Chips für Espresso', () => {
  renderDetail('espresso')
  expect(screen.getByText('Zu sauer?')).toBeInTheDocument()
  expect(screen.getByText('Zu bitter?')).toBeInTheDocument()
})

test('zeigt Schritt-für-Schritt für Espresso', () => {
  renderDetail('espresso')
  expect(screen.getByText('Mühle vorbereiten')).toBeInTheDocument()
  expect(screen.getByText('Dosieren')).toBeInTheDocument()
})

test('Troubleshooting-Items sind initial zugeklappt', () => {
  renderDetail('espresso')
  expect(screen.queryByText(/Unterextraktion/)).not.toBeInTheDocument()
})

test('öffnet Akkordeon-Item beim Klick', async () => {
  renderDetail('espresso')
  const user = userEvent.setup()
  await user.click(screen.getByText('Espresso zu sauer / adstringierend'))
  expect(screen.getByText(/Unterextraktion/)).toBeInTheDocument()
})

test('schließt offenes Akkordeon beim zweiten Klick', async () => {
  renderDetail('espresso')
  const user = userEvent.setup()
  const item = screen.getByText('Espresso zu sauer / adstringierend')
  await user.click(item)
  await user.click(item)
  expect(screen.queryByText(/Unterextraktion/)).not.toBeInTheDocument()
})

test('öffnet nur ein Akkordeon-Item gleichzeitig', async () => {
  renderDetail('espresso')
  const user = userEvent.setup()
  await user.click(screen.getByText('Espresso zu sauer / adstringierend'))
  await user.click(screen.getByText('Espresso zu bitter / verbrannt'))
  expect(screen.queryByText(/Unterextraktion/)).not.toBeInTheDocument()
  expect(screen.getByText(/Überextraktion/)).toBeInTheDocument()
})

test('redirectet bei unbekannter ID zu /guide', () => {
  renderDetail('unbekannt')
  expect(screen.getByText('Guide Übersicht')).toBeInTheDocument()
})

test('rendert alle 6 Guides ohne Fehler', () => {
  const ids = ['espresso', 'french-press', 'v60', 'aeropress', 'moka-pot', 'milch']
  for (const id of ids) {
    const { unmount } = renderDetail(id)
    expect(document.body).toBeTruthy()
    unmount()
  }
})
