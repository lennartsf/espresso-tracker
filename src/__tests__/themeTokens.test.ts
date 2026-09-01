import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cardClasses, buttonClasses } from '../components/ui'
import { chartColors } from '../utils/chartTheme'

// Kommentare RAUS, bevor irgendetwas geparst wird: in einem Kommentar wie
// "Kraeftiger als --coffee-line: ..." sieht der Deklarations-Regex sonst den
// Namen aus dem Kommentar und ordnet ihm den Rest des Blocks als Wert zu — das
// echte Token dahinter faellt still unter den Tisch. Genau dieser Fall hat den
// Test einmal falsch anschlagen lassen.
const css = readFileSync(resolve(__dirname, '../index.css'), 'utf-8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

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

/** Die Dark-Werte, wie sie seit dem Kontrast-Durchgang vom 2026-09-01 gelten.
 *
 *  Bis dahin stand hier die Tabelle „vor Paket C1a" mit der Zusage, Dark bleibe
 *  pixelgleich. Die Zusage war für die Zeit gedacht, in der Light nachgerüstet
 *  wurde — sie ist bewusst aufgehoben worden, weil die alten Flächen zwei
 *  gemessene Schwächen hatten (zu enge Abstände, Kollision mit der Bohnenfarbe;
 *  Herleitung im Kopf von src/index.css).
 *
 *  Diese Tabelle bleibt trotzdem nützlich: sie fängt VERSEHENTLICHE Änderungen.
 *  Wer sie anfasst, trifft eine Design-Entscheidung — und muss die
 *  Eigenschafts-Tests darunter mitlaufen lassen, die den eigentlichen Grund
 *  prüfen statt der Ziffern. */
const DARK_TOKENS: Record<string, string> = {
  '--coffee-bg': '#171412',
  '--coffee-surface': '#26221e',
  '--coffee-surface-2': '#38312b',
  '--coffee-accent': '#c9a35e',
  '--coffee-accent-soft': '#d8bd86',
  '--coffee-cream': '#f6efe4',
  '--coffee-text': '#f1e9df',
  '--coffee-muted': '#b0a08d',
  '--coffee-line': 'rgba(246, 239, 228, 0.14)',
}

test.each(Object.entries(DARK_TOKENS))(
  'dark token %s has its agreed value',
  (token, expected) => {
    expect(dark[token]).toBe(expected)
  },
)

// ── Warum die Flächen so liegen ─────────────────────────────────────────────

function srgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
function relLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => srgbToLinear(parseInt(h.slice(i, i + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** Wahrgenommene Helligkeit. Nahe Schwarz ist das WCAG-Verhältnis als Maß
 *  unbrauchbar — der +0.05-Term staucht dort alles auf ~1.1:1 zusammen,
 *  obwohl der Unterschied deutlich sichtbar ist. L* misst, was das Auge tut. */
function lStar(hex: string): number {
  const y = relLuminance(hex)
  return y > 216 / 24389 ? 116 * y ** (1 / 3) - 16 : (y * 24389) / 27
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

test('the dark surfaces are far enough apart to read as layers', () => {
  // Das war der eigentliche Mangel: bg→surface und surface→surface-2 lagen bei
  // ~4.4 bzw. ~4.8 L*. Karten hoben sich kaum vom Seitengrund ab. Ab etwa 6 L*
  // liest sich der Wechsel als eigene Ebene.
  const bg = lStar(dark['--coffee-bg'])
  const surface = lStar(dark['--coffee-surface'])
  const surface2 = lStar(dark['--coffee-surface-2'])
  expect(surface - bg).toBeGreaterThanOrEqual(6)
  expect(surface2 - surface).toBeGreaterThanOrEqual(6)
})

test.each(['--coffee-text', '--coffee-cream', '--coffee-muted', '--coffee-accent-soft'])(
  'dark %s stays readable on BOTH dark surfaces',
  token => {
    // Die Flächen sind heller geworden. Ohne diesen Test könnte eine spätere
    // Aufhellung den gedämpften Text unter 4.5:1 drücken, ohne dass irgendwo
    // ein Fehler entsteht.
    expect(contrast(dark[token], dark['--coffee-surface'])).toBeGreaterThanOrEqual(4.5)
    expect(contrast(dark[token], dark['--coffee-surface-2'])).toBeGreaterThanOrEqual(4.5)
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
