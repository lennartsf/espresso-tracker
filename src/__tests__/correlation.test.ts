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
