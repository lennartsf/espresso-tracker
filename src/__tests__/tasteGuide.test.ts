import {
  ESPRESSO_GOALS, BREW_GOALS, LEVERS, ratioOf,
  evaluateAgreement, diagnoseShot, ESPRESSO_THEORY,
} from '../utils/tasteGuide'
import type { Shot } from '../types'
import type { RecipeStats } from '../utils/recipeCalc'

function shot(over: Partial<Shot> = {}): Shot {
  return {
    id: 'x', coffee_id: 'c', roast_date_id: null, grind_setting: 10,
    dose_g: 18, yield_g: 36, brew_time_s: 28, temp_c: 93, rating: 7,
    body_score: 5, acidity_score: 5, bitterness_score: 5, preinfusion_s: null,
    brew_ratio: 2, pressure_bar: 9, tasting_notes: null,
    used_rdt: false, used_wdt: false, used_leveler: false,
    grinder_id: null, machine_id: null, basket_id: null,
    drink_type: 'espresso', milk_type: null, milk_ml: null,
    pulled_at: '2026-06-19', created_at: '2026-06-19', ...over,
  }
}

describe('ratioOf', () => {
  test('prefers brew_ratio field', () => {
    expect(ratioOf(shot({ brew_ratio: 2.5 }))).toBe(2.5)
  })
  test('falls back to yield/dose', () => {
    expect(ratioOf(shot({ brew_ratio: null, dose_g: 20, yield_g: 50 }))).toBe(2.5)
  })
  test('null when dose missing', () => {
    expect(ratioOf(shot({ brew_ratio: null, dose_g: null }))).toBeNull()
  })
})

describe('taste goals', () => {
  test('espresso has the five goals incl. both body directions', () => {
    const ids = ESPRESSO_GOALS.map(g => g.id)
    expect(ids).toEqual(['less-acidity', 'more-acidity', 'less-bitter', 'more-body', 'less-body'])
  })
  test('brews drop body goals (no body_score)', () => {
    expect(BREW_GOALS.some(g => g.metric === 'body_score')).toBe(false)
  })
  test('less-acidity raises extraction: finer grind is the first lever', () => {
    const g = ESPRESSO_GOALS.find(g => g.id === 'less-acidity')!
    expect(g.adjustments[0]).toMatchObject({ lever: 'grind', direction: 'finer' })
  })
  test('grind adjustments never claim a data sign (grinder-dependent)', () => {
    for (const g of ESPRESSO_GOALS)
      for (const a of g.adjustments)
        if (a.lever === 'grind') expect(a.expectedSign).toBeNull()
  })
  test('temp for less-acidity expects negative corr (hotter → less sour)', () => {
    const g = ESPRESSO_GOALS.find(g => g.id === 'less-acidity')!
    expect(g.adjustments.find(a => a.lever === 'temp')!.expectedSign).toBe(-1)
  })
})

describe('LEVERS.valueOf', () => {
  test('ratio lever reads brew_ratio', () => {
    expect(LEVERS.ratio.valueOf(shot({ brew_ratio: 2.3 }))).toBe(2.3)
  })
  test('temp lever reads temp_c', () => {
    expect(LEVERS.temp.valueOf(shot({ temp_c: 94 }))).toBe(94)
  })
})

describe('evaluateAgreement', () => {
  const pts = (ys: number[]) => ys.map((y, i) => ({ x: i, y }))
  test('not enough data → enough:false, agrees:null', () => {
    const a = evaluateAgreement(pts([1, 2, 3]), -1)
    expect(a.enough).toBe(false)
    expect(a.agrees).toBeNull()
  })
  test('agrees when sign matches expected and correlation is strong', () => {
    // perfectly negative corr, expected -1 → agrees
    const a = evaluateAgreement([{ x: 1, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }, { x: 5, y: 1 }], -1)
    expect(a.agrees).toBe(true)
    expect(a.r).toBeLessThan(0)
  })
  test('disagrees when sign is opposite', () => {
    const a = evaluateAgreement([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }], -1)
    expect(a.agrees).toBe(false)
  })
  test('expectedSign null → agrees stays null even with data', () => {
    const a = evaluateAgreement([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }], null)
    expect(a.enough).toBe(true)
    expect(a.agrees).toBeNull()
  })
})

describe('diagnoseShot', () => {
  const noBest: RecipeStats | null = null

  test('falls back to theory windows when no best shots', () => {
    const devs = diagnoseShot(shot({ brew_ratio: 2.2, brew_time_s: 28, temp_c: 93 }), noBest)
    expect(devs.every(d => d.source === 'theory')).toBe(true)
    expect(devs.every(d => d.status === 'ok')).toBe(true)
  })

  test('flags a fast, short-ratio shot as low with hints', () => {
    const devs = diagnoseShot(shot({ brew_ratio: 1.6, brew_time_s: 18, temp_c: 93 }), noBest)
    const ratio = devs.find(d => d.lever === 'ratio')!
    const time = devs.find(d => d.lever === 'time')!
    expect(ratio.status).toBe('low')
    expect(time.status).toBe('low')
    expect(time.hint).toMatch(/finer/i)
  })

  test('uses your-best window when provided', () => {
    const best: RecipeStats = {
      grindMin: 10, grindMax: 12, avgDose: 18, avgYield: 45,
      brewTimeMin: 27, brewTimeMax: 30, avgTemp: 94, avgPressure: 9,
      avgRating: 9, shotCount: 5,
    }
    // ratio 45/18 = 2.5 best → a 2.0 shot is below window → low, source your-best
    const devs = diagnoseShot(shot({ brew_ratio: 2.0 }), best)
    const ratio = devs.find(d => d.lever === 'ratio')!
    expect(ratio.source).toBe('your-best')
    expect(ratio.status).toBe('low')
  })
})

test('ESPRESSO_THEORY windows are sane', () => {
  expect(ESPRESSO_THEORY.ratio.min).toBeLessThan(ESPRESSO_THEORY.ratio.max)
  expect(ESPRESSO_THEORY.temp.min).toBeLessThan(ESPRESSO_THEORY.temp.max)
})
