import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { RatingInput } from '../components/RatingInput'
import { ThemeProvider } from '../lib/ThemeContext'
import { ratingHex, ratingInk } from '../utils/ratingColor'

function renderInput(props: Parameters<typeof RatingInput>[0]) {
  return render(<ThemeProvider><RatingInput {...props} /></ThemeProvider>)
}

/** `style.backgroundColor` kommt aus jsdom als `rgb(r, g, b)` zurueck. */
function toRgb(hex: string): string {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}

describe('RatingInput', () => {
  test('renders 10 buttons labelled 1–10', () => {
    renderInput({ value: null, onChange: () => {}, scale: 'quality' })
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument()
    }
  })

  test('calls onChange with the clicked number', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderInput({ value: null, onChange, scale: 'quality' })
    await user.click(screen.getByRole('button', { name: '7' }))
    expect(onChange).toHaveBeenCalledWith(7)
  })

  test('the quality scale fills the selected step with its rating colour', () => {
    renderInput({ value: 9, onChange: () => {}, scale: 'quality' })
    const picked = screen.getByRole('button', { name: '9' })
    // Das war der Fehler: die Auswahl trug den Marken-Akzent und sah bei einer
    // 2 genauso aus wie bei einer 9 — die Bewertung war nicht ablesbar.
    expect(picked).toHaveStyle({ backgroundColor: toRgb(ratingHex(9)) })
    expect(picked).toHaveStyle({ color: toRgb(ratingInk(9)) })
  })

  test('the ends of the quality scale differ in colour', () => {
    const { unmount } = renderInput({ value: 1, onChange: () => {}, scale: 'quality' })
    const low = screen.getByRole('button', { name: '1' }).getAttribute('style')
    unmount()
    renderInput({ value: 10, onChange: () => {}, scale: 'quality' })
    const high = screen.getByRole('button', { name: '10' }).getAttribute('style')
    expect(low).not.toEqual(high)
  })

  test('the intensity scale does NOT use the red→green ramp', () => {
    renderInput({ value: 2, onChange: () => {}, scale: 'intensity' })
    const picked = screen.getByRole('button', { name: '2' })
    // Eine rote 2 bei „Bitterness" hiesse „schlecht"; gemeint ist „wenig".
    expect(picked).not.toHaveStyle({ backgroundColor: toRgb(ratingHex(2)) })
  })

  test('only the selected step is marked pressed', () => {
    renderInput({ value: 5, onChange: () => {}, scale: 'quality' })
    const pressed = screen.getAllByRole('button').filter(b => b.getAttribute('aria-pressed') === 'true')
    expect(pressed).toHaveLength(1)
    expect(pressed[0]).toHaveTextContent('5')
  })

  test('unselected steps stay on the neutral field colour', () => {
    renderInput({ value: 5, onChange: () => {}, scale: 'quality' })
    expect(screen.getByRole('button', { name: '3' })).toHaveClass('bg-coffee-surface2')
    expect(screen.getByRole('button', { name: '3' })).not.toHaveAttribute('style')
  })
})
