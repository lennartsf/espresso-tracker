# Animations Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/animate` page with 4 SVG+AnimeJS explainer animations: boiler types, V60 pouring pattern, milk steaming foam volumes, and latte art heart.

**Architecture:** `animationContent.ts` defines metadata for all 4 animations (mirrors `guideContent.ts` pattern). `Animate.tsx` renders a card grid. `AnimateDetail.tsx` routes to the right component by id. Each animation lives in its own file under `src/components/animations/`.

**Tech Stack:** React 18 + TypeScript + Tailwind + AnimeJS v3 + inline SVG. No new UI deps beyond animejs.

---

### Task 1: Install AnimeJS + animationContent.ts

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/utils/animationContent.ts`

- [ ] **Step 1: Install animejs**

```bash
cd /Users/lennartfriedel/Documents/espresso-tracker
npm install animejs
npm install --save-dev @types/animejs
```

Expected: `animejs` appears in `package.json` dependencies.

- [ ] **Step 2: Create animationContent.ts**

```ts
export interface AnimationMeta {
  id: string
  title: string
  icon: string
  description: string
  tags: string[]
}

export const ANIMATIONS: AnimationMeta[] = [
  {
    id: 'boiler',
    title: 'Boiler Types',
    icon: '🔧',
    description: 'How your machine heats water',
    tags: ['Single Boiler', 'Heat Exchanger', 'Dual Boiler', 'Thermoblock'],
  },
  {
    id: 'v60',
    title: 'V60 Pour Pattern',
    icon: '🌊',
    description: 'Bloom + 3 pours with timing',
    tags: ['Bloom', 'Pour 1', 'Pour 2', 'Pour 3'],
  },
  {
    id: 'milk',
    title: 'Milk Steaming',
    icon: '🥛',
    description: 'Foam volume by drink type',
    tags: ['Cappuccino', 'Latte Macchiato', 'Flat White', 'Cortado'],
  },
  {
    id: 'latte-heart',
    title: 'Latte Art Heart',
    icon: '❤️',
    description: 'Classic heart pour technique',
    tags: ['Base pour', 'Heart shape', 'Finish'],
  },
]
```

- [ ] **Step 3: Write test**

Create `src/__tests__/animationContent.test.ts`:

```ts
import { ANIMATIONS } from '../utils/animationContent'

test('ANIMATIONS has 4 entries', () => {
  expect(ANIMATIONS).toHaveLength(4)
})

test('all animation ids are unique', () => {
  const ids = ANIMATIONS.map(a => a.id)
  expect(new Set(ids).size).toBe(4)
})

test('ids match expected values', () => {
  const ids = ANIMATIONS.map(a => a.id)
  expect(ids).toContain('boiler')
  expect(ids).toContain('v60')
  expect(ids).toContain('milk')
  expect(ids).toContain('latte-heart')
})
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/animationContent.ts src/__tests__/animationContent.test.ts package.json package-lock.json
git commit -m "feat: install animejs and add animationContent metadata"
```

---

### Task 2: Animate overview page + route wiring

**Files:**
- Create: `src/pages/Animate.tsx`
- Create: `src/pages/AnimateDetail.tsx` (shell only, fills in per animation task)
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Write test for Animate page**

Create `src/__tests__/Animate.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Animate } from '../pages/Animate'

test('shows all 4 animation cards', () => {
  render(<MemoryRouter><Animate /></MemoryRouter>)
  expect(screen.getByText('Boiler Types')).toBeInTheDocument()
  expect(screen.getByText('V60 Pour Pattern')).toBeInTheDocument()
  expect(screen.getByText('Milk Steaming')).toBeInTheDocument()
  expect(screen.getByText('Latte Art Heart')).toBeInTheDocument()
})

test('each card links to correct animate route', () => {
  render(<MemoryRouter><Animate /></MemoryRouter>)
  const links = screen.getAllByRole('link')
  expect(links.find(l => l.getAttribute('href') === '/animate/boiler')).toBeTruthy()
  expect(links.find(l => l.getAttribute('href') === '/animate/latte-heart')).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --no-coverage 2>&1 | grep -E "FAIL|pass"
```

Expected: FAIL — `Animate` not found.

- [ ] **Step 3: Create Animate.tsx**

```tsx
import { Link } from 'react-router-dom'
import { ANIMATIONS } from '../utils/animationContent'

export function Animate() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">🎬 Animate</h1>
      <p className="text-sm text-slate-500 mb-6">Visual explainers</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ANIMATIONS.map(anim => (
          <Link
            key={anim.id}
            to={`/animate/${anim.id}`}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow block"
          >
            <div className="text-3xl mb-2">{anim.icon}</div>
            <div className="font-semibold text-sm text-slate-800 mb-0.5">{anim.title}</div>
            <div className="text-xs text-slate-500 mb-2">{anim.description}</div>
            <div className="flex flex-wrap gap-1">
              {anim.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create AnimateDetail.tsx (shell)**

```tsx
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { ANIMATIONS } from '../utils/animationContent'
import { BoilerAnimation } from '../components/animations/BoilerAnimation'
import { V60Animation } from '../components/animations/V60Animation'
import { MilkAnimation } from '../components/animations/MilkAnimation'
import { LatteHeartAnimation } from '../components/animations/LatteHeartAnimation'

const COMPONENTS: Record<string, React.FC> = {
  boiler: BoilerAnimation,
  v60: V60Animation,
  milk: MilkAnimation,
  'latte-heart': LatteHeartAnimation,
}

export function AnimateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const meta = ANIMATIONS.find(a => a.id === id)
  const Component = id ? COMPONENTS[id] : undefined

  if (!meta || !Component) return <Navigate to="/animate" replace />

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/animate')} className="text-slate-400 text-lg">←</button>
        <span className="text-3xl">{meta.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{meta.title}</h1>
          <p className="text-sm text-slate-500">{meta.description}</p>
        </div>
      </div>
      <Component />
    </div>
  )
}
```

- [ ] **Step 5: Create placeholder animation components** (so AnimateDetail compiles before animations are built)

Create `src/components/animations/BoilerAnimation.tsx`:
```tsx
export function BoilerAnimation() {
  return <div className="text-center text-slate-400 py-20">Boiler animation coming soon</div>
}
```

Create `src/components/animations/V60Animation.tsx`:
```tsx
export function V60Animation() {
  return <div className="text-center text-slate-400 py-20">V60 animation coming soon</div>
}
```

Create `src/components/animations/MilkAnimation.tsx`:
```tsx
export function MilkAnimation() {
  return <div className="text-center text-slate-400 py-20">Milk animation coming soon</div>
}
```

Create `src/components/animations/LatteHeartAnimation.tsx`:
```tsx
export function LatteHeartAnimation() {
  return <div className="text-center text-slate-400 py-20">Latte heart animation coming soon</div>
}
```

- [ ] **Step 6: Wire routes in App.tsx**

Add to `src/App.tsx` (after the glossary route):
```tsx
import { Animate } from './pages/Animate'
import { AnimateDetail } from './pages/AnimateDetail'
// ...inside <Route element={<Layout />}>:
<Route path="animate" element={<Animate />} />
<Route path="animate/:id" element={<AnimateDetail />} />
```

- [ ] **Step 7: Add nav entry in Layout.tsx**

In `src/components/Layout.tsx`, add to `navItems` array after the Glossary entry:
```ts
{ to: '/animate', label: 'Animate', icon: '🎬' },
```

- [ ] **Step 8: Write AnimateDetail test**

Create `src/__tests__/AnimateDetail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AnimateDetail } from '../pages/AnimateDetail'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/animate/${id}`]}>
      <Routes>
        <Route path="/animate/:id" element={<AnimateDetail />} />
        <Route path="/animate" element={<div>Animate Overview</div>} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows boiler title', () => {
  renderDetail('boiler')
  expect(screen.getByText('Boiler Types')).toBeInTheDocument()
})

test('shows v60 title', () => {
  renderDetail('v60')
  expect(screen.getByText('V60 Pour Pattern')).toBeInTheDocument()
})

test('redirects to /animate for unknown id', () => {
  renderDetail('unknown')
  expect(screen.getByText('Animate Overview')).toBeInTheDocument()
})
```

- [ ] **Step 9: Run all tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/pages/Animate.tsx src/pages/AnimateDetail.tsx \
  src/components/animations/ src/App.tsx src/components/Layout.tsx \
  src/__tests__/Animate.test.tsx src/__tests__/AnimateDetail.test.tsx
git commit -m "feat: add /animate route, overview page, and detail shell"
```

---

### Task 3: BoilerAnimation component

**Files:**
- Modify: `src/components/animations/BoilerAnimation.tsx`

The animation shows a machine cross-section. 4 tabs (Single Boiler / Heat Exchanger / Dual Boiler / Thermoblock). AnimeJS animates water flow paths when tab changes.

- [ ] **Step 1: Replace placeholder with full component**

```tsx
import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

type BoilerType = 'single' | 'hx' | 'dual' | 'thermoblock'

const TABS: { key: BoilerType; label: string }[] = [
  { key: 'single',     label: 'Single Boiler' },
  { key: 'hx',         label: 'Heat Exchanger' },
  { key: 'dual',       label: 'Dual Boiler' },
  { key: 'thermoblock', label: 'Thermoblock' },
]

const DESCRIPTIONS: Record<BoilerType, string> = {
  single:     'One tank for everything. Must wait for temperature to switch between brewing and steaming.',
  hx:         'Large steam boiler with an inner tube (heat exchanger) for brew water. Both at once.',
  dual:       'Two separate boilers — one for brewing, one for steam. Full independent control.',
  thermoblock:'Water heats as it flows through a metal block. Fast heat-up, less thermal mass.',
}

export function BoilerAnimation() {
  const [active, setActive] = useState<BoilerType>('single')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    // Reset all paths
    anime.remove('.water-path')
    const paths = svgRef.current.querySelectorAll('.water-path')
    paths.forEach(p => {
      const length = (p as SVGPathElement).getTotalLength?.() ?? 100
      ;(p as SVGPathElement).style.strokeDasharray = String(length)
      ;(p as SVGPathElement).style.strokeDashoffset = String(length)
      ;(p as SVGPathElement).style.opacity = '0'
    })
    // Animate active paths
    const activePaths = svgRef.current.querySelectorAll(`.path-${active}`)
    activePaths.forEach(p => {
      const length = (p as SVGPathElement).getTotalLength?.() ?? 100
      ;(p as SVGPathElement).style.strokeDasharray = String(length)
      ;(p as SVGPathElement).style.strokeDashoffset = String(length)
      ;(p as SVGPathElement).style.opacity = '1'
    })
    anime({
      targets: `.path-${active}`,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1200,
      delay: anime.stagger(200),
    })
  }, [active])

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              active === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <div className="bg-slate-900 rounded-xl p-4 mb-4">
        <svg ref={svgRef} viewBox="0 0 320 200" className="w-full">
          {/* Machine housing */}
          <rect x="40" y="30" width="240" height="140" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="2"/>

          {/* Single boiler */}
          {active === 'single' && (
            <>
              <rect x="110" y="55" width="100" height="90" rx="8" fill="#fed7aa" stroke="#f97316" strokeWidth="2"/>
              <text x="160" y="105" textAnchor="middle" fill="#ea580c" fontSize="10" fontFamily="sans-serif">Boiler</text>
              {/* Brew path */}
              <path className="water-path path-single" d="M160 55 L160 35 L80 35 L80 180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              {/* Steam path */}
              <path className="water-path path-single" d="M160 55 L160 35 L240 35 L240 180" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3"/>
            </>
          )}

          {/* Heat exchanger */}
          {active === 'hx' && (
            <>
              <rect x="90" y="45" width="140" height="110" rx="8" fill="#fed7aa" stroke="#f97316" strokeWidth="2"/>
              <text x="160" y="80" textAnchor="middle" fill="#ea580c" fontSize="9" fontFamily="sans-serif">Steam Boiler</text>
              {/* Inner HX tube */}
              <rect x="130" y="65" width="60" height="70" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
              <text x="160" y="105" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontFamily="sans-serif">HX tube</text>
              <path className="water-path path-hx" d="M160 135 L160 170 L80 170 L80 180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              <path className="water-path path-hx" d="M200 45 L200 35 L240 35 L240 180" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3"/>
            </>
          )}

          {/* Dual boiler */}
          {active === 'dual' && (
            <>
              <rect x="60" y="55" width="80" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
              <text x="100" y="100" textAnchor="middle" fill="#1d4ed8" fontSize="9" fontFamily="sans-serif">Brew</text>
              <rect x="180" y="55" width="80" height="80" rx="8" fill="#fed7aa" stroke="#f97316" strokeWidth="2"/>
              <text x="220" y="100" textAnchor="middle" fill="#ea580c" fontSize="9" fontFamily="sans-serif">Steam</text>
              <path className="water-path path-dual" d="M100 55 L100 35 L80 35 L80 180" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
              <path className="water-path path-dual" d="M220 55 L220 35 L240 35 L240 180" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3"/>
            </>
          )}

          {/* Thermoblock */}
          {active === 'thermoblock' && (
            <>
              {/* Winding channel */}
              <path
                className="water-path path-thermoblock"
                d="M60 80 L130 80 L130 100 L70 100 L70 120 L140 120 L140 140 L260 140"
                fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
              />
              {/* Heat metal block */}
              <rect x="55" y="70" width="150" height="80" rx="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3"/>
              <text x="130" y="65" textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="sans-serif">Metal Block</text>
              {/* Cold in */}
              <circle cx="60" cy="80" r="5" fill="#93c5fd"/>
              <text x="42" y="84" fill="#93c5fd" fontSize="8" fontFamily="sans-serif">cold</text>
              {/* Hot out */}
              <circle cx="260" cy="140" r="5" fill="#fb923c"/>
              <text x="265" y="144" fill="#fb923c" fontSize="8" fontFamily="sans-serif">hot</text>
            </>
          )}

          {/* Group head */}
          <rect x="70" y="165" width="30" height="15" rx="3" fill="#475569"/>
          <text x="85" y="176" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">brew</text>
          {/* Steam wand */}
          <rect x="220" y="165" width="30" height="15" rx="3" fill="#475569"/>
          <text x="235" y="176" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">steam</text>
        </svg>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-4">
        {DESCRIPTIONS[active]}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all pass (no new tests for SVG internals — visual check only).

- [ ] **Step 3: Commit**

```bash
git add src/components/animations/BoilerAnimation.tsx
git commit -m "feat: implement BoilerAnimation with 4 boiler type tabs"
```

---

### Task 4: V60Animation component

**Files:**
- Modify: `src/components/animations/V60Animation.tsx`

Overhead view of V60. Animated water pours appear as expanding circles. Timeline progress bar shows current phase. Play/Replay controls.

- [ ] **Step 1: Replace placeholder with full component**

```tsx
import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

const PHASES = [
  { label: 'Bloom',  time: '0:00', ml: '45 ml',  color: '#93c5fd', radius: 20 },
  { label: 'Pour 1', time: '1:00', ml: '60 ml',  color: '#60a5fa', radius: 30 },
  { label: 'Pour 2', time: '1:30', ml: '60 ml',  color: '#3b82f6', radius: 38 },
  { label: 'Pour 3', time: '2:00', ml: '60 ml',  color: '#2563eb', radius: 44 },
]

export function V60Animation() {
  const [phase, setPhase] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timelineRef = useRef<anime.AnimeTimelineInstance | null>(null)

  function replay() {
    setPhase(-1)
    setPlaying(true)
    if (timelineRef.current) timelineRef.current.pause()

    // Reset circles
    PHASES.forEach((_, i) => {
      const el = document.getElementById(`pour-circle-${i}`)
      if (el) { el.setAttribute('r', '0'); (el as SVGCircleElement).style.opacity = '0' }
    })

    const tl = anime.timeline({ easing: 'easeOutCubic' })
    PHASES.forEach((p, i) => {
      tl.add({
        targets: `#pour-circle-${i}`,
        r: p.radius,
        opacity: [0.8, 0.3],
        duration: 800,
        begin: () => setPhase(i),
      }, i === 0 ? 0 : '+=600')
    })
    tl.finished.then(() => setPlaying(false))
    timelineRef.current = tl
  }

  useEffect(() => { replay() }, [])

  return (
    <div>
      {/* SVG Canvas */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
        <svg viewBox="0 0 280 220" className="w-full">
          {/* V60 body */}
          <polygon points="140,20 230,190 50,190" fill="#fed7aa" stroke="#f97316" strokeWidth="2.5"/>
          {/* Filter paper */}
          <polygon points="140,30 220,185 60,185" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1"/>
          {/* Coffee bed */}
          <ellipse cx="140" cy="175" rx="65" ry="12" fill="#92400e" opacity="0.7"/>
          {/* Ribs */}
          <line x1="140" y1="40" x2="95" y2="170" stroke="#f97316" strokeWidth="0.8" opacity="0.4"/>
          <line x1="140" y1="40" x2="185" y2="170" stroke="#f97316" strokeWidth="0.8" opacity="0.4"/>
          <line x1="140" y1="40" x2="140" y2="175" stroke="#f97316" strokeWidth="0.8" opacity="0.4"/>
          {/* Pour circles */}
          {PHASES.map((p, i) => (
            <circle key={i} id={`pour-circle-${i}`} cx="140" cy="140" r="0" fill={p.color} opacity="0"/>
          ))}
          {/* Drain hole */}
          <circle cx="140" cy="190" r="5" fill="#1e293b"/>
        </svg>
      </div>

      {/* Phase timeline */}
      <div className="flex gap-2 mb-4">
        {PHASES.map((p, i) => (
          <div
            key={i}
            className={`flex-1 rounded-lg p-2 text-center text-xs transition-colors ${
              i <= phase ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
            }`}
          >
            <p className={`font-semibold ${i <= phase ? 'text-blue-700' : 'text-slate-400'}`}>{p.label}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{p.time}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{p.ml}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        onClick={replay}
        disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
      >
        {playing ? 'Pouring...' : '↺ Replay'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/animations/V60Animation.tsx
git commit -m "feat: implement V60Animation with pouring phases"
```

---

### Task 5: MilkAnimation component

**Files:**
- Modify: `src/components/animations/MilkAnimation.tsx`

Pitcher side-view. 4 tabs for drink types. Layers animate to correct proportions on tab switch.

- [ ] **Step 1: Replace placeholder with full component**

```tsx
import { useEffect, useState } from 'react'
import anime from 'animejs'

type DrinkType = 'cappuccino' | 'latte' | 'flat-white' | 'cortado'

const DRINKS: { key: DrinkType; label: string; espresso: number; milk: number; foam: number; desc: string }[] = [
  { key: 'cappuccino',  label: 'Cappuccino',      espresso: 33, milk: 33, foam: 34, desc: 'Equal thirds: espresso, steamed milk, thick foam.' },
  { key: 'latte',       label: 'Latte Macchiato',  espresso: 25, milk: 50, foam: 25, desc: 'More milk, medium foam. Espresso poured last through foam.' },
  { key: 'flat-white',  label: 'Flat White',       espresso: 30, milk: 68, foam: 2,  desc: 'Double ristretto, mostly microfoam — almost no visible foam layer.' },
  { key: 'cortado',     label: 'Cortado',           espresso: 50, milk: 48, foam: 2,  desc: 'Equal espresso and warm milk. Minimal foam.' },
]

const CUP_HEIGHT = 120
const CUP_Y = 60

export function MilkAnimation() {
  const [active, setActive] = useState<DrinkType>('cappuccino')

  const drink = DRINKS.find(d => d.key === active)!

  const foamH   = CUP_HEIGHT * (drink.foam / 100)
  const milkH   = CUP_HEIGHT * (drink.milk / 100)
  const espH    = CUP_HEIGHT * (drink.espresso / 100)

  const espY  = CUP_Y + CUP_HEIGHT - espH
  const milkY = espY - milkH
  const foamY = milkY - foamH

  useEffect(() => {
    anime({
      targets: '#layer-espresso',
      y: espY,
      height: espH,
      duration: 600,
      easing: 'easeOutCubic',
    })
    anime({
      targets: '#layer-milk',
      y: milkY,
      height: milkH,
      duration: 600,
      easing: 'easeOutCubic',
    })
    anime({
      targets: '#layer-foam',
      y: foamY,
      height: foamH,
      duration: 600,
      easing: 'easeOutCubic',
    })
  }, [active, espY, espH, milkY, milkH, foamY, foamH])

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {DRINKS.map(d => (
          <button
            key={d.key}
            onClick={() => setActive(d.key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              active === d.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Cup SVG */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex justify-center">
        <svg viewBox="0 0 200 220" className="w-48">
          {/* Cup outline */}
          <path d="M55 60 L55 180 Q55 195 70 195 L130 195 Q145 195 145 180 L145 60 Z" fill="white" stroke="#cbd5e1" strokeWidth="2"/>
          {/* Clip path for layers */}
          <defs>
            <clipPath id="cup-clip">
              <path d="M56 61 L56 179 Q56 194 70 194 L130 194 Q144 194 144 179 L144 61 Z"/>
            </clipPath>
          </defs>
          {/* Espresso layer */}
          <rect id="layer-espresso" x="56" y={espY} width="88" height={espH} fill="#92400e" clipPath="url(#cup-clip)"/>
          {/* Milk layer */}
          <rect id="layer-milk" x="56" y={milkY} width="88" height={milkH} fill="#fef9c3" clipPath="url(#cup-clip)"/>
          {/* Foam layer */}
          <rect id="layer-foam" x="56" y={foamY} width="88" height={foamH} fill="white" opacity="0.9" clipPath="url(#cup-clip)"/>
          {/* Foam texture dots */}
          {foamH > 8 && [70,90,110,80,100].map((x, i) => (
            <circle key={i} cx={x} cy={foamY + foamH/2} r="2" fill="#e2e8f0" clipPath="url(#cup-clip)"/>
          ))}
          {/* Cup border on top */}
          <path d="M55 60 L55 180 Q55 195 70 195 L130 195 Q145 195 145 180 L145 60 Z" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
          {/* Labels */}
          {foamH > 12 && <text x="100" y={foamY + foamH/2 + 4} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">Foam</text>}
          {milkH > 12 && <text x="100" y={milkY + milkH/2 + 4} textAnchor="middle" fill="#78350f" fontSize="9" fontFamily="sans-serif">Milk</text>}
          {espH > 12 && <text x="100" y={espY + espH/2 + 4} textAnchor="middle" fill="#fef3c7" fontSize="9" fontFamily="sans-serif">Espresso</text>}
          {/* Handle */}
          <path d="M145 100 Q175 100 175 130 Q175 160 145 160" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
        </svg>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-4">
        {drink.desc}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/animations/MilkAnimation.tsx
git commit -m "feat: implement MilkAnimation with 4 drink foam profiles"
```

---

### Task 6: LatteHeartAnimation component

**Files:**
- Modify: `src/components/animations/LatteHeartAnimation.tsx`

Overhead cup view. AnimeJS `motionPath` traces pitcher tip. White stream draws the heart.

- [ ] **Step 1: Replace placeholder with full component**

```tsx
import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

export function LatteHeartAnimation() {
  const [playing, setPlaying] = useState(false)
  const streamRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  function replay() {
    if (playing) return
    setPlaying(true)

    const stream = streamRef.current
    const dot = dotRef.current
    if (!stream || !dot) return

    // Reset
    stream.style.strokeDashoffset = String(stream.getTotalLength())
    stream.style.opacity = '0'

    const tl = anime.timeline({ easing: 'easeInOutSine' })

    // Phase 1: base pour — white circle builds up in center
    tl.add({
      targets: '#base-circle',
      r: [0, 38],
      opacity: [0, 0.9],
      duration: 1000,
    })

    // Phase 2: heart path draw
    tl.add({
      targets: stream,
      strokeDashoffset: [stream.getTotalLength(), 0],
      opacity: [0, 1],
      duration: 1600,
      easing: 'easeInOutQuad',
    }, '+=200')

    // Phase 3: dot traces the cut
    tl.add({
      targets: dot,
      translateX: anime.path('#heart-path')('x'),
      translateY: anime.path('#heart-path')('y'),
      duration: 1600,
      easing: 'easeInOutQuad',
    }, '-=1600')

    tl.finished.then(() => setPlaying(false))
  }

  useEffect(() => {
    if (streamRef.current) {
      const len = streamRef.current.getTotalLength()
      streamRef.current.style.strokeDasharray = String(len)
      streamRef.current.style.strokeDashoffset = String(len)
    }
    replay()
  }, [])

  return (
    <div>
      {/* Canvas */}
      <div className="bg-slate-900 rounded-xl p-4 mb-4 flex justify-center">
        <svg viewBox="0 0 240 240" className="w-56">
          {/* Cup rim */}
          <circle cx="120" cy="120" r="100" fill="#451a03" stroke="#92400e" strokeWidth="3"/>
          {/* Espresso base */}
          <circle cx="120" cy="120" r="97" fill="#78350f"/>
          {/* White base pour */}
          <circle id="base-circle" cx="120" cy="130" r="0" fill="white" opacity="0"/>
          {/* Heart path — the cut motion */}
          <path
            id="heart-path"
            d="M120 90 C120 70, 90 70, 90 90 C90 110, 120 130, 120 150 C120 130, 150 110, 150 90 C150 70, 120 70, 120 90"
            fill="none"
            stroke="none"
          />
          {/* Stream draw path */}
          <path
            ref={streamRef}
            d="M120 90 C120 70, 90 70, 90 90 C90 110, 120 130, 120 150 C120 130, 150 110, 150 90 C150 70, 120 70, 120 90"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0"
          />
          {/* Pitcher dot */}
          <circle ref={dotRef} cx="120" cy="90" r="5" fill="#fb923c"/>
        </svg>
      </div>

      {/* Step labels */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <p className="font-semibold text-slate-700">1. Base pour</p>
          <p className="text-slate-400">White spreads in center</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <p className="font-semibold text-slate-700">2. Heart shape</p>
          <p className="text-slate-400">Pitcher traces lobes</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
          <p className="font-semibold text-slate-700">3. Cut through</p>
          <p className="text-slate-400">Forward motion finishes</p>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={replay}
        disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
      >
        {playing ? 'Pouring...' : '↺ Replay'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all pass.

- [ ] **Step 3: TypeScript build check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/animations/LatteHeartAnimation.tsx
git commit -m "feat: implement LatteHeartAnimation with AnimeJS path drawing"
```

---

### Task 7: Final wiring, tests, CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -6
```

Expected: all tests pass.

- [ ] **Step 2: Update CLAUDE.md**

In the "Implementierter Stand" list, add:
```
- [x] **Animate** (`/animate`): 4 SVG+AnimeJS explainers — Boiler Types, V60 Pour Pattern, Milk Steaming (4 drinks), Latte Art Heart
```

In "Weitere geplante Features", mark animations complete:
```
- [x] **Animations** — dedicated `/animate` page...
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: mark animations feature complete in CLAUDE.md"
```
