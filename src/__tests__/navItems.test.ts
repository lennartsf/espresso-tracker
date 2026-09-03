import {
  reconcileNav, primaryNav, overflowNav, navLabel,
  DEFAULT_NAV, NAV_ITEMS, PRIMARY_SLOTS,
} from '../utils/navItems'

test('a stored order is kept as it is', () => {
  const stored = [
    { id: 'shots', visible: true },
    { id: 'home', visible: true },
  ]
  const out = reconcileNav(stored)
  expect(out.slice(0, 2).map(e => e.id)).toEqual(['shots', 'home'])
})

test('home can sit in the middle of the bottom bar', () => {
  // Der ausdrueckliche Wunsch: Home muss verschiebbar sein.
  const stored = [
    { id: 'shots', visible: true },
    { id: 'brews', visible: true },
    { id: 'home', visible: true },
    { id: 'analysis', visible: true },
  ]
  expect(primaryNav(reconcileNav(stored)).map(e => e.id))
    .toEqual(['shots', 'brews', 'home', 'analysis'])
})

test('unknown ids are dropped instead of leaving a dead slot', () => {
  const out = reconcileNav([{ id: 'from-the-future', visible: true }, { id: 'home', visible: true }])
  expect(out.map(e => e.id)).not.toContain('from-the-future')
  expect(out[0].id).toBe('home')
})

test('missing entries are appended, visible — a new page should be findable', () => {
  const out = reconcileNav([{ id: 'home', visible: true }])
  expect(out).toHaveLength(NAV_ITEMS.length)
  expect(out.find(e => e.id === 'glossary')).toEqual({ id: 'glossary', visible: true })
})

test('duplicate ids keep only their first occurrence', () => {
  const out = reconcileNav([
    { id: 'home', visible: true },
    { id: 'home', visible: false },
  ])
  expect(out.filter(e => e.id === 'home')).toHaveLength(1)
  expect(out[0].visible).toBe(true)
})

test('garbage falls back to the default instead of an empty navigation', () => {
  for (const junk of [null, 'nope', 42, {}, [1, 2, 3]]) {
    expect(reconcileNav(junk)).toEqual(DEFAULT_NAV)
  }
})

test('hiding EVERYTHING falls back to the default — you must not lock yourself out', () => {
  // Sonst gaebe es keinen Knopf mehr, ueber den man es zuruecknehmen koennte.
  const allHidden = NAV_ITEMS.map(i => ({ id: i.id, visible: false }))
  expect(reconcileNav(allHidden)).toEqual(DEFAULT_NAV)
})

test('the bottom bar takes exactly the first four VISIBLE entries', () => {
  const layout = reconcileNav([
    { id: 'home', visible: false },
    { id: 'shots', visible: true },
    { id: 'brews', visible: true },
    { id: 'analysis', visible: true },
    { id: 'coffees', visible: true },
    { id: 'roasters', visible: true },
  ])
  const bar = primaryNav(layout)
  expect(bar).toHaveLength(PRIMARY_SLOTS)
  expect(bar.map(e => e.id)).toEqual(['shots', 'brews', 'analysis', 'coffees'])
  expect(bar.every(e => e.visible)).toBe(true)
})

test('hidden entries appear in neither the bar nor More', () => {
  const layout = reconcileNav(
    NAV_ITEMS.map(i => ({ id: i.id, visible: i.id !== 'glossary' })),
  )
  const shown = [...primaryNav(layout), ...overflowNav(layout)].map(e => e.id)
  expect(shown).not.toContain('glossary')
})

test('every registry entry has a label', () => {
  for (const i of NAV_ITEMS) expect(navLabel(i.id)).toBe(i.label)
})

test('ids are unique — they are a data contract', () => {
  const ids = NAV_ITEMS.map(i => i.id)
  expect(new Set(ids).size).toBe(ids.length)
})
