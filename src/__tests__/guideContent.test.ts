import { GUIDES } from '../utils/guideContent'

test('GUIDES enthält genau 6 Einträge', () => {
  expect(GUIDES).toHaveLength(6)
})

test('alle Guides haben Pflichtfelder', () => {
  for (const guide of GUIDES) {
    expect(guide.id).toBeTruthy()
    expect(guide.title).toBeTruthy()
    expect(guide.icon).toBeTruthy()
    expect(guide.description).toBeTruthy()
    expect(guide.quickProblems.length).toBeGreaterThan(0)
    expect(guide.steps.length).toBeGreaterThan(0)
    expect(guide.troubleshooting.length).toBeGreaterThan(0)
  }
})

test('alle quickProblem.targetId referenzieren existierende Troubleshooting-IDs', () => {
  for (const guide of GUIDES) {
    const ids = new Set(guide.troubleshooting.map(t => t.id))
    for (const qp of guide.quickProblems) {
      expect(ids.has(qp.targetId)).toBe(true)
    }
  }
})

test('GUIDES enthält alle 6 erwarteten IDs', () => {
  const ids = GUIDES.map(g => g.id)
  expect(ids).toContain('espresso')
  expect(ids).toContain('french-press')
  expect(ids).toContain('v60')
  expect(ids).toContain('aeropress')
  expect(ids).toContain('moka-pot')
  expect(ids).toContain('milch')
})
