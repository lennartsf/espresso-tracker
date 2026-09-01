import { render, screen } from '@testing-library/react'
import { CoffeeBean } from '../components/CoffeeBean'

test('a blend renders two beans, a single variety one', () => {
  const { container, unmount } = render(<CoffeeBean roastLevel={6} arabicaPct={70} robustaPct={30} />)
  // Pro Bohne genau ein Koerper-Verlauf.
  expect(container.querySelectorAll('radialGradient[id^="body-"]')).toHaveLength(2)
  unmount()
  const { container: single } = render(<CoffeeBean roastLevel={6} arabicaPct={100} robustaPct={null} />)
  expect(single.querySelectorAll('radialGradient[id^="body-"]')).toHaveLength(1)
})

test('the accessible name states species and roast level', () => {
  render(<CoffeeBean roastLevel={7.3} arabicaPct={100} robustaPct={null} />)
  expect(screen.getByRole('img')).toHaveAccessibleName('Arabica bean, roast level 7.3 of 10')
})

test('a blend names both species', () => {
  render(<CoffeeBean roastLevel={5} arabicaPct={60} robustaPct={40} />)
  expect(screen.getByRole('img')).toHaveAccessibleName(/Arabica and Robusta bean/)
})

test('no roast level renders a mid-roast bean instead of nothing', () => {
  render(<CoffeeBean roastLevel={null} arabicaPct={100} robustaPct={null} />)
  expect(screen.getByRole('img')).toHaveAccessibleName(/roast level 5.0 of 10/)
})

test('gradient ids are unique per bean so two beans do not share one fill', () => {
  // Gleiche IDs im selben Dokument → beide Bohnen bekaemen denselben Verlauf.
  const { container } = render(<CoffeeBean roastLevel={6} arabicaPct={70} robustaPct={30} />)
  const ids = [...container.querySelectorAll('radialGradient')].map(g => g.id)
  expect(new Set(ids).size).toBe(ids.length)
})
