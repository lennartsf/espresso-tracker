export const GRINDER_TYPES = [
  { value: 'flat',    label: 'Flachscheibe' },
  { value: 'conical', label: 'Kegelscheibe' },
] as const

export const FUNKTIONSWEISE_TYPES = [
  { value: 'einkreiser',  label: 'Einkreiser' },
  { value: 'zweikreiser', label: 'Zweikreiser' },
  { value: 'dualboiler',  label: 'Dualboiler' },
  { value: 'thermoblock', label: 'Thermoblock' },
] as const

export function grinderTypeLabel(value: string): string {
  return GRINDER_TYPES.find(g => g.value === value)?.label ?? value
}

export function funktionsweiseLabel(value: string): string {
  return FUNKTIONSWEISE_TYPES.find(f => f.value === value)?.label ?? value
}
