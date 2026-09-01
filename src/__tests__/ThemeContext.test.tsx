import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, vi } from 'vitest'
import { ThemeProvider, useTheme } from '../lib/ThemeContext'
import { ThemeToggle } from '../components/ThemeToggle'

function Probe() {
  const { preference, theme } = useTheme()
  return <p data-testid="probe">{preference}/{theme}</p>
}

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
      <Probe />
    </ThemeProvider>,
  )
}

/** matchMedia so stellen, dass das OS Light bzw. Dark meldet. */
function mockSystem(prefersLight: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-color-scheme: light') ? prefersLight : !prefersLight,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  mockSystem(false)
})

test('defaults to dark so nobody lands in the unfinished light theme', () => {
  renderToggle()
  expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark')
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
})

test('choosing light stamps the document and persists', async () => {
  const user = userEvent.setup()
  renderToggle()
  await user.click(screen.getByRole('radio', { name: 'Light' }))
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  expect(localStorage.getItem('espresso-theme')).toBe('light')
})

test('a stored preference wins on the next mount', () => {
  localStorage.setItem('espresso-theme', 'light')
  renderToggle()
  expect(screen.getByTestId('probe')).toHaveTextContent('light/light')
})

test('system resolves against the OS, and keeps system as the preference', async () => {
  const user = userEvent.setup()
  mockSystem(true) // OS steht auf Hell
  renderToggle()
  await user.click(screen.getByRole('radio', { name: 'System' }))
  // Praeferenz bleibt 'system', gerendert wird 'light'.
  expect(screen.getByTestId('probe')).toHaveTextContent('system/light')
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
})

test('data-theme is never left unstamped', async () => {
  const user = userEvent.setup()
  renderToggle()
  for (const name of ['Light', 'System', 'Dark']) {
    await user.click(screen.getByRole('radio', { name }))
    // Ein ungestempelter Zustand wuerde auf die Dark-Werte am :root fallen und
    // in Light eine unlesbare Mischung ergeben.
    expect(document.documentElement.getAttribute('data-theme')).toMatch(/^(light|dark)$/)
  }
})

test('exactly one option reads as selected', async () => {
  const user = userEvent.setup()
  renderToggle()
  await user.click(screen.getByRole('radio', { name: 'Light' }))
  const checked = screen.getAllByRole('radio').filter(r => r.getAttribute('aria-checked') === 'true')
  expect(checked).toHaveLength(1)
  expect(checked[0]).toHaveAccessibleName('Light')
})

test('a garbage stored value falls back to dark instead of stamping junk', () => {
  localStorage.setItem('espresso-theme', 'chartreuse')
  renderToggle()
  expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark')
})
