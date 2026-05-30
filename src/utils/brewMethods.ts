export const BREW_METHODS = [
  { value: 'french_press', label: 'French Press' },
  { value: 'v60',          label: 'V60' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'moka_pot',     label: 'Moka Pot' },
] as const

export const BREW_METHOD_INFO: Record<string, string> = {
  french_press: 'Grob gemahlener Kaffee zieht ~4 min in heißem Wasser — dann Stempel drücken. Optional: nach 1 min einmal umrühren.',
  v60:          'Pour-Over-Filter: Wasser in kreisenden Bewegungen gießen. Bloom (30–45 s) lässt CO₂ entweichen und verbessert die Extraktion.',
  aeropress:    'Schnelles Brühen unter sanftem Druck — kurze Brühzeit (1–2 min), wenig Bitterkeit. Inverted: Kaffee zieht länger bevor gepresst wird.',
  moka_pot:     'Espresso-ähnlicher Kaffee durch Dampfdruck im Herdkännchen. Kein Druck einstellen — Hitze bestimmt die Extraktion.',
}

export function brewMethodLabel(value: string): string {
  return BREW_METHODS.find(m => m.value === value)?.label ?? value
}
