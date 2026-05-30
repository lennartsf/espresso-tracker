export const BREW_METHODS = [
  { value: 'french_press', label: 'French Press' },
  { value: 'v60',          label: 'V60' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'moka_pot',     label: 'Moka Pot' },
] as const

export const BREW_METHOD_INFO: Record<string, string> = {
  french_press: 'Coarsely ground coffee steeps for ~4 min in hot water — then press the plunger. Optional: stir once after 1 min.',
  v60:          'Pour-over filter: pour water in circular motions. Bloom (30–45 s) lets CO₂ escape and improves extraction.',
  aeropress:    'Quick brew under gentle pressure — short brew time (1–2 min), low bitterness. Inverted: coffee steeps longer before pressing.',
  moka_pot:     'Espresso-style coffee via steam pressure on the stovetop. No pressure adjustment — heat controls extraction.',
}

export function brewMethodLabel(value: string): string {
  return BREW_METHODS.find(m => m.value === value)?.label ?? value
}
