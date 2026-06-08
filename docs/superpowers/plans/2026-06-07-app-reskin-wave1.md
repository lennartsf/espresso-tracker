# App-Reskin Welle 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Tracker-App-Shell + Dashboard + Shot/Brew-Cards auf Dark Premium umstellen, über wiederverwendbare UI-Primitives, ohne Emojis (Lucide-Icons).

**Architecture:** Neue themed Primitives in `src/components/ui/` kapseln die `coffee.*`-Tokens. Layout/Dashboard/Cards konsumieren nur diese Primitives + Token-Klassen. Funktionsfarben (Rating) bleiben über neue `ratingBadgeClasses`. Alles auf Branch `animations-update`, kein Deploy bis alle Wellen fertig.

**Tech Stack:** React 18 + Vite + TypeScript + Tailwind (coffee-Tokens aus Phase 0), lucide-react, GSAP/CountUp (vorhanden), Vitest + Testing Library.

---

## File Structure
- Create: `src/components/ui/Card.tsx`, `Button.tsx`, `Badge.tsx`, `RatingBadge.tsx`, `StatCard.tsx`, `PageHeader.tsx`, `index.ts`
- Modify: `src/utils/ratingColor.ts` (neue Funktion `ratingBadgeClasses`, alte unverändert)
- Modify: `src/components/Layout.tsx` (dark + Lucide), `src/pages/Dashboard.tsx`, `src/components/ShotCard.tsx`, `src/components/BrewCard.tsx`
- Modify: `src/marketing/MarketingLayout.tsx`, `src/marketing/components/Hero.tsx`, `src/marketing/auth/AuthForm.tsx` (Logo „☕ SILVIA" → „SILVIA")
- Create (Tests): `src/__tests__/ui.test.tsx`, ergänze `src/__tests__/ratingColor.test.ts`

---

## Task 1: lucide-react + ratingBadgeClasses

**Files:**
- Modify: `package.json` (Dep)
- Modify: `src/utils/ratingColor.ts`
- Test: `src/__tests__/ratingColor.test.ts`

- [ ] **Step 1: Lucide installieren**

Run: `npm i lucide-react`
Expected: fügt `lucide-react` zu dependencies hinzu.

- [ ] **Step 2: Failing test für ratingBadgeClasses ergänzen**

In `src/__tests__/ratingColor.test.ts` ans Ende anfügen:

```ts
import { ratingBadgeClasses } from '../utils/ratingColor'

test('ratingBadgeClasses: hoch = grün', () => {
  expect(ratingBadgeClasses(9)).toContain('green')
})
test('ratingBadgeClasses: mittel = lime', () => {
  expect(ratingBadgeClasses(7)).toContain('lime')
})
test('ratingBadgeClasses: niedrig-mittel = amber', () => {
  expect(ratingBadgeClasses(5)).toContain('amber')
})
test('ratingBadgeClasses: niedrig = rot', () => {
  expect(ratingBadgeClasses(2)).toContain('red')
})
test('ratingBadgeClasses: ungültig = neutral', () => {
  expect(ratingBadgeClasses(0)).toContain('coffee')
})
```

- [ ] **Step 3: Test läuft rot**

Run: `npx vitest run src/__tests__/ratingColor.test.ts`
Expected: FAIL — `ratingBadgeClasses` nicht exportiert.

- [ ] **Step 4: ratingBadgeClasses implementieren**

In `src/utils/ratingColor.ts` anfügen (bestehende `ratingColor` NICHT ändern — wird von noch-nicht-reskinnten Seiten + Tests genutzt):

```ts
/** Gefüllte Dark-Klassen fürs Rating-Badge (Funktionsfarbe, für dunklen Grund). */
export function ratingBadgeClasses(v: number): string {
  if (v >= 8 && v <= 10) return 'bg-green-600/90 text-green-50 ring-1 ring-green-400/40 shadow-lg shadow-green-900/30'
  if (v >= 6) return 'bg-lime-600/90 text-lime-50 ring-1 ring-lime-400/40 shadow-lg shadow-lime-900/30'
  if (v >= 4) return 'bg-amber-600/90 text-amber-50 ring-1 ring-amber-400/40 shadow-lg shadow-amber-900/30'
  if (v >= 1) return 'bg-red-600/90 text-red-50 ring-1 ring-red-400/40 shadow-lg shadow-red-900/30'
  return 'bg-coffee-surface2 text-coffee-muted ring-1 ring-coffee-line'
}
```

- [ ] **Step 5: Tests grün**

Run: `npx vitest run src/__tests__/ratingColor.test.ts`
Expected: PASS (alte + neue Tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/utils/ratingColor.ts src/__tests__/ratingColor.test.ts
git commit -m "feat(reskin): lucide-react + ratingBadgeClasses (dark)"
```

---

## Task 2: Primitives Card / Button / Badge

**Files:**
- Create: `src/components/ui/Card.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`
- Test: `src/__tests__/ui.test.tsx`

- [ ] **Step 1: Card schreiben**

`src/components/ui/Card.tsx`:

```tsx
import type { HTMLAttributes } from 'react'

/** Wiederverwendbare Klassen — auch für <Link>-Karten nutzbar. */
export const cardClasses =
  'rounded-xl border border-coffee-line bg-coffee-surface2 shadow-lg shadow-black/30'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${cardClasses} ${className}`} {...rest}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Button schreiben**

`src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

/** Klassen-Helper — für echte <button> und für <Link> mit Button-Optik. */
export function buttonClasses(variant: Variant = 'primary', extra = ''): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition'
  const v =
    variant === 'primary'
      ? 'bg-coffee-accent text-coffee-bg hover:bg-coffee-accent-soft'
      : 'border border-coffee-line text-coffee-cream hover:bg-coffee-surface'
  return `${base} ${v} ${extra}`.trim()
}

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses(variant, className)} {...rest} />
}
```

- [ ] **Step 3: Badge schreiben**

`src/components/ui/Badge.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-coffee-accent/35 bg-coffee-accent/15 px-2 py-0.5 text-xs font-semibold text-coffee-accent-soft ${className}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Failing test schreiben**

`src/__tests__/ui.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { Button, buttonClasses } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

test('Button primary nutzt Gold-Akzent', () => {
  render(<Button>Go</Button>)
  expect(screen.getByRole('button', { name: 'Go' }).className).toContain('bg-coffee-accent')
})

test('buttonClasses secondary nutzt Outline', () => {
  expect(buttonClasses('secondary')).toContain('border-coffee-line')
})

test('Badge rendert Inhalt', () => {
  render(<Badge>V60</Badge>)
  expect(screen.getByText('V60')).toBeInTheDocument()
})

test('Card rendert Kinder + Surface-Klasse', () => {
  render(<Card>Inhalt</Card>)
  const el = screen.getByText('Inhalt')
  expect(el.className).toContain('bg-coffee-surface2')
})
```

- [ ] **Step 5: Tests laufen**

Run: `npx vitest run src/__tests__/ui.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/Button.tsx src/components/ui/Badge.tsx src/__tests__/ui.test.tsx
git commit -m "feat(reskin): UI-Primitives Card/Button/Badge"
```

---

## Task 3: Primitives RatingBadge / StatCard / PageHeader + Barrel

**Files:**
- Create: `src/components/ui/RatingBadge.tsx`, `StatCard.tsx`, `PageHeader.tsx`, `index.ts`
- Test: `src/__tests__/ui.test.tsx` (erweitern)

- [ ] **Step 1: RatingBadge schreiben**

`src/components/ui/RatingBadge.tsx`:

```tsx
import { ratingBadgeClasses } from '../../utils/ratingColor'

export function RatingBadge({ value }: { value: number }) {
  return (
    <span
      className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-2 py-1.5 font-display text-base font-bold ${ratingBadgeClasses(value)}`}
    >
      {value}
    </span>
  )
}
```

- [ ] **Step 2: StatCard schreiben**

`src/components/ui/StatCard.tsx`:

```tsx
import { Card } from './Card'
import { CountUp } from '../CountUp'

export function StatCard({
  value,
  label,
  decimals = 0,
}: {
  value: number
  label: string
  decimals?: number
}) {
  return (
    <Card className="p-4 text-center">
      <p className="font-display text-2xl font-bold text-coffee-accent-soft">
        <CountUp end={value} decimals={decimals} />
      </p>
      <p className="mt-1 text-xs text-coffee-muted">{label}</p>
    </Card>
  )
}
```

- [ ] **Step 3: PageHeader schreiben**

`src/components/ui/PageHeader.tsx`:

```tsx
import type { ReactNode } from 'react'

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-semibold text-coffee-cream">{title}</h1>
      {action}
    </div>
  )
}
```

- [ ] **Step 4: Barrel-Export**

`src/components/ui/index.ts`:

```ts
export { Card, cardClasses } from './Card'
export { Button, buttonClasses } from './Button'
export { Badge } from './Badge'
export { RatingBadge } from './RatingBadge'
export { StatCard } from './StatCard'
export { PageHeader } from './PageHeader'
```

- [ ] **Step 5: Tests ergänzen**

In `src/__tests__/ui.test.tsx` anfügen:

```tsx
import { RatingBadge } from '../components/ui/RatingBadge'
import { PageHeader } from '../components/ui/PageHeader'

test('RatingBadge zeigt Wert + Funktionsfarbe', () => {
  render(<RatingBadge value={9} />)
  const el = screen.getByText('9')
  expect(el.className).toContain('green')
})

test('PageHeader zeigt Titel + Action', () => {
  render(<PageHeader title="Espresso" action={<button>+ New</button>} />)
  expect(screen.getByText('Espresso')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '+ New' })).toBeInTheDocument()
})
```

(StatCard nutzt GSAP/CountUp — durch matchMedia-Polyfill im Setup abgedeckt; kein separater Test nötig, wird in Dashboard mitgetestet.)

- [ ] **Step 6: Tests laufen**

Run: `npx vitest run src/__tests__/ui.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat(reskin): RatingBadge/StatCard/PageHeader + ui barrel"
```

---

## Task 4: App-Shell (Layout) dark + Lucide

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Imports + navItems auf Lucide umstellen**

Ersetze oben in `src/components/Layout.tsx` den Import-Block + `navItems` durch:

```tsx
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Home, ListChecks, CupSoda, BarChart3, Coffee, MapPin, Settings,
  BookOpen, Library, Clapperboard, MoreHorizontal,
} from 'lucide-react'
import { ROUTES } from '../lib/routes'

const navItems = [
  { to: ROUTES.app,       label: 'Home',      Icon: Home },
  { to: ROUTES.shots,     label: 'Shots',     Icon: ListChecks },
  { to: ROUTES.brews,     label: 'Brews',     Icon: CupSoda },
  { to: ROUTES.analysis,  label: 'Analysis',  Icon: BarChart3 },
  { to: ROUTES.coffees,   label: 'Coffees',   Icon: Coffee },
  { to: ROUTES.roasters,  label: 'Roasters',  Icon: MapPin },
  { to: ROUTES.equipment, label: 'Equipment', Icon: Settings },
  { to: ROUTES.guide,     label: 'Guide',     Icon: BookOpen },
  { to: ROUTES.glossary,  label: 'Glossary',  Icon: Library },
  { to: ROUTES.animate,   label: 'Animate',   Icon: Clapperboard },
]
```

- [ ] **Step 2: Shell + Sidebar dark, Brand ohne Emoji**

Ersetze den Root + Sidebar-Block. Root-`div`:

```tsx
    <div className="flex min-h-screen bg-coffee-bg text-coffee-text font-grotesk">
```

Sidebar-`nav` + Brand + Items (Desktop):

```tsx
      <nav className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-52 bg-coffee-surface border-r border-coffee-line py-8 px-3 z-10">
        <p className="font-display text-base font-semibold text-coffee-cream px-3 mb-6">Espresso</p>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.app}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                isActive
                  ? 'bg-coffee-accent/15 text-coffee-accent-soft'
                  : 'text-coffee-muted hover:text-coffee-cream hover:bg-coffee-surface2'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
```

- [ ] **Step 3: „More"-Overlay dark + Lucide**

Ersetze den Mobile-„More"-Overlay-Block:

```tsx
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-coffee-surface border-t border-coffee-line shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 px-2 py-3">
              {moreNav.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === ROUTES.app}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-cream'
                    }`
                  }
                >
                  <Icon size={22} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Bottom-Nav dark + Lucide + More-Button**

Ersetze den Bottom-`nav`-Block (Mobile):

```tsx
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-coffee-surface border-t border-coffee-line flex z-30">
        {primaryNav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.app}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-cream'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
            moreOpen || isMoreActive ? 'text-coffee-accent-soft' : 'text-coffee-muted hover:text-coffee-cream'
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={1.75} />
          More
        </button>
      </nav>
```

(`primaryNav`/`moreNav`/`isMoreActive` bleiben wie gehabt — sie referenzieren `navItems`, das jetzt `Icon` statt `icon` hat.)

- [ ] **Step 5: Typecheck + Tests**

Run: `npx tsc -b && npx vitest run`
Expected: tsc 0 Fehler; alle Tests grün.

- [ ] **Step 6: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat(reskin): App-Shell dark + Lucide-Nav, keine Emojis"
```

---

## Task 5: Dashboard reskin

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Imports anpassen**

In `src/pages/Dashboard.tsx`: entferne den direkten `CountUp`-Import, ergänze ui-Primitives:

```tsx
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { ShotCard } from '../components/ShotCard'
import { BrewCard } from '../components/BrewCard'
import { ROUTES } from '../lib/routes'
import { PageHeader, StatCard, buttonClasses } from '../components/ui'
```

(Die numerischen Werte `avgRating`, `topShots`, `ratioShots`, `avgRatio`, `avgBrewRating` + der `statsRef`/`useGSAP`-Stagger-Block bleiben unverändert.)

- [ ] **Step 2: Header + Shot-Stats ersetzen**

Ersetze den Header-`div` und die Shot-Stats-Grid:

```tsx
      <PageHeader
        title="Espresso"
        action={
          <Link to={ROUTES.shotNew} className={buttonClasses('primary')}>
            + New Shot
          </Link>
        }
      />

      {/* Shot Stats */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard value={shots.length} label="Shots total" />
        <StatCard value={avgRating} label="Avg Flavor" decimals={1} />
        <StatCard value={topShots} label="Top Shots (≥8)" />
        <StatCard value={avgRatio} label="Avg Ratio" decimals={2} />
      </div>
```

- [ ] **Step 3: Brew-Stats + Labels dark**

Ersetze den Brew-Stats-Block + die beiden Section-Überschriften („Recent Shots"/„Recent Brews") Klassen:

```tsx
      {/* Brew Stats */}
      {brews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard value={brews.length} label="Brews total" />
          <StatCard value={avgBrewRating} label="Avg Brew Rating" decimals={1} />
        </div>
      )}
      {brews.length === 0 && <div className="mb-8" />}

      <h2 className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
        Recent Shots
      </h2>
```

Und die zweite Überschrift weiter unten:

```tsx
          <h2 className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
            Recent Brews
          </h2>
```

- [ ] **Step 4: Loading/Empty-Text + Mobile-CTA dark**

Ersetze die Loading-/Empty-Texte (`text-slate-400` → `text-coffee-muted`) und den Mobile-CTA-`Link`:

```tsx
      {isLoading && <p className="text-coffee-muted text-sm text-center py-4">Loading...</p>}
```
```tsx
          <p className="text-center text-coffee-muted text-sm py-8 md:col-span-2">
            No shots yet. Pull your first!
          </p>
```
```tsx
      <Link to={ROUTES.shotNew} className={`md:hidden ${buttonClasses('primary', 'w-full')}`}>
        + New Shot
      </Link>
```

- [ ] **Step 5: Typecheck + Tests + Build**

Run: `npx tsc -b && npx vitest run && npm run build`
Expected: tsc 0; 130+ Tests grün; Build ok.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(reskin): Dashboard dark (PageHeader/StatCard/Button)"
```

---

## Task 6: ShotCard + BrewCard reskin

**Files:**
- Modify: `src/components/ShotCard.tsx`, `src/components/BrewCard.tsx`

- [ ] **Step 1: ShotCard auf Primitives umstellen**

Ersetze in `src/components/ShotCard.tsx` den Import von `ratingColor` und den `return`-Block:

Import-Zeile ändern:
```tsx
import { cardClasses, RatingBadge, Badge } from './ui'
```
(entferne `import { ratingColor } from '../utils/ratingColor'`)

return:
```tsx
  return (
    <Link
      to={ROUTES.shot(shot.id)}
      className={`${cardClasses} p-3 flex justify-between items-center hover:border-coffee-accent/40 transition-colors`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge>{drinkTypeLabel(shot.drink_type)}</Badge>
          <p className="font-medium text-coffee-cream text-sm truncate">{shot.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-coffee-muted mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className="ml-3 flex-shrink-0">
        <RatingBadge value={shot.rating} />
      </span>
    </Link>
  )
```

- [ ] **Step 2: BrewCard auf Primitives umstellen**

Ersetze in `src/components/BrewCard.tsx` den `ratingColor`-Import und den `return`-Block:

Import-Zeile:
```tsx
import { cardClasses, RatingBadge, Badge } from './ui'
```
(entferne `import { ratingColor } from '../utils/ratingColor'`)

return:
```tsx
  return (
    <Link
      to={ROUTES.brew(brew.id)}
      className={`${cardClasses} p-3 flex justify-between items-center hover:border-coffee-accent/40 transition-colors`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge>{brewMethodLabel(brew.brew_method)}</Badge>
          <p className="font-medium text-coffee-cream text-sm truncate">{brew.coffees?.name ?? '—'}</p>
        </div>
        <p className="text-xs text-coffee-muted mt-0.5 truncate">{subtitle}</p>
      </div>
      <span className="ml-3 flex-shrink-0">
        <RatingBadge value={brew.rating} />
      </span>
    </Link>
  )
```

- [ ] **Step 3: Tests laufen (Card-Tests prüfen nur Text → bleiben grün)**

Run: `npx vitest run src/__tests__/ShotCard.test.tsx src/__tests__/BrewCard.test.tsx`
Expected: PASS (Labels, Namen, Rating-Zahl, Subtitle weiter vorhanden).

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b`
Expected: 0 Fehler.

- [ ] **Step 5: Commit**

```bash
git add src/components/ShotCard.tsx src/components/BrewCard.tsx
git commit -m "feat(reskin): ShotCard/BrewCard dark (Card/RatingBadge/Badge)"
```

---

## Task 7: Marketing-Logo Emoji raus

**Files:**
- Modify: `src/marketing/MarketingLayout.tsx`, `src/marketing/components/Hero.tsx`, `src/marketing/auth/AuthForm.tsx`

- [ ] **Step 1: ☕ aus Logo/Wortmarke entfernen**

Suche in den drei Dateien nach `☕ SILVIA` und ersetze durch `SILVIA`. (In `MarketingLayout.tsx` Header-Brand + Footer-Brand; `AuthForm.tsx`/`Hero.tsx` nur falls dort referenziert.)

Run zum Finden:
```bash
grep -rn "☕" src/marketing
```
Jede Fundstelle: `☕ SILVIA` → `SILVIA`.

- [ ] **Step 2: Sicherstellen, dass keine Emojis mehr in src/marketing + Welle-1-Dateien**

Run:
```bash
grep -rnE "☕|🏠|📋|🫖|📊|📖|📚|🎬|📍|⚙️|📸" src/marketing src/components/Layout.tsx src/pages/Dashboard.tsx src/components/ShotCard.tsx src/components/BrewCard.tsx
```
Expected: keine Treffer.

- [ ] **Step 3: Typecheck + Tests**

Run: `npx tsc -b && npx vitest run`
Expected: tsc 0; alle Tests grün.

- [ ] **Step 4: Commit**

```bash
git add src/marketing/
git commit -m "feat(reskin): Marketing-Wortmarke ohne Emoji"
```

---

## Task 8: Verifikation (visuell + Build)

**Files:** keine (nur Prüfung)

- [ ] **Step 1: Dev-Server starten**

Run: `npm run dev -- --port 4321 --strictPort` (Hintergrund) und warten bis „ready".

- [ ] **Step 2: Screenshots (Selbst-Review)**

Lege `p0-shoot.mjs` im Projekt ab und schieße `/app`, `/app/shots`, `/app/brews`, `/` (mobil zusätzlich `/app` bei 390px), dann lösche das Script wieder:

```js
import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [w, name] of [[1280, 'desktop'], [390, 'mobile']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  for (const path of ['/app', '/app/shots', '/app/brews', '/']) {
    await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' })
    await p.waitForTimeout(1500)
    await p.screenshot({ path: `/tmp/reskin-${name}-${path.replace(/\W+/g, '_')}.png` })
  }
}
await b.close()
```
Run: `node p0-shoot.mjs` (aus Projektordner), dann `rm p0-shoot.mjs`.

- [ ] **Step 3: Screenshots prüfen**

Öffne/lies die `/tmp/reskin-*.png`. Checkliste: Dashboard dark, elevated StatCards (Gold-Zahlen, hochzählend), Rating-Badges gefüllt/farbig, Lucide-Nav (Gold-Active), **keine Emojis**; Shots/Brews-Listen dark mit RatingBadge; Marketing `/` unverändert (Pure Dark), Logo „SILVIA" ohne ☕. Mobile-Nav dark + Lucide.

- [ ] **Step 4: Voller Testlauf + Build**

Run: `npx vitest run && npm run build`
Expected: alle Tests grün; Build erfolgreich.

- [ ] **Step 5: NICHT deployen**

Keine Push/Merge — bleibt auf `animations-update` bis alle Reskin-Wellen (2 + 3) fertig sind.

---

## Notes
- **Emoji-Restbestände** (spätere Wellen, NICHT Welle 1): Seiten-Header „📋 Shots"/„🫖 Brews"/„📊"/„📖 Guide"/„📚 Glossary"/„🎬 Animate"/„📍 Roasters"/„⚙️" in den Content-/Listen-Seiten; `PhotoUpload`-Fallback „☕"; Emoji-`icon`-Felder in `guideContent.ts`/`animationContent.ts` (Karten). In Welle 2/3 ersetzen (Lucide) bzw. entfernen.
- `RatingInput.test` erwartet `bg-orange-500` (Welle-2-Formularkomponente) — in Welle 1 nicht anfassen.
