import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cardClasses, buttonClasses } from '../components/ui'
import { chartColors } from '../utils/chartTheme'

const css = readFileSync(resolve(__dirname, '../index.css'), 'utf-8')

/** Liest einen `--token: wert;`-Eintrag aus genau einem Selektor-Block. */
function tokensOf(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  if (start === -1) throw new Error(`Selector not found in index.css: ${selector}`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  const body = css.slice(open + 1, close)
  const out: Record<string, string> = {}
  // Auf ';' trennen, nicht auf Zeilenumbrueche: mehrteilige Schatten stehen
  // ueber mehrere Zeilen. Whitespace danach zu einem Leerzeichen normalisieren,
  // damit die Formatierung im CSS den Vergleich nicht beeinflusst.
  for (const decl of body.split(';')) {
    const m = decl.match(/\s*(--[\w-]+)\s*:\s*([\s\S]+)/)
    if (m) out[m[1]] = m[2].replace(/\s+/g, ' ').trim()
  }
  return out
}

const dark = tokensOf(":root,\n:root[data-theme='dark']")
const light = tokensOf(":root[data-theme='light']")

/** Die Dark-Werte VOR dem Theme-Umbau (Paket C1a).
 *  Dark muss pixelgleich bleiben — weicht hier etwas ab, ist das ein Bug,
 *  keine Geschmacksfrage. Diese Tabelle nur mit bewusster Design-Entscheidung
 *  anfassen. */
const DARK_BEFORE_C1A: Record<string, string> = {
  '--coffee-bg': '#1c1714',
  '--coffee-surface': '#25201b',
  '--coffee-surface-2': '#33291f',
  '--coffee-accent': '#c9a35e',
  '--coffee-accent-soft': '#d8bd86',
  '--coffee-cream': '#f6efe4',
  '--coffee-text': '#f1e9df',
  '--coffee-muted': '#a89784',
  '--coffee-line': 'rgba(246, 239, 228, 0.10)',
}

test.each(Object.entries(DARK_BEFORE_C1A))(
  'dark token %s is unchanged by the theme refactor',
  (token, expected) => {
    expect(dark[token]).toBe(expected)
  },
)

test('the card gradient ends on the page ground in dark, exactly as before', () => {
  // Frueher: `to-coffee-bg`. Der neue Endpunkt-Token muss in Dark denselben
  // Wert haben, sonst aendert sich der Verlauf sichtbar.
  expect(dark['--coffee-surface-btm']).toBe(dark['--coffee-bg'])
})

test('button ink on accent equals the old text-coffee-bg in dark', () => {
  expect(dark['--coffee-on-accent']).toBe(dark['--coffee-bg'])
})

test('the embossed shadow is byte-identical to the old hardcoded one', () => {
  expect(dark['--coffee-card-shadow']).toBe(
    '0 6px 16px rgba(0, 0, 0, 0.45), inset 0 2px 8px rgba(233, 201, 135, 0.06)',
  )
})

test('the glow shadow is byte-identical to the old hardcoded one', () => {
  expect(dark['--coffee-glow-shadow']).toBe('0 4px 14px rgba(233, 201, 135, 0.35)')
})

test('dark keeps one gold: accent and deco are the same colour', () => {
  // Die Trennung existiert nur, weil das Gold in Light als Textfarbe durchfaellt.
  // In Dark darf sie nichts veraendern.
  expect(dark['--coffee-accent-deco']).toBe(dark['--coffee-accent'])
})

test('dark has no inset on recessed surfaces', () => {
  expect(dark['--coffee-inset-shadow']).toBe('none')
})

test('light defines every token dark defines', () => {
  // Ein nur in Dark definierter Token faellt in Light auf den Dark-Wert zurueck
  // (beide stehen auf :root) — das ergibt genau den unlesbaren Mischzustand.
  expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort())
})

test('light is actually a light palette, not a copy', () => {
  expect(light['--coffee-bg']).not.toBe(dark['--coffee-bg'])
  expect(light['--coffee-text']).not.toBe(dark['--coffee-text'])
})

test('cardClasses and buttonClasses carry no hardcoded colours any more', () => {
  const combined = [cardClasses, buttonClasses('primary'), buttonClasses('glow'), buttonClasses('secondary')].join(' ')
  // Weder Hex noch rgba() duerfen dort stehen — sonst folgt die Stelle keinem Theme.
  expect(combined).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  expect(combined).not.toMatch(/rgba?\(/)
})

test('the card recipe still uses gradient plus shadow (embossed stays)', () => {
  expect(cardClasses).toContain('bg-gradient-to-b')
  expect(cardClasses).toContain('from-coffee-surface')
  expect(cardClasses).toContain('to-coffee-surface-btm')
  expect(cardClasses).toContain('shadow-card')
})

// ── chartTheme.ts muss zu den CSS-Tokens passen ────────────────────────────
// Recharts setzt stroke/fill als SVG-Praesentationsattribut. Dort literale
// Werte zu benutzen ist eine bewusste Entscheidung (Safari auf dem iPhone ist
// fuer var() in Attributen nicht verifiziert) — der Preis ist, dass die Werte
// doppelt stehen. Dieser Test bezahlt ihn: driftet eine Seite, faellt es hier
// auf und nicht erst als schwarzer Text im Chart.
const PAIRS: [keyof ReturnType<typeof chartColors>, string][] = [
  ['axis', '--coffee-muted'],
  ['grid', '--coffee-surface-2'],
  ['emptyBar', '--coffee-surface-2'],
  ['bar', '--coffee-accent-deco'],
]

test.each(PAIRS)('dark chart colour %s matches %s', (key, token) => {
  expect(chartColors('dark')[key]).toBe(dark[token])
})

test.each(PAIRS)('light chart colour %s matches %s', (key, token) => {
  expect(chartColors('light')[key]).toBe(light[token])
})

test('chart colours are literal, never var() — SVG attributes need real values', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const value of Object.values(chartColors(theme))) {
      expect(value).not.toContain('var(')
    }
  }
})

// ── Marketing folgt demselben Theme (Paket C4) ─────────────────────────────
test('the hero ambient glow is a token, not a hardcoded gradient', () => {
  // Ohne Token bliebe der goldene Schein auch in Light stehen und wuerde dort
  // zum gelben Fleck auf hellem Grund.
  expect(dark['--coffee-hero-glow']).toContain('radial-gradient')
  expect(light['--coffee-hero-glow']).toContain('radial-gradient')
  expect(light['--coffee-hero-glow']).not.toBe(dark['--coffee-hero-glow'])
})

test('no accent surface still paints its label with the page ground', () => {
  // `text-coffee-bg` war in Dark zufaellig richtig (bg == on-accent), in Light
  // waere es hellbeige Schrift auf braunem Button gewesen. Der Token
  // --coffee-on-accent macht die Rolle explizit.
  const src = readFileSync(resolve(__dirname, '../components/ui/Button.tsx'), 'utf-8')
  expect(src).toContain('text-coffee-on-accent')
  expect(src).not.toContain('text-coffee-bg')
})
