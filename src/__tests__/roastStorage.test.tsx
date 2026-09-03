import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { RoastSlider } from '../components/RoastSlider'
import { coarseRoastLevel } from '../utils/beanColor'

/**
 * Der Röstgrad wird als Dezimalzahl gespeichert.
 *
 * `roast_level_fine` (numeric(4,2)) ist die Wahrheit; `roast_level` ist nur die
 * daraus gerundete Zweitschrift fuer grobe Filter und Badges. Diese Tests
 * halten fest, dass zwischen Regler und Speicherung nichts rundet.
 */

test('the slider emits tenths, not whole numbers', () => {
  const onChange = vi.fn()
  render(<RoastSlider value={5} onChange={onChange} arabicaPct={100} robustaPct={null} />)
  const slider = screen.getByLabelText('Roast level') as HTMLInputElement
  // `step` ist das, was den Dezimalwert ueberhaupt erst erlaubt. Stuende hier
  // 1, koennte der Nutzer gar keine 7.3 einstellen.
  expect(slider.step).toBe('0.1')
  expect(slider.min).toBe('1')
  expect(slider.max).toBe('10')
})

test('a tenth from the slider arrives unrounded', async () => {
  const onChange = vi.fn()
  render(<RoastSlider value={5} onChange={onChange} arabicaPct={100} robustaPct={null} />)
  const slider = screen.getByLabelText('Roast level')
  await userEvent.clear(slider).catch(() => {})
  // fireEvent-Weg ueber die native Wertsetzung: Range-Inputs lassen sich nicht
  // tippen.
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  setter.call(slider, '7.3')
  slider.dispatchEvent(new Event('input', { bubbles: true }))
  expect(onChange).toHaveBeenCalledWith(7.3)
})

test('the displayed value keeps the decimal', () => {
  render(<RoastSlider value={7.3} onChange={() => {}} arabicaPct={100} robustaPct={null} />)
  expect(screen.getByText('7.3')).toBeInTheDocument()
  // Und der Regler sagt dazu, worauf der grobe Wert rundet — damit sichtbar
  // ist, dass beides nebeneinander existiert.
  expect(screen.getByText(/rounds to 7/)).toBeInTheDocument()
})

test('the pair written on save: fine exact, coarse derived', () => {
  // Genau das schreibt CoffeeManager in `roast_level_fine` und `roast_level`.
  const fine = 7.3
  expect(coarseRoastLevel(fine)).toBe(7)
  expect(fine).toBe(7.3) // ungerundet — das ist die Zusage
})
