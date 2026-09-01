import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  ThemeProvider, useTheme, DEFAULT_PREFERENCE, resolveTheme,
} from '../lib/ThemeContext'
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

test('defaults to light', () => {
  renderToggle()
  expect(screen.getByTestId('probe')).toHaveTextContent('light/light')
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
})

test('the default ignores a dark OS — it is a choice, not a suggestion', () => {
  // Ein fester Default legt den ersten Eindruck fest. Wer das nicht will,
  // waehlt in den Einstellungen 'System'.
  mockSystem(false) // OS steht auf Dunkel
  renderToggle()
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
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

test('a garbage stored value falls back to the default instead of stamping junk', () => {
  localStorage.setItem('espresso-theme', 'chartreuse')
  mockSystem(false)
  renderToggle()
  expect(screen.getByTestId('probe')).toHaveTextContent('light/light')
})

test('a stored dark preference still wins over the light default', () => {
  // Der Default ist nur der Anfangswert; die eigene Wahl schlaegt ihn.
  localStorage.setItem('espresso-theme', 'dark')
  renderToggle()
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
})

// ── Das Inline-Skript in index.html ─────────────────────────────────────────

test('the pre-paint script in index.html uses the SAME default', () => {
  // Die Logik ist bewusst dupliziert: sie muss vor dem ersten Paint laufen,
  // also ohne Bundle. Der Preis ist, dass die beiden Defaults auseinander-
  // laufen koennen — und zwar lautlos: die Seite wuerde im einen Theme
  // aufblitzen und ins andere springen, ohne dass irgendwo ein Fehler
  // entsteht. Deshalb wird hier die HTML-Datei selbst gelesen.
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8')

  const fallback = html.match(/localStorage\.getItem\('espresso-theme'\)\s*\|\|\s*'(\w+)'/)
  expect(fallback?.[1]).toBe(DEFAULT_PREFERENCE)

  // Auch das statische Attribut am <html> ist ein Fallback — es bleibt stehen,
  // wenn localStorage blockiert ist und das Skript in den catch laeuft.
  const stamped = html.match(/<html[^>]*data-theme="(\w+)"/)
  expect(stamped?.[1]).toBe(resolveTheme(DEFAULT_PREFERENCE))
})

test('the theme-color meta matches the default theme', () => {
  // Sonst haette die iOS-PWA beim Start einen Balken in der falschen Farbe.
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8')
  const meta = html.match(/<meta name="theme-color" content="(#[0-9a-f]{6})"/)!
  const css = readFileSync(resolve(__dirname, '../index.css'), 'utf-8')
  const light = css.match(/\[data-theme='light'\][^}]*?--coffee-bg:\s*(#[0-9a-f]{6})/s)!
  expect(meta[1]).toBe(light[1])
})
