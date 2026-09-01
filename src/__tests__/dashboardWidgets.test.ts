import {
  reconcileLayout, moveEntry, toggleEntry, widgetLabel,
  DEFAULT_LAYOUT, DASHBOARD_WIDGETS,
} from '../utils/dashboardWidgets'

const ids = () => DASHBOARD_WIDGETS.map(w => w.id)

test('an empty or unknown stored value falls back to the default layout', () => {
  // Lieber die Standardreihenfolge als eine leere Seite.
  expect(reconcileLayout(null)).toEqual(DEFAULT_LAYOUT)
  expect(reconcileLayout(undefined)).toEqual(DEFAULT_LAYOUT)
  expect(reconcileLayout('nonsense')).toEqual(DEFAULT_LAYOUT)
  expect(reconcileLayout({ id: 'flavor-dial' })).toEqual(DEFAULT_LAYOUT)
})

test('a stored order is preserved', () => {
  const stored = [
    { id: 'week-shots', visible: true },
    { id: 'flavor-dial', visible: false },
    { id: 'shots-per-day', visible: true },
    { id: 'ratio-bar', visible: true },
  ]
  expect(reconcileLayout(stored)).toEqual(stored)
})

// ── Die Faelle, die der Geraete-Sync erzeugt ────────────────────────────────
// Ein anderes Geraet kann ein Layout einer aelteren oder neueren App-Version
// geschrieben haben. Ohne diese Kur braeche das Dashboard nach jedem Release
// auf dem zweitgenutzten Geraet.

test('a widget that no longer exists is dropped', () => {
  const stored = [
    { id: 'correlation-scatter', visible: true },  // gab es mal
    { id: 'flavor-dial', visible: true },
  ]
  const result = reconcileLayout(stored)
  expect(result.map(e => e.id)).not.toContain('correlation-scatter')
  expect(result.map(e => e.id).sort()).toEqual(ids().sort())
})

test('a widget the stored layout never heard of is appended and visible', () => {
  // Ein neues Widget soll man sehen, nicht suchen muessen.
  const stored = [{ id: 'flavor-dial', visible: true }]
  const result = reconcileLayout(stored)
  expect(result[0].id).toBe('flavor-dial')
  expect(result.map(e => e.id).sort()).toEqual(ids().sort())
  for (const e of result.slice(1)) expect(e.visible).toBe(true)
})

test('a duplicated id keeps only its first occurrence', () => {
  // Sonst rendert dasselbe Widget zweimal und React stolpert ueber den Key.
  const stored = [
    { id: 'flavor-dial', visible: false },
    { id: 'flavor-dial', visible: true },
  ]
  const result = reconcileLayout(stored)
  expect(result.filter(e => e.id === 'flavor-dial')).toHaveLength(1)
  expect(result[0].visible).toBe(false)
})

test('entries without a usable id are skipped, not crashed on', () => {
  const stored = [null, 42, { visible: true }, { id: 7 }, { id: 'ratio-bar', visible: true }]
  const result = reconcileLayout(stored)
  expect(result[0].id).toBe('ratio-bar')
  expect(result).toHaveLength(DASHBOARD_WIDGETS.length)
})

test('a missing visible flag counts as visible', () => {
  // Ein aelteres Format ohne das Feld darf nicht alles ausblenden.
  const result = reconcileLayout([{ id: 'flavor-dial' }])
  expect(result[0].visible).toBe(true)
})

test('reconcile always returns every widget exactly once', () => {
  const result = reconcileLayout([{ id: 'week-shots', visible: false }])
  expect(result).toHaveLength(DASHBOARD_WIDGETS.length)
  expect(new Set(result.map(e => e.id)).size).toBe(DASHBOARD_WIDGETS.length)
})

// ── Bedienung ───────────────────────────────────────────────────────────────

test('moveEntry swaps with the neighbour', () => {
  const l = [{ id: 'a', visible: true }, { id: 'b', visible: true }, { id: 'c', visible: true }]
  expect(moveEntry(l, 'b', -1).map(e => e.id)).toEqual(['b', 'a', 'c'])
  expect(moveEntry(l, 'b', 1).map(e => e.id)).toEqual(['a', 'c', 'b'])
})

test('moveEntry at the edges does nothing instead of throwing', () => {
  const l = [{ id: 'a', visible: true }, { id: 'b', visible: true }]
  expect(moveEntry(l, 'a', -1)).toEqual(l)
  expect(moveEntry(l, 'b', 1)).toEqual(l)
  expect(moveEntry(l, 'missing', 1)).toEqual(l)
})

test('moveEntry does not mutate its input', () => {
  const l = [{ id: 'a', visible: true }, { id: 'b', visible: true }]
  const before = JSON.stringify(l)
  moveEntry(l, 'a', 1)
  expect(JSON.stringify(l)).toBe(before)
})

test('toggleEntry flips only the named entry', () => {
  const l = [{ id: 'a', visible: true }, { id: 'b', visible: true }]
  const next = toggleEntry(l, 'a')
  expect(next[0].visible).toBe(false)
  expect(next[1].visible).toBe(true)
  expect(l[0].visible).toBe(true) // Original unveraendert
})

test('every widget id has a label', () => {
  for (const w of DASHBOARD_WIDGETS) {
    expect(widgetLabel(w.id)).toBe(w.label)
    expect(widgetLabel(w.id)).not.toBe(w.id)
  }
})

test('an unknown id degrades to showing the id itself', () => {
  expect(widgetLabel('gone')).toBe('gone')
})

test('widget ids are unique — they are a data contract with the database', () => {
  expect(new Set(ids()).size).toBe(ids().length)
})
