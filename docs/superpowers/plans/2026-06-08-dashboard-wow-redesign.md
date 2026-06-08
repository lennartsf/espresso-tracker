# Dashboard Wow-Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat Dashboard stat-cards with a "Bento-Cockpit + machine-tactile" layout (glowing dial gauge, liquid ratio bar, ratio×flavor correlation scatter, embossed tiles) that delivers a wow-effect on open.

**Architecture:** New reusable components in `src/components/dashboard/` + a pure math util `src/utils/correlation.ts` + a hex color helper in `src/utils/ratingColor.ts`. `Dashboard.tsx` is rewritten to compose them in a responsive bento grid. Animations via GSAP (existing dep), `prefers-reduced-motion` respected. Functional rating colors stay (now also driving the scatter via `ratingHex`).

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind (`coffee.*` tokens), GSAP (`@gsap/react`), Vitest + React Testing Library. Tests live in `src/__tests__/`.

---

## File Structure

- Create: `src/utils/correlation.ts` — pure math: `pearsonR`, `linearRegression`, `MIN_SHOTS_FOR_CORRELATION`, `hasEnoughForCorrelation`.
- Modify: `src/utils/ratingColor.ts` — add `ratingHex(v)` (hex per 10-step scale, for SVG fills).
- Create: `src/components/dashboard/EmbossedTile.tsx` — tactile surface wrapper.
- Create: `src/components/dashboard/DialGauge.tsx` — circular gauge + glowing value.
- Create: `src/components/dashboard/CorrelationScatter.tsx` — ratio×flavor SVG scatter.
- Create: `src/components/dashboard/LiquidBar.tsx` — gold liquid ratio bar.
- Modify: `src/components/ui/Button.tsx` — add `glow` variant.
- Modify: `src/pages/Dashboard.tsx` — rewrite to bento layout.
- Create tests: `src/__tests__/correlation.test.ts`, extend `src/__tests__/ratingColor.test.ts`, `src/__tests__/EmbossedTile.test.tsx`, `src/__tests__/DialGauge.test.tsx`, `src/__tests__/CorrelationScatter.test.tsx`, `src/__tests__/LiquidBar.test.tsx`, extend/`src/__tests__/ui.test.tsx`, `src/__tests__/Dashboard.test.tsx`.

Test command throughout: `npx vitest run <path>` (single file) or `npx vitest run` (all). Type check: `npx tsc -b`. Build: `npm run build`.

---

### Task 1: `ratingHex` color helper

**Files:**
- Modify: `src/utils/ratingColor.ts`
- Test: `src/__tests__/ratingColor.test.ts`

- [ ] **Step 1: Write the failing test** — append to `src/__tests__/ratingColor.test.ts`:

```ts
import { ratingHex } from '../utils/ratingColor'

test('ratingHex maps the 10-step scale red -> gold -> green', () => {
  expect(ratingHex(1)).toBe('#c0392b')   // low = red
  expect(ratingHex(6)).toBe('#c9a35e')   // mid = coffee gold
  expect(ratingHex(8)).toBe('#6fb16a')   // high = green
  expect(ratingHex(10)).toBe('#4a9657')
})

test('ratingHex falls back to muted for out-of-range', () => {
  expect(ratingHex(0)).toBe('#7a6450')
  expect(ratingHex(11)).toBe('#7a6450')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/ratingColor.test.ts`
Expected: FAIL — `ratingHex` is not exported.

- [ ] **Step 3: Write minimal implementation** — append to `src/utils/ratingColor.ts`:

```ts
/** Hex der 10-stufigen Rating-Skala (rot→gold→grün) — für SVG-fills (Charts). */
export function ratingHex(v: number): string {
  const map: Record<number, string> = {
    1: '#c0392b', 2: '#d4502f', 3: '#e07b39', 4: '#e89c3f', 5: '#d9a441',
    6: '#c9a35e', 7: '#9bbf5a', 8: '#6fb16a', 9: '#57a35f', 10: '#4a9657',
  }
  return map[v] ?? '#7a6450'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/ratingColor.test.ts`
Expected: PASS (all tests in file).

- [ ] **Step 5: Commit**

```bash
git add src/utils/ratingColor.ts src/__tests__/ratingColor.test.ts
git commit -m "feat(util): ratingHex for SVG chart colors"
```

---

### Task 2: `correlation.ts` pure math util

**Files:**
- Create: `src/utils/correlation.ts`
- Test: `src/__tests__/correlation.test.ts`

- [ ] **Step 1: Write the failing test** — create `src/__tests__/correlation.test.ts`:

```ts
import { pearsonR, linearRegression, hasEnoughForCorrelation, MIN_SHOTS_FOR_CORRELATION } from '../utils/correlation'

test('pearsonR is +1 for perfectly positive data', () => {
  expect(pearsonR([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }])).toBeCloseTo(1, 5)
})

test('pearsonR is -1 for perfectly negative data', () => {
  expect(pearsonR([{ x: 1, y: 6 }, { x: 2, y: 4 }, { x: 3, y: 2 }])).toBeCloseTo(-1, 5)
})

test('pearsonR returns 0 for fewer than 2 points or zero variance', () => {
  expect(pearsonR([{ x: 1, y: 2 }])).toBe(0)
  expect(pearsonR([{ x: 1, y: 5 }, { x: 1, y: 9 }])).toBe(0)
})

test('linearRegression returns slope and intercept', () => {
  const r = linearRegression([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }])
  expect(r.slope).toBeCloseTo(2, 5)
  expect(r.intercept).toBeCloseTo(0, 5)
})

test('threshold helper gates on MIN_SHOTS_FOR_CORRELATION', () => {
  expect(MIN_SHOTS_FOR_CORRELATION).toBe(5)
  expect(hasEnoughForCorrelation(4)).toBe(false)
  expect(hasEnoughForCorrelation(5)).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/correlation.test.ts`
Expected: FAIL — module `../utils/correlation` not found.

- [ ] **Step 3: Write minimal implementation** — create `src/utils/correlation.ts`:

```ts
export interface Point { x: number; y: number }

/** Mindestzahl Datenpunkte, ab der Regressionslinie + r gezeigt werden. */
export const MIN_SHOTS_FOR_CORRELATION = 5

export function hasEnoughForCorrelation(n: number): boolean {
  return n >= MIN_SHOTS_FOR_CORRELATION
}

/** Pearson-Korrelationskoeffizient. 0 bei <2 Punkten oder Null-Varianz. */
export function pearsonR(points: Point[]): number {
  const n = points.length
  if (n < 2) return 0
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  let cov = 0, vx = 0, vy = 0
  for (const p of points) {
    const dx = p.x - mx, dy = p.y - my
    cov += dx * dy; vx += dx * dx; vy += dy * dy
  }
  if (vx === 0 || vy === 0) return 0
  return cov / Math.sqrt(vx * vy)
}

/** Lineare Regression (kleinste Quadrate). slope=0/intercept=Mittel bei Null-Varianz. */
export function linearRegression(points: Point[]): { slope: number; intercept: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: n === 1 ? points[0].y : 0 }
  const mx = points.reduce((s, p) => s + p.x, 0) / n
  const my = points.reduce((s, p) => s + p.y, 0) / n
  let num = 0, den = 0
  for (const p of points) {
    const dx = p.x - mx
    num += dx * (p.y - my); den += dx * dx
  }
  const slope = den === 0 ? 0 : num / den
  return { slope, intercept: my - slope * mx }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/correlation.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/correlation.ts src/__tests__/correlation.test.ts
git commit -m "feat(util): correlation math (pearsonR, regression, threshold)"
```

---

### Task 3: `EmbossedTile` surface wrapper

**Files:**
- Create: `src/components/dashboard/EmbossedTile.tsx`
- Test: `src/__tests__/EmbossedTile.test.tsx`

- [ ] **Step 1: Write the failing test** — create `src/__tests__/EmbossedTile.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { EmbossedTile } from '../components/dashboard/EmbossedTile'

test('renders children inside the tile', () => {
  render(<EmbossedTile>Hello</EmbossedTile>)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})

test('merges extra className', () => {
  render(<EmbossedTile className="col-span-2"><span>x</span></EmbossedTile>)
  expect(screen.getByText('x').parentElement).toHaveClass('col-span-2')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/EmbossedTile.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation** — create `src/components/dashboard/EmbossedTile.tsx`:

```tsx
import type { ReactNode } from 'react'

/** Geprägte Bento-Kachel: Verlauf + Inset-Schatten + Border (tactile look). */
export function EmbossedTile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-coffee-line bg-gradient-to-b from-coffee-surface to-coffee-bg p-4 shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(233,201,135,0.06)] ${className}`.trim()}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/EmbossedTile.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/EmbossedTile.tsx src/__tests__/EmbossedTile.test.tsx
git commit -m "feat(dashboard): EmbossedTile tactile surface"
```

---

### Task 4: `DialGauge` component

**Files:**
- Create: `src/components/dashboard/DialGauge.tsx`
- Test: `src/__tests__/DialGauge.test.tsx`

Design note: ring radius `r=54`, circumference `C=2πr`. Value arc `strokeDashoffset = C*(1 - value/max)`. The value-arc circle carries `data-testid="dial-arc"` for deterministic assertion. The numeric value uses `CountUp` (existing). Label rendered as text.

- [ ] **Step 1: Write the failing test** — create `src/__tests__/DialGauge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { DialGauge } from '../components/dashboard/DialGauge'

const C = 2 * Math.PI * 54

test('renders the label', () => {
  render(<DialGauge value={7.5} max={10} label="Ø Flavor" />)
  expect(screen.getByText('Ø Flavor')).toBeInTheDocument()
})

test('arc dashoffset reflects value/max', () => {
  render(<DialGauge value={7.5} max={10} label="Ø Flavor" />)
  const arc = screen.getByTestId('dial-arc')
  const expected = C * (1 - 7.5 / 10)
  expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(expected, 1)
})

test('clamps and shows empty state for non-finite value', () => {
  render(<DialGauge value={NaN} max={10} label="Ø Flavor" />)
  const arc = screen.getByTestId('dial-arc')
  expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(C, 1) // empty ring
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/DialGauge.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation** — create `src/components/dashboard/DialGauge.tsx`:

```tsx
import { CountUp } from '../CountUp'
import { ratingHex } from '../../utils/ratingColor'

const R = 54
const C = 2 * Math.PI * R

/** Kreis-Gauge in geprägter Mulde mit glühender Wert-Zahl. */
export function DialGauge({
  value, max, label, decimals = 1, color,
}: { value: number; max: number; label: string; decimals?: number; color?: string }) {
  const finite = Number.isFinite(value)
  const pct = finite ? Math.max(0, Math.min(1, value / max)) : 0
  const offset = C * (1 - pct)
  const stroke = color ?? ratingHex(Math.round(value))

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="mb-2 text-[9px] uppercase tracking-[0.2em] text-coffee-muted">{label}</span>
      <div className="relative flex h-[130px] w-[130px] items-center justify-center rounded-full border-2 border-coffee-line bg-[radial-gradient(circle_at_50%_32%,var(--coffee-surface),var(--coffee-bg))] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_3px_8px_rgba(233,201,135,0.2)]">
        <svg width="130" height="130" viewBox="0 0 130 130" className="absolute inset-0">
          <circle cx="65" cy="65" r={R} fill="none" stroke="var(--coffee-line)" strokeWidth="6" />
          <circle
            data-testid="dial-arc"
            cx="65" cy="65" r={R} fill="none" stroke={stroke} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
            transform="rotate(-90 65 65)" style={{ filter: 'drop-shadow(0 0 6px rgba(95,168,105,0.5))' }}
          />
        </svg>
        <div className="text-center">
          <span className="block text-4xl font-extrabold text-coffee-accent-soft drop-shadow-[0_0_16px_rgba(233,201,135,0.5)]">
            <CountUp end={value} decimals={decimals} />
          </span>
          <span className="text-[9px] text-coffee-muted">von {max}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/DialGauge.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/DialGauge.tsx src/__tests__/DialGauge.test.tsx
git commit -m "feat(dashboard): DialGauge gauge ring"
```

---

### Task 5: `CorrelationScatter` component

**Files:**
- Create: `src/components/dashboard/CorrelationScatter.tsx`
- Test: `src/__tests__/CorrelationScatter.test.tsx`

Design note: props `points: { ratio: number; flavor: number; rating: number }[]`. Renders one `<circle data-testid="scatter-point">` per point, `fill={ratingHex(rating)}`. Regression line (`data-testid="regression-line"`) and r-text only when `hasEnoughForCorrelation(points.length)`. Empty state text when `points.length === 0`. The component maps to pixel space internally; tests assert counts/presence, not pixel coords.

- [ ] **Step 1: Write the failing test** — create `src/__tests__/CorrelationScatter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { CorrelationScatter } from '../components/dashboard/CorrelationScatter'

const mk = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ ratio: 1.5 + i * 0.1, flavor: 4 + i, rating: 4 + i }))

test('shows empty state with no points', () => {
  render(<CorrelationScatter points={[]} />)
  expect(screen.getByText(/erfasse shots/i)).toBeInTheDocument()
})

test('renders one point per shot, no regression line below threshold', () => {
  render(<CorrelationScatter points={mk(3)} />)
  expect(screen.getAllByTestId('scatter-point')).toHaveLength(3)
  expect(screen.queryByTestId('regression-line')).toBeNull()
})

test('renders regression line and r-value at/above threshold', () => {
  render(<CorrelationScatter points={mk(5)} />)
  expect(screen.getAllByTestId('scatter-point')).toHaveLength(5)
  expect(screen.getByTestId('regression-line')).toBeInTheDocument()
  expect(screen.getByText(/r =/i)).toBeInTheDocument()
})

test('point fill comes from ratingHex', () => {
  render(<CorrelationScatter points={[{ ratio: 2, flavor: 8, rating: 8 }]} />)
  expect(screen.getByTestId('scatter-point').getAttribute('fill')).toBe('#6fb16a')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/CorrelationScatter.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation** — create `src/components/dashboard/CorrelationScatter.tsx`:

```tsx
import { ratingHex } from '../../utils/ratingColor'
import { pearsonR, linearRegression, hasEnoughForCorrelation } from '../../utils/correlation'

export interface ScatterPoint { ratio: number; flavor: number; rating: number }

// pixel plot box
const X0 = 30, X1 = 252, Y0 = 10, Y1 = 100
const RATIO_MIN = 1.2, RATIO_MAX = 2.8, FLAVOR_MIN = 1, FLAVOR_MAX = 10

const sx = (r: number) => X0 + ((r - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * (X1 - X0)
const sy = (f: number) => Y1 - ((f - FLAVOR_MIN) / (FLAVOR_MAX - FLAVOR_MIN)) * (Y1 - Y0)

/** Scatter Brew-Ratio (x) × Geschmack (y). Punktfarbe = ratingHex. */
export function CorrelationScatter({ points }: { points: ScatterPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-coffee-muted">
        Erfasse Shots, um Muster zwischen Verhältnis und Geschmack zu sehen.
      </div>
    )
  }

  const enough = hasEnoughForCorrelation(points.length)
  const mathPoints = points.map(p => ({ x: p.ratio, y: p.flavor }))
  const r = enough ? pearsonR(mathPoints) : 0
  const { slope, intercept } = enough ? linearRegression(mathPoints) : { slope: 0, intercept: 0 }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wide text-coffee-muted">Ratio × Geschmack</span>
        {enough && <span className="text-[10px] text-coffee-accent-soft">r = {r >= 0 ? '+' : ''}{r.toFixed(2)}</span>}
      </div>
      <svg width="100%" height="120" viewBox="0 0 260 120">
        <g stroke="var(--coffee-line)" strokeWidth="1">
          <line x1={X0} y1={Y0} x2={X0} y2={Y1} />
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} />
        </g>
        {enough && (
          <line
            data-testid="regression-line"
            x1={sx(RATIO_MIN)} y1={sy(slope * RATIO_MIN + intercept)}
            x2={sx(RATIO_MAX)} y2={sy(slope * RATIO_MAX + intercept)}
            stroke="#c9a35e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
          />
        )}
        <g style={{ filter: 'drop-shadow(0 0 4px rgba(233,201,135,0.5))' }}>
          {points.map((p, i) => (
            <circle key={i} data-testid="scatter-point" cx={sx(p.ratio)} cy={sy(p.flavor)} r="5" fill={ratingHex(p.rating)} />
          ))}
        </g>
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/CorrelationScatter.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/CorrelationScatter.tsx src/__tests__/CorrelationScatter.test.tsx
git commit -m "feat(dashboard): CorrelationScatter ratio x flavor"
```

---

### Task 6: `LiquidBar` component

**Files:**
- Create: `src/components/dashboard/LiquidBar.tsx`
- Test: `src/__tests__/LiquidBar.test.tsx`

Design note: same `doseG/yieldG` API as `BrewRatioBar` (left untouched), tactile gold-gradient fill. Shows `1 : X.XX` or `— : —`.

- [ ] **Step 1: Write the failing test** — create `src/__tests__/LiquidBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { LiquidBar } from '../components/dashboard/LiquidBar'

test('shows ratio when both values present', () => {
  render(<LiquidBar doseG={18} yieldG={36.7} />)
  expect(screen.getByText('1 : 2.04')).toBeInTheDocument()
})

test('shows empty state when missing', () => {
  render(<LiquidBar doseG={null} yieldG={null} />)
  expect(screen.getByText('— : —')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/LiquidBar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation** — create `src/components/dashboard/LiquidBar.tsx`:

```tsx
/** Tactile Brew-Ratio-Bar: Gold-Verlauf + Inset-Schatten („flüssig"). */
export function LiquidBar({ doseG, yieldG }: { doseG: number | null; yieldG: number | null }) {
  const ratio = doseG && yieldG && doseG > 0 ? yieldG / doseG : null
  const fillPct = ratio !== null ? Math.min(100, (ratio / 3) * 100) : 0

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wide text-coffee-muted">Ø Brew Ratio</span>
        <span className={`text-2xl font-extrabold ${ratio !== null ? 'text-coffee-accent-soft' : 'text-coffee-muted/60'}`}>
          {ratio !== null ? `1 : ${ratio.toFixed(2)}` : '— : —'}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-lg bg-coffee-bg shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]">
        <div
          className="h-full rounded-lg bg-gradient-to-r from-[#7a4e26] to-[#e9c987] shadow-[0_0_12px_rgba(233,201,135,0.5)]"
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/LiquidBar.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/LiquidBar.tsx src/__tests__/LiquidBar.test.tsx
git commit -m "feat(dashboard): LiquidBar tactile ratio bar"
```

---

### Task 7: Button `glow` variant

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Test: `src/__tests__/ui.test.tsx`

- [ ] **Step 1: Write the failing test** — append to `src/__tests__/ui.test.tsx`:

```tsx
import { buttonClasses } from '../components/ui'

test('glow variant returns gold gradient + glow shadow classes', () => {
  const cls = buttonClasses('glow')
  expect(cls).toContain('bg-gradient-to-b')
  expect(cls).toContain('shadow-')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/ui.test.tsx`
Expected: FAIL — TS/assertion: `'glow'` not assignable / classes missing.

- [ ] **Step 3: Write minimal implementation** — in `src/components/ui/Button.tsx` replace the `Variant` type and `buttonClasses` body:

```tsx
type Variant = 'primary' | 'secondary' | 'glow'

export function buttonClasses(variant: Variant = 'primary', extra = ''): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition'
  const v =
    variant === 'primary'
      ? 'bg-coffee-accent text-coffee-bg hover:bg-coffee-accent-soft'
      : variant === 'glow'
        ? 'bg-gradient-to-b from-[#e9c987] to-coffee-accent text-coffee-bg shadow-[0_4px_14px_rgba(233,201,135,0.35)] hover:to-coffee-accent-soft'
        : 'border border-coffee-line text-coffee-cream hover:bg-coffee-surface'
  return `${base} ${v} ${extra}`.trim()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/ui.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.tsx src/__tests__/ui.test.tsx
git commit -m "feat(ui): glow button variant"
```

---

### Task 8: Assemble Dashboard bento layout

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Test: `src/__tests__/Dashboard.test.tsx`

Design note: the integration test mocks the data hooks and the `ShotCard`/`BrewCard` children (to avoid deep deps). It asserts the dial label, scatter, and recent-shot render, plus the 0-shot empty path.

- [ ] **Step 1: Write the failing test** — create `src/__tests__/Dashboard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const shotsMock = vi.fn()
const brewsMock = vi.fn()
vi.mock('../hooks/useShots', () => ({ useShots: () => shotsMock() }))
vi.mock('../hooks/useBrews', () => ({ useBrews: () => brewsMock() }))
vi.mock('../components/ShotCard', () => ({ ShotCard: ({ shot }: any) => <div>shot-{shot.id}</div> }))
vi.mock('../components/BrewCard', () => ({ BrewCard: ({ brew }: any) => <div>brew-{brew.id}</div> }))

import { Dashboard } from '../pages/Dashboard'

const renderDash = () => render(<MemoryRouter><Dashboard /></MemoryRouter>)

beforeEach(() => {
  brewsMock.mockReturnValue({ data: [] })
})

test('renders gauge, scatter and recent shots with data', () => {
  shotsMock.mockReturnValue({
    data: [
      { id: 'a', rating: 8, brew_ratio: 2.04 },
      { id: 'b', rating: 7, brew_ratio: 1.7 },
    ],
    isLoading: false,
  })
  renderDash()
  expect(screen.getByText('Ø Flavor')).toBeInTheDocument()
  expect(screen.getByText('Ratio × Geschmack')).toBeInTheDocument()
  expect(screen.getByText('shot-a')).toBeInTheDocument()
})

test('shows empty state when no shots', () => {
  shotsMock.mockReturnValue({ data: [], isLoading: false })
  renderDash()
  expect(screen.getByText(/erfasse shots/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/Dashboard.test.tsx`
Expected: FAIL — current Dashboard has no "Ø Flavor"/"Ratio × Geschmack".

- [ ] **Step 3: Write minimal implementation** — replace `src/pages/Dashboard.tsx` entirely:

```tsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { ShotCard } from '../components/ShotCard'
import { BrewCard } from '../components/BrewCard'
import { ROUTES } from '../lib/routes'
import { buttonClasses } from '../components/ui'
import { EmbossedTile } from '../components/dashboard/EmbossedTile'
import { DialGauge } from '../components/dashboard/DialGauge'
import { LiquidBar } from '../components/dashboard/LiquidBar'
import { CorrelationScatter, type ScatterPoint } from '../components/dashboard/CorrelationScatter'

export function Dashboard() {
  const { data: shots = [], isLoading } = useShots()
  const { data: brews = [] } = useBrews()

  const avgRating = shots.length > 0
    ? shots.reduce((sum, s) => sum + s.rating, 0) / shots.length
    : NaN
  const topShots = shots.filter(s => s.rating >= 8).length
  const ratioShots = shots.filter(s => s.brew_ratio !== null)
  const avgRatio = ratioShots.length > 0
    ? ratioShots.reduce((sum, s) => sum + (s.brew_ratio ?? 0), 0) / ratioShots.length
    : null

  const scatterPoints: ScatterPoint[] = shots
    .filter(s => s.brew_ratio !== null)
    .map(s => ({ ratio: s.brew_ratio as number, flavor: s.rating, rating: s.rating }))

  const gridRef = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce || !gridRef.current) return
    gsap.from(gridRef.current.children, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', stagger: 0.08 })
  }, { scope: gridRef })

  return (
    <div className="rounded-2xl bg-[radial-gradient(140%_100%_at_50%_-20%,var(--coffee-surface),var(--coffee-bg))] p-2 sm:p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-coffee-cream">Espresso</h1>
        <Link to={ROUTES.shotNew} className={buttonClasses('glow')}>+ New Shot</Link>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <EmbossedTile className="flex items-center justify-center md:row-span-2">
          <DialGauge value={avgRating} max={10} label="Ø Flavor" />
        </EmbossedTile>

        <EmbossedTile className="md:col-span-2">
          <LiquidBar doseG={avgRatio !== null ? 1 : null} yieldG={avgRatio} />
          <div className="mt-2 flex gap-4 text-xs text-coffee-muted">
            <span>{shots.length} Shots</span><span>{topShots} Top (≥8)</span>
          </div>
        </EmbossedTile>

        <EmbossedTile className="md:col-span-2">
          <CorrelationScatter points={scatterPoints} />
        </EmbossedTile>
      </div>

      <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Recent Shots</h2>
      {isLoading && <p className="py-4 text-center text-sm text-coffee-muted">Loading...</p>}
      <div className="mb-6 grid gap-2 md:grid-cols-2">
        {shots.slice(0, 6).map(shot => <ShotCard key={shot.id} shot={shot} />)}
        {!isLoading && shots.length === 0 && (
          <p className="py-8 text-center text-sm text-coffee-muted md:col-span-2">No shots yet. Pull your first!</p>
        )}
      </div>

      {brews.length > 0 && (
        <>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Recent Brews</h2>
          <div className="mb-6 grid gap-2 md:grid-cols-2">
            {brews.slice(0, 4).map(brew => <BrewCard key={brew.id} brew={brew} />)}
          </div>
        </>
      )}

      <Link to={ROUTES.shotNew} className={`md:hidden ${buttonClasses('glow', 'w-full')}`}>+ New Shot</Link>
    </div>
  )
}
```

Note: `LiquidBar` is fed `doseG=1, yieldG=avgRatio` so it renders `1 : <avgRatio>` directly from the average ratio (no per-shot dose/yield needed on the dashboard average).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/Dashboard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/__tests__/Dashboard.test.tsx
git commit -m "feat(dashboard): bento-cockpit layout with dial, ratio bar, scatter"
```

---

### Task 9: Full verification + visual self-review

**Files:** none (verification only).

- [ ] **Step 1: Type check**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `npx vitest run`
Expected: all green (previous 146 + new tests).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: `✓ built`.

- [ ] **Step 4: Visual screenshot self-review**

Start dev server (`npm run dev`), then screenshot the dashboard with the existing pattern (adapt `scripts/verify-shoot.mjs` to hit `/app`). Review the montage/screenshot yourself against the approved mockup (`.superpowers/brainstorm/13341-1780914537/content/mix-bc-v2.html`): dial glow, liquid bar, scatter points/line, embossed tiles, glow CTA. Fix visual gaps and re-screenshot 2–3× before showing the user. Stop the dev server when done.

- [ ] **Step 5: Commit any visual fixes**

```bash
git add -A
git commit -m "fix(dashboard): visual polish from screenshot review"
```

---

## Self-Review (author checklist — completed)

**Spec coverage:** EmbossedTile (T3), DialGauge (T4), CorrelationScatter incl. ratingHex coupling + thresholds (T1,T2,T5), LiquidBar (T6), glow CTA (T7), bento layout + empty states + GSAP (T8), data-reality thresholds (T2/T5), tests + visual verify (T1–T9). `BrewRatioBar` left untouched per "prefer restyle, else new" → new `LiquidBar`. All spec sections map to a task.

**Placeholder scan:** none — every code step has full code; no TODO/TBD.

**Type consistency:** `ScatterPoint { ratio, flavor, rating }` defined in T5, consumed identically in T8. `buttonClasses('glow')` variant added T7, used T8. `ratingHex` (T1) used in T4/T5. `pearsonR`/`linearRegression`/`hasEnoughForCorrelation` (T2) used in T5. Hook return shape `{ data, isLoading }` matches existing `Dashboard.tsx`.

**Note on Dashboard average ratio:** dashboard feeds `LiquidBar` with `doseG=1, yieldG=avgRatio` so the bar prints `1 : avgRatio` — intentional, documented in T8.
