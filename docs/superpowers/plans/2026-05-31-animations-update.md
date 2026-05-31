# Animations Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the V60, Milk, and Latte-Heart `/animate` explainers with Framer Motion so each clearly teaches what the user should do, with clean non-overlapping visuals.

**Architecture:** Each animation is a self-contained component under `src/components/animations/`. A shared `usePhaseTimeline` hook drives auto-advancing timed animations (V60, Latte); Milk uses phase tabs instead. Motion is declarative via `framer-motion` `motion.*` SVG elements driven by phase state — no `getElementById`, no `anime.path()`. Boiler animation is untouched and keeps using AnimeJS.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, Framer Motion (new), Vitest + Testing Library + jsdom.

**Quality bar (applies to every component):** no overlapping shapes, labels sit outside fill areas, exactly one phase visibly active at a time, captions name the *action*. Verify visually per Task 7.

---

### Task 1: Add framer-motion dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

Run: `npm install framer-motion@^11`
Expected: adds `framer-motion` to `dependencies`, exits 0.

- [ ] **Step 2: Verify it imports**

Run: `node -e "require.resolve('framer-motion'); console.log('ok')"`
Expected: prints `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add framer-motion for animation rebuild

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Shared `usePhaseTimeline` hook

Auto-advances a phase index `0..count-1` on a fixed interval, then sets `playing=false`. Reused by V60 and Latte. Starts at `-1` (idle) and auto-plays on mount.

**Files:**
- Create: `src/components/animations/usePhaseTimeline.ts`
- Test: `src/__tests__/usePhaseTimeline.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/usePhaseTimeline.test.ts
import { renderHook, act } from '@testing-library/react'
import { usePhaseTimeline } from '../components/animations/usePhaseTimeline'

describe('usePhaseTimeline', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('starts idle then advances through phases and stops', () => {
    const { result } = renderHook(() => usePhaseTimeline(3, 1000))
    expect(result.current.phase).toBe(-1)

    act(() => { vi.advanceTimersByTime(0) })
    expect(result.current.phase).toBe(0)
    expect(result.current.playing).toBe(true)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.phase).toBe(1)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.phase).toBe(2)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.playing).toBe(false)
  })

  test('replay restarts from phase 0', () => {
    const { result } = renderHook(() => usePhaseTimeline(2, 1000))
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.playing).toBe(false)

    act(() => { result.current.replay() })
    expect(result.current.phase).toBe(-1)
    act(() => { vi.advanceTimersByTime(0) })
    expect(result.current.phase).toBe(0)
    expect(result.current.playing).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- usePhaseTimeline --run`
Expected: FAIL — cannot resolve `../components/animations/usePhaseTimeline`

- [ ] **Step 3: Write the hook**

```ts
// src/components/animations/usePhaseTimeline.ts
import { useCallback, useEffect, useRef, useState } from 'react'

// Drives an auto-advancing phase index for timed animations.
// phase = -1 (idle) -> 0 .. count-1, then playing flips to false.
export function usePhaseTimeline(count: number, stepMs: number) {
  const [phase, setPhase] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timers = useRef<number[]>([])

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }, [])

  const replay = useCallback(() => {
    clear()
    setPhase(-1)
    setPlaying(true)
    for (let i = 0; i < count; i++) {
      timers.current.push(window.setTimeout(() => setPhase(i), i * stepMs))
    }
    timers.current.push(window.setTimeout(() => setPlaying(false), count * stepMs))
  }, [clear, count, stepMs])

  useEffect(() => {
    replay()
    return clear
  }, [replay, clear])

  return { phase, playing, replay }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- usePhaseTimeline --run`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/animations/usePhaseTimeline.ts src/__tests__/usePhaseTimeline.test.ts
git commit -m "feat: add usePhaseTimeline hook for timed animations

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Rebuild V60Animation (split top + side)

Side = downward cone `▼` (wide top, narrow bottom) with coffee bed at the point and a rising/draining water layer. Top = spiral kettle path. Synced via `usePhaseTimeline`.

**Files:**
- Modify (rewrite): `src/components/animations/V60Animation.tsx`
- Test: `src/__tests__/V60Animation.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/V60Animation.test.tsx
import { render, screen, act } from '@testing-library/react'
import { V60Animation } from '../components/animations/V60Animation'

describe('V60Animation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('renders all phase chips and a replay button', () => {
    render(<V60Animation />)
    expect(screen.getByText('Bloom')).toBeInTheDocument()
    expect(screen.getByText('Pour 1')).toBeInTheDocument()
    expect(screen.getByText('Drain')).toBeInTheDocument()
    // playback starts on mount (button reads "Pouring…"); run it to the end
    act(() => { vi.advanceTimersByTime(7500) })
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })

  test('shows the bloom caption once playback starts', () => {
    render(<V60Animation />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByText(/saturate the grounds/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- V60Animation --run`
Expected: FAIL — old component has no "Drain" chip / no caption text.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/animations/V60Animation.tsx
import { motion } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Phase = {
  label: string
  time: string
  ml: string
  caption: string
  // side view: y of water surface (bed top = 98, so height = 98 - y)
  waterY: number
}

const PHASES: Phase[] = [
  { label: 'Bloom',  time: '0:00', ml: '45 ml',  caption: 'Evenly saturate the grounds, let it bloom ~30 s', waterY: 82 },
  { label: 'Pour 1', time: '0:30', ml: '+60 ml', caption: 'Spiral slowly from the center outward',          waterY: 58 },
  { label: 'Pour 2', time: '1:15', ml: '+60 ml', caption: 'Stay near the center, avoid the edges',          waterY: 48 },
  { label: 'Pour 3', time: '1:45', ml: '+60 ml', caption: 'Final pour, level the coffee bed',               waterY: 40 },
  { label: 'Drain',  time: '2:30', ml: '—',      caption: 'Let it draw down — about 3:00 total',            waterY: 98 },
]

const BED_TOP = 98

// Precomputed spiral (top view, center 60,60) — kettle path during a pour.
const SPIRAL = Array.from({ length: 24 }, (_, i) => {
  const t = i / 23
  const ang = t * Math.PI * 4
  const r = 6 + t * 34
  return { x: +(60 + Math.cos(ang) * r).toFixed(1), y: +(60 + Math.sin(ang) * r).toFixed(1) }
})
const SPIRAL_X = SPIRAL.map((p) => p.x)
const SPIRAL_Y = SPIRAL.map((p) => p.y)

export function V60Animation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 1500)
  const active = phase >= 0 ? PHASES[phase] : null
  const waterY = active ? active.waterY : BED_TOP
  const pour = phase >= 1 && phase <= 3
  const blooming = phase === 0

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE VIEW — cone ▼ */}
        <div className="flex-1">
          <svg viewBox="0 0 240 140" className="w-full">
            <defs>
              <clipPath id="v60-cone">
                <polygon points="40,18 200,18 120,120" />
              </clipPath>
            </defs>
            {/* water layer (clipped to cone) */}
            <motion.rect
              x="40" width="160" fill="#93c5fd" clipPath="url(#v60-cone)"
              initial={false}
              animate={{ y: waterY, height: Math.max(0, BED_TOP - waterY) }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* coffee bed at the point */}
            <polygon points="92,98 148,98 120,118" fill="#6b3f1d" clipPath="url(#v60-cone)" />
            {/* cone outline + ridges */}
            <polygon points="40,18 200,18 120,120" fill="none" stroke="#f97316" strokeWidth="2.5" />
            <line x1="120" y1="20" x2="120" y2="116" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="75" y1="20" x2="113" y2="112" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            <line x1="165" y1="20" x2="127" y2="112" stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
            {/* pour stream */}
            <motion.line
              x1="120" y1="18" x2="120" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
              animate={{ opacity: pour || blooming ? 1 : 0, y2: waterY }}
              transition={{ duration: 0.4 }}
            />
            <text x="120" y="134" textAnchor="middle" fontSize="9" fill="#64748b">Side — water level</text>
          </svg>
        </div>

        {/* TOP VIEW — spiral */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="52" fill="#fed7aa" stroke="#f97316" strokeWidth="2.5" />
            <circle cx="60" cy="60" r="44" fill="#fef3c7" />
            {[...Array(12)].map((_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <line key={i} x1={60 + Math.cos(a) * 14} y1={60 + Math.sin(a) * 14}
                  x2={60 + Math.cos(a) * 44} y2={60 + Math.sin(a) * 44}
                  stroke="#fdba74" strokeWidth="0.8" opacity="0.5" />
              )
            })}
            <motion.circle
              r="4" fill="#1e293b"
              animate={
                pour ? { cx: SPIRAL_X, cy: SPIRAL_Y, opacity: 1 }
                : blooming ? { cx: [60, 56, 64, 60], cy: [60, 64, 56, 60], opacity: 1 }
                : { cx: 60, cy: 60, opacity: 0 }
              }
              transition={{ duration: pour ? 1.2 : 0.8, ease: 'easeInOut' }}
            />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — pour pattern</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-4 min-h-[3rem]">
        {active ? <><span className="font-semibold text-slate-800">{active.time} · {active.ml}</span> — {active.caption}</> : 'Starting…'}
      </p>

      {/* chips */}
      <div className="flex gap-2 mb-4">
        {PHASES.map((p, i) => (
          <div key={p.label}
            className={`flex-1 rounded-lg p-2 text-center text-xs transition-colors ${
              i === phase ? 'bg-blue-100 border border-blue-300' : i < phase ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
            }`}>
            <p className={`font-semibold ${i <= phase ? 'text-blue-700' : 'text-slate-400'}`}>{p.label}</p>
            <p className={i <= phase ? 'text-blue-500' : 'text-slate-300'}>{p.time}</p>
          </div>
        ))}
      </div>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Pouring…' : '↺ Replay'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- V60Animation --run`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/animations/V60Animation.tsx src/__tests__/V60Animation.test.tsx
git commit -m "feat: rebuild V60 animation with split top+side views

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Rebuild MilkAnimation (side view + phase tabs)

Pitcher cross-section + steam wand. Two tabs — **Stretch (Ziehen)** and **Roll (Rollen)** — show wand depth, foam growth, and a whirlpool. Right/wrong depth hints + temperature note as small text.

**Files:**
- Modify (rewrite): `src/components/animations/MilkAnimation.tsx`
- Test: `src/__tests__/MilkAnimation.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/MilkAnimation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MilkAnimation } from '../components/animations/MilkAnimation'

describe('MilkAnimation', () => {
  test('renders both phase tabs and starts on Stretch', () => {
    render(<MilkAnimation />)
    expect(screen.getByRole('button', { name: /stretch/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /roll/i })).toBeInTheDocument()
    expect(screen.getByText(/just below the surface/i)).toBeInTheDocument()
  })

  test('switches caption when Roll tab is clicked', () => {
    render(<MilkAnimation />)
    fireEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByText(/whirlpool/i)).toBeInTheDocument()
  })

  test('shows the temperature note', () => {
    render(<MilkAnimation />)
    expect(screen.getByText(/60–65/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- MilkAnimation --run`
Expected: FAIL — old component renders drink tabs, not Stretch/Roll.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/animations/MilkAnimation.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'

type Phase = 'stretch' | 'roll'

// pitcher interior: milk surface at y=56, bottom at y=120
const SURFACE = 56

const PHASES: Record<Phase, {
  label: string
  tipY: number      // steam wand tip depth
  foamH: number     // foam layer thickness
  whirlpool: boolean
  caption: string
}> = {
  stretch: { label: 'Stretch (Ziehen)', tipY: 62, foamH: 30, whirlpool: false,
    caption: 'Tip just below the surface — let it pull in air. You should hear a steady "tsch-tsch" as foam grows.' },
  roll:    { label: 'Roll (Rollen)',    tipY: 90, foamH: 30, whirlpool: true,
    caption: 'Sink the tip deeper to create a whirlpool. No new air — this polishes the foam into silky microfoam.' },
}

export function MilkAnimation() {
  const [phase, setPhase] = useState<Phase>('stretch')
  const p = PHASES[phase]
  const foamY = SURFACE
  const milkY = SURFACE + p.foamH

  return (
    <div>
      {/* tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        {(Object.keys(PHASES) as Phase[]).map((key) => (
          <button key={key} onClick={() => setPhase(key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              phase === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {PHASES[key].label}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex justify-center">
        <svg viewBox="0 0 220 150" className="w-full max-w-xs">
          <defs>
            <clipPath id="milk-pitcher">
              <path d="M61 41 L57 112 Q57 120 67 120 L143 120 Q153 120 153 112 L149 41 Z" />
            </clipPath>
          </defs>
          {/* pitcher body */}
          <path d="M60 40 L56 112 Q56 122 68 122 L142 122 Q154 122 154 112 L150 40 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          {/* spout */}
          <path d="M150 52 L186 62 L186 72 L150 66 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          {/* handle */}
          <path d="M60 60 Q34 64 36 92 Q38 110 58 106" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          {/* liquid milk */}
          <motion.rect x="56" width="98" fill="#fef9c3" clipPath="url(#milk-pitcher)"
            initial={false} animate={{ y: milkY, height: 122 - milkY }} transition={{ duration: 0.6 }} />
          {/* foam layer */}
          <motion.rect x="56" width="98" fill="white" opacity="0.95" clipPath="url(#milk-pitcher)"
            initial={false} animate={{ y: foamY, height: p.foamH }} transition={{ duration: 0.6 }} />
          <line x1="56" y1={milkY} x2="154" y2={milkY} stroke="#fde68a" strokeWidth="1" />
          {/* whirlpool (roll only) */}
          <motion.path d="M92 96 a18 8 0 1 1 36 0 a14 6 0 1 1 -28 0" fill="none" stroke="#eab308" strokeWidth="1.5"
            style={{ originX: '110px', originY: '96px' }}
            animate={p.whirlpool ? { opacity: 0.8, rotate: 360 } : { opacity: 0, rotate: 0 }}
            transition={p.whirlpool ? { rotate: { repeat: Infinity, duration: 2, ease: 'linear' }, opacity: { duration: 0.4 } } : { duration: 0.3 }} />
          {/* steam wand */}
          <line x1="150" y1="8" x2="112" y2={p.tipY - 6} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          <motion.circle r="3.5" fill="#64748b" cx="110" initial={false} animate={{ cy: p.tipY }} transition={{ duration: 0.6 }} />
          {/* depth marker */}
          <motion.g initial={false} animate={{ y: p.tipY }} transition={{ duration: 0.6 }}>
            <line x1="160" y1="0" x2="172" y2="0" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="176" y="3" fontSize="8" fill="#0ea5e9">tip</text>
          </motion.g>
        </svg>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-3">{p.caption}</p>

      {/* right/wrong depth hints */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too deep<br /><span className="text-red-400">no foam</span></div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700">✓ Right<br /><span className="text-green-500">fine microfoam</span></div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700">✗ Too shallow<br /><span className="text-red-400">big bubbles</span></div>
      </div>

      <p className="text-xs text-slate-400 text-center">Target ~60–65 °C — when the jug is too hot to hold, you're done.</p>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- MilkAnimation --run`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/animations/MilkAnimation.tsx src/__tests__/MilkAnimation.test.tsx
git commit -m "feat: rebuild milk animation with stretch/roll steaming phases

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Rebuild LatteHeartAnimation (split side scene + top)

Side = cup (scene look, with handle) + tilted pitcher whose **height** changes per phase. Top = white blob growing then a heart forming via `pathLength` draw. Synced via `usePhaseTimeline`.

**Files:**
- Modify (rewrite): `src/components/animations/LatteHeartAnimation.tsx`
- Test: `src/__tests__/LatteHeartAnimation.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/LatteHeartAnimation.test.tsx
import { render, screen, act } from '@testing-library/react'
import { LatteHeartAnimation } from '../components/animations/LatteHeartAnimation'

describe('LatteHeartAnimation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('renders the three phase chips and a replay button', () => {
    render(<LatteHeartAnimation />)
    expect(screen.getByText(/mix in/i)).toBeInTheDocument()
    expect(screen.getByText(/float/i)).toBeInTheDocument()
    expect(screen.getByText(/pull through/i)).toBeInTheDocument()
    // playback starts on mount (button reads "Pouring…"); run it to the end
    act(() => { vi.advanceTimersByTime(5400) })
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })

  test('shows the first caption once playback starts', () => {
    render(<LatteHeartAnimation />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByText(/pour from a height/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- LatteHeartAnimation --run`
Expected: FAIL — old component has different labels and no phase chips.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/animations/LatteHeartAnimation.tsx
import { motion } from 'framer-motion'
import { usePhaseTimeline } from './usePhaseTimeline'

type Phase = {
  chip: string
  caption: string
  pitcherY: number  // side: vertical offset of pitcher group (higher number = lower pitcher)
  blobR: number     // top: white blob radius
  heart: boolean    // top: heart formed
}

const PHASES: Phase[] = [
  { chip: '1. Mix in',       caption: 'Pour from a height with a thin stream to mix milk into the crema', pitcherY: 0,  blobR: 5,  heart: false },
  { chip: '2. Float',        caption: 'Lower the pitcher close to the surface — a white circle floats up', pitcherY: 34, blobR: 30, heart: false },
  { chip: '3. Pull through', caption: 'Lift and draw forward through the center to finish the heart point', pitcherY: 14, blobR: 30, heart: true },
]

const HEART = 'M60 46 C60 36 46 36 46 48 C46 60 60 68 60 80 C60 68 74 60 74 48 C74 36 60 36 60 46'

export function LatteHeartAnimation() {
  const { phase, playing, replay } = usePhaseTimeline(PHASES.length, 1800)
  const active = phase >= 0 ? PHASES[phase] : PHASES[0]
  const streaming = phase === 0 || phase === 1

  return (
    <div>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* SIDE — scene */}
        <div className="flex-1">
          <svg viewBox="0 0 240 150" className="w-full">
            {/* pitcher group, height varies by phase */}
            <motion.g initial={false} animate={{ y: active.pitcherY }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
              <g transform="translate(116 12) rotate(30)">
                <path d="M0 0 L36 0 L33 28 Q33 32 28 32 L5 32 Q0 32 0 28 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M36 5 L46 2 L43 9 L34 11 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <path d="M0 7 Q-10 10 -8 20" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </g>
            </motion.g>
            {/* milk stream */}
            <motion.path d="M150 48 Q146 78 140 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
              animate={{ opacity: streaming ? 1 : 0 }} transition={{ duration: 0.3 }} />
            {/* cup */}
            <path d="M78 100 Q78 142 120 142 Q162 142 162 100 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="42" ry="11" fill="#78350f" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="30" ry="7" fill="#c9a66b" />
            <path d="M162 110 Q188 110 188 122 Q188 134 162 130" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            <text x="120" y="148" textAnchor="middle" fontSize="9" fill="#64748b">Side — pitcher height</text>
          </svg>
        </div>

        {/* TOP — pattern forms */}
        <div className="flex-1">
          <svg viewBox="0 0 120 132" className="w-full">
            <circle cx="60" cy="60" r="50" fill="#78350f" />
            <circle cx="60" cy="60" r="47" fill="#854d24" />
            {/* white blob (phases 1-2) */}
            <motion.circle cx="60" fill="white"
              initial={false}
              animate={{ r: active.heart ? 0 : active.blobR, cy: 62, opacity: active.heart ? 0 : 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }} />
            {/* heart fill + pull-through draw (phase 3) */}
            <motion.path d={HEART} fill="white"
              initial={false} animate={{ opacity: active.heart ? 1 : 0 }} transition={{ duration: 0.5 }} />
            <motion.path d="M60 30 L60 82" stroke="#fde68a" strokeWidth="2" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: active.heart ? 1 : 0, opacity: active.heart ? 0.7 : 0 }}
              transition={{ duration: 0.6 }} />
            <text x="60" y="126" textAnchor="middle" fontSize="9" fill="#64748b">Top — heart forms</text>
          </svg>
        </div>
      </div>

      {/* caption */}
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 mb-4 min-h-[3rem]">
        {phase >= 0 ? active.caption : 'Starting…'}
      </p>

      {/* chips */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
        {PHASES.map((p, i) => (
          <div key={p.chip}
            className={`rounded-lg p-2 font-semibold transition-colors ${
              i === phase ? 'bg-orange-100 border border-orange-300 text-orange-700'
              : i < phase ? 'bg-orange-50 border border-orange-200 text-orange-600'
              : 'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>
            {p.chip}
          </div>
        ))}
      </div>

      <button onClick={replay} disabled={playing}
        className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
        {playing ? 'Pouring…' : '↺ Replay'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- LatteHeartAnimation --run`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/animations/LatteHeartAnimation.tsx src/__tests__/LatteHeartAnimation.test.tsx
git commit -m "feat: rebuild latte heart animation with pitcher-height + pathLength draw

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Update animation metadata copy

Refresh `/animate` overview descriptions/tags to match the rebuilt content. **Do not change `id` or `title` values** (the `AnimateDetail` and `animationContent` tests assert them).

**Files:**
- Modify: `src/utils/animationContent.ts`
- Test: `src/__tests__/animationContent.test.ts` (existing — must still pass unchanged)

- [ ] **Step 1: Edit metadata**

In `src/utils/animationContent.ts`, update only the `description` and `tags` of the `v60`, `milk`, and `latte-heart` entries (leave `id`, `title`, `icon`):

```ts
  {
    id: 'v60',
    title: 'V60 Pour Pattern',
    icon: '🌊',
    description: 'Top + side view: pour spiral and water level',
    tags: ['Bloom', 'Pour 1', 'Pour 2', 'Pour 3', 'Drain'],
  },
  {
    id: 'milk',
    title: 'Milk Steaming',
    icon: '🥛',
    description: 'Stretch vs roll — wand depth and foam',
    tags: ['Stretch', 'Roll', 'Microfoam'],
  },
  {
    id: 'latte-heart',
    title: 'Latte Art Heart',
    icon: '❤️',
    description: 'Pitcher height + the heart forming',
    tags: ['Mix in', 'Float', 'Pull through'],
  },
```

- [ ] **Step 2: Run the metadata + detail tests**

Run: `npm test -- animationContent AnimateDetail Animate --run`
Expected: PASS (existing tests still green — ids/titles/length unchanged)

- [ ] **Step 3: Commit**

```bash
git add src/utils/animationContent.ts
git commit -m "feat: update /animate overview copy for rebuilt animations

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Full verification + docs

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Typecheck + full test suite**

Run: `npm run build && npm test -- --run`
Expected: build succeeds (tsc clean), all tests pass.

- [ ] **Step 2: Manual visual check**

Run: `npm run dev`, open each of `/animate/v60`, `/animate/milk`, `/animate/latte-heart`.
Verify against the quality bar:
- No overlapping shapes; labels sit outside fills.
- Exactly one phase visibly active at a time; chips/tabs highlight correctly.
- V60: cone is `▼`, bed at the point, water rises on pours and drops on drain; top dot spirals.
- Milk: wand tip shallow on Stretch / deep on Roll; foam layer visible; whirlpool only on Roll.
- Latte: pitcher height changes per phase; top blob grows then heart appears cleanly.
- No console errors.

If anything overlaps or reads unclearly, adjust the SVG coordinates in the relevant component and re-check.

- [ ] **Step 3: Update CLAUDE.md**

In `CLAUDE.md`, update the animations notes: V60/Milk/Latte rebuilt with **Framer Motion** (declarative `motion.*`, `pathLength` for path draw, `usePhaseTimeline` for timed playback); AnimeJS retained only for BoilerAnimation. Update the `animationContent.ts` tag list note (Stretch/Roll, Mix in/Float/Pull through, V60 5 phases). Note new files `usePhaseTimeline.ts`.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: record framer-motion animation rebuild in CLAUDE.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Notes for the implementer

- **jsdom + framer-motion:** renders fine; animations settle without real RAF. Tests assert text/buttons/tab-switching, never pixel positions. `pathLength` in framer-motion uses the SVG `pathLength` attribute trick (not `getTotalLength`), so it does not crash in jsdom.
- **Visual polish is expected during Task 7.** The SVG coordinates here produce a correct, clean first version; nudging numbers for spacing/alignment is part of the job, not a deviation from the plan.
- **Keep Boiler untouched.** Do not remove `animejs`.
