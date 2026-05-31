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
